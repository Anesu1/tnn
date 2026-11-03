// Replace the stories on the site with a prepared set, in one careful pass:
//   1. back up the whole dataset to an .ndjson file
//   2. unpublish every currently published News story (they stay in the Studio as drafts,
//      exactly like the Studio's "Unpublish" action)
//   3. create any missing author profiles (bylines)
//   4. upload photos and publish the new stories
//
// The spec is a JSON file: { submittedBy: "<author name>", stories: [{ title, author, categoryKey,
//   region, summary, blocks: [{style, text}], photo?: {file, alt} }] }, newest story first.
//
// Usage (needs SANITY_API_WRITE_TOKEN with Editor rights in .env.local):
//   node --env-file=.env.local scripts/publish-stories.mjs <spec.json> <backup-dir>           # dry run
//   node --env-file=.env.local scripts/publish-stories.mjs <spec.json> <backup-dir> --apply   # make changes

import { createClient } from '@sanity/client'
import { randomUUID } from 'node:crypto'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const [specPath, backupDir] = process.argv.slice(2).filter((a) => !a.startsWith('--'))
const apply = process.argv.includes('--apply')
const { NEXT_PUBLIC_SANITY_PROJECT_ID: projectId, NEXT_PUBLIC_SANITY_DATASET: dataset, SANITY_API_WRITE_TOKEN: token } =
  process.env

if (!specPath || !backupDir) {
  console.error('Usage: node --env-file=.env.local scripts/publish-stories.mjs <spec.json> <backup-dir> [--apply]')
  process.exit(1)
}
if (!projectId || !dataset || !token) {
  console.error('Set NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET and SANITY_API_WRITE_TOKEN')
  process.exit(1)
}

const client = createClient({ projectId, dataset, token, apiVersion: '2024-01-01', useCdn: false, perspective: 'raw' })
const spec = JSON.parse(readFileSync(specPath, 'utf8'))
const key = () => randomUUID().replace(/-/g, '').slice(0, 12)
const slugify = (text) =>
  text
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 96)
const AUTHOR_SLUGS = { 'TNN Newsroom': 'tnn' }

console.log(apply ? 'APPLYING CHANGES\n' : 'DRY RUN (nothing will change; add --apply to make changes)\n')

// 1. Backup
mkdirSync(backupDir, { recursive: true })
const backupFile = join(backupDir, `sanity-${dataset}-${new Date().toISOString().replace(/[:.]/g, '-')}.ndjson`)
const exportRes = await fetch(`https://${projectId}.api.sanity.io/v2021-06-07/data/export/${dataset}`, {
  headers: { Authorization: `Bearer ${token}` },
})
if (!exportRes.ok) throw new Error(`Backup failed: ${exportRes.status} ${await exportRes.text()}`)
const backup = await exportRes.text()
writeFileSync(backupFile, backup)
console.log(`1. Backed up ${backup.split('\n').filter(Boolean).length} documents to ${backupFile}`)

// 2. Unpublish current stories
const published = await client.fetch(`*[_type == "newsItem" && !(_id in path("drafts.**"))]`)
const draftIds = new Set(await client.fetch(`*[_type == "newsItem" && _id in path("drafts.**")]._id`))
console.log(`2. Unpublishing ${published.length} published stor${published.length === 1 ? 'y' : 'ies'} (kept as drafts)`)
for (const doc of published) {
  const referencedBy = await client.fetch(`count(*[references($id) && !(_id in path("drafts.**"))])`, { id: doc._id })
  console.log(`   - ${doc.title}${draftIds.has(`drafts.${doc._id}`) ? ' (already has a draft)' : ''}${referencedBy ? ` [referenced by ${referencedBy}]` : ''}`)
  if (!apply) continue
  const { _rev, _createdAt, _updatedAt, ...content } = doc
  const tx = client.transaction()
  if (!draftIds.has(`drafts.${doc._id}`)) tx.createIfNotExists({ ...content, _id: `drafts.${doc._id}` })
  tx.delete(doc._id)
  await tx.commit()
}

// 3. Authors
const authorIds = {}
const neededAuthors = [...new Set([...spec.stories.map((s) => s.author), spec.submittedBy])]
console.log('3. Authors')
for (const name of neededAuthors) {
  const existing = await client.fetch(`*[_type == "author" && name == $name && !(_id in path("drafts.**"))][0]._id`, { name })
  if (existing) {
    authorIds[name] = existing
    console.log(`   - ${name}: existing profile`)
    continue
  }
  if (name === spec.submittedBy) throw new Error(`Submitting author "${name}" not found`)
  const id = randomUUID()
  authorIds[name] = id
  console.log(`   - ${name}: new profile /authors/${AUTHOR_SLUGS[name] ?? slugify(name)}`)
  if (apply) {
    await client.create({ _id: id, _type: 'author', name, slug: { _type: 'slug', current: AUTHOR_SLUGS[name] ?? slugify(name) } })
  }
}

// 4. Stories
const categories = Object.fromEntries(
  (await client.fetch(`*[_type == "category" && !(_id in path("drafts.**"))]{key, _id}`)).map((c) => [c.key, c._id]),
)
console.log('4. Publishing stories (newest first)')
const now = Date.now()
for (const [index, story] of spec.stories.entries()) {
  const slug = slugify(story.title)
  const taken = await client.fetch(`count(*[_type == "newsItem" && slug.current == $slug && !(_id in path("drafts.**"))])`, { slug })
  if (taken && apply) {
    console.log(`   - SKIPPED (already published): ${story.title}`)
    continue
  }
  if (!categories[story.categoryKey]) throw new Error(`Unknown section ${story.categoryKey}`)

  const words = story.blocks.reduce((n, b) => n + b.text.split(/\s+/).filter(Boolean).length, 0)
  const doc = {
    _id: randomUUID(),
    _type: 'newsItem',
    title: story.title,
    slug: { _type: 'slug', current: slug },
    // One minute apart so the order on the site follows the spec
    publishedAt: new Date(now - index * 60_000).toISOString(),
    readTime: `${Math.max(1, Math.round(words / 200))} min`,
    author: { _type: 'reference', _ref: authorIds[story.author] },
    submittedBy: { _type: 'reference', _ref: authorIds[spec.submittedBy] },
    excerpt: story.summary,
    categories: [{ _type: 'reference', _ref: categories[story.categoryKey], _key: key() }],
    region: story.region,
    archived: false,
    content: story.blocks.map((b) => ({
      _type: 'block',
      _key: key(),
      style: b.style,
      markDefs: [],
      children: [{ _type: 'span', _key: key(), text: b.text, marks: [] }],
    })),
  }

  console.log(`   - /news/${slug}  by ${story.author}${story.photo ? '  + photo' : ''}`)
  if (!apply) continue
  if (story.photo) {
    const asset = await client.assets.upload('image', readFileSync(story.photo.file), { filename: story.photo.file })
    doc.mainImage = { _type: 'image', asset: { _type: 'reference', _ref: asset._id }, alt: story.photo.alt }
  }
  await client.create(doc)
}

console.log(apply ? '\nDone.' : '\nDry run complete. Re-run with --apply to make these changes.')
