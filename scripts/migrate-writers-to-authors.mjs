// One-off migration: move old "writer" records onto "author" records.
//
// Writers used to be separate login records linked (optionally) to an author for the byline.
// Now an author has "portalAccess" and an invite code directly. For each writer this script:
//   1. uses its linked author, or creates an author with the writer's name
//   2. copies portal access and the invite code onto the author
//   3. moves the private login (writerAccount.<writerId>) to writerAccount.<authorId>
//   4. points every story's "submittedBy" (and a missing byline) at the author
//   5. deletes the old writer record
//
// Usage (needs SANITY_API_WRITE_TOKEN with Editor rights in .env.local):
//   node --env-file=.env.local scripts/migrate-writers-to-authors.mjs          # dry run
//   node --env-file=.env.local scripts/migrate-writers-to-authors.mjs --apply  # make changes

import { createClient } from '@sanity/client'

const apply = process.argv.includes('--apply')
const { NEXT_PUBLIC_SANITY_PROJECT_ID: projectId, NEXT_PUBLIC_SANITY_DATASET: dataset, SANITY_API_WRITE_TOKEN: token } =
  process.env

if (!projectId || !dataset || !token) {
  console.error('Set NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET and SANITY_API_WRITE_TOKEN')
  process.exit(1)
}

const client = createClient({ projectId, dataset, token, apiVersion: '2024-01-01', useCdn: false, perspective: 'raw' })

const slugify = (text) =>
  text
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 96)

// Published and draft copies of each writer; prefer the published one
const writers = await client.fetch(`*[_type == "writer"]{_id, name, author, active, accessCodeHash}`)
const byBaseId = new Map()
for (const w of writers) {
  const baseId = w._id.replace(/^drafts\./, '')
  if (!byBaseId.has(baseId) || !w._id.startsWith('drafts.')) byBaseId.set(baseId, { ...w, baseId })
}

if (byBaseId.size === 0) {
  console.log('No writer records found. Nothing to migrate.')
  process.exit(0)
}

console.log(`${apply ? 'Migrating' : 'Dry run for'} ${byBaseId.size} writer(s)\n`)

for (const writer of byBaseId.values()) {
  const tx = client.transaction()
  let authorId = writer.author?._ref

  if (authorId) {
    console.log(`- ${writer.name}: using linked author ${authorId}`)
  } else {
    authorId = crypto.randomUUID()
    console.log(`- ${writer.name}: creating a new author ${authorId}`)
    tx.create({
      _id: authorId,
      _type: 'author',
      name: writer.name,
      slug: { _type: 'slug', current: `${slugify(writer.name)}-${authorId.slice(0, 6)}` },
    })
  }

  const portal = { portalAccess: writer.active !== false }
  if (writer.accessCodeHash) portal.accessCodeHash = writer.accessCodeHash
  tx.patch(authorId, (p) => p.set(portal))

  // Move the private login so the writer can keep signing in with the same email and password
  const account = await client.fetch(`*[_id == $id][0]`, { id: `writerAccount.${writer.baseId}` })
  if (account) {
    const { _id, _rev, _createdAt, _updatedAt, ...rest } = account
    console.log(`    login for ${account.email} moves to the author`)
    tx.createOrReplace({ ...rest, _id: `writerAccount.${authorId}`, writerId: authorId })
    tx.delete(_id)
  }

  const stories = await client.fetch(`*[_type == "newsItem" && submittedBy._ref == $id]{_id, author}`, {
    id: writer.baseId,
  })
  for (const story of stories) {
    const set = { submittedBy: { _type: 'reference', _ref: authorId } }
    if (!story.author) set.author = { _type: 'reference', _ref: authorId }
    tx.patch(story._id, (p) => p.set(set))
  }
  console.log(`    ${stories.length} stor${stories.length === 1 ? 'y' : 'ies'} re-pointed`)

  // Stories no longer reference the writer, so it can be removed
  tx.delete(writer.baseId)
  tx.delete(`drafts.${writer.baseId}`)

  if (apply) {
    await tx.commit()
    console.log('    done')
  }
}

console.log(apply ? '\nMigration complete.' : '\nDry run only. Re-run with --apply to make these changes.')
