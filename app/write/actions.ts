'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { joinWithInvite, requireWriter, signIn, signOut } from '@/lib/writer-auth'
import { getWriteClient } from '@/sanity/lib/writeClient'

export type FormState = { error?: string }

const MAX_IMAGE_BYTES = 10 * 1024 * 1024
const MIN_PASSWORD_LENGTH = 8

// Turn server setup problems into a message on the form instead of a crashed page
function setupError(err: unknown): FormState {
  console.error('Writer portal error', err)
  const message = err instanceof Error ? err.message : String(err)
  const status = (err as { statusCode?: number })?.statusCode
  if (message.includes('SANITY_API_WRITE_TOKEN')) {
    return { error: 'The writer portal isn’t set up yet: the SANITY_API_WRITE_TOKEN setting is missing on the server. Please tell the site admin.' }
  }
  if (status === 401 || status === 403) {
    return { error: 'The writer portal’s Sanity token was rejected or doesn’t have Editor permissions. Please tell the site admin.' }
  }
  return { error: 'Something went wrong on our side. Please try again in a moment.' }
}

export async function signInAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const email = String(formData.get('email') ?? '').trim()
  const password = String(formData.get('password') ?? '')
  if (!email || !password) return { error: 'Enter your email and password.' }
  let ok: boolean
  try {
    ok = await signIn(email, password)
  } catch (err) {
    return setupError(err)
  }
  if (!ok) return { error: 'That email and password don’t match an active writer account.' }
  redirect('/write')
}

export async function joinAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const code = String(formData.get('code') ?? '').trim()
  const email = String(formData.get('email') ?? '').trim()
  const password = String(formData.get('password') ?? '')
  const confirm = String(formData.get('confirm') ?? '')

  if (!code) return { error: 'Enter the invite code your editor sent you.' }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: 'Enter a valid email address.' }
  if (password.length < MIN_PASSWORD_LENGTH) {
    return { error: `Choose a password with at least ${MIN_PASSWORD_LENGTH} characters.` }
  }
  if (password !== confirm) return { error: 'The two passwords don’t match.' }

  let result: Awaited<ReturnType<typeof joinWithInvite>>
  try {
    result = await joinWithInvite(code, email, password)
  } catch (err) {
    return setupError(err)
  }
  if (!result.ok) return { error: result.error }
  redirect('/write')
}

export async function signOutAction() {
  await signOut()
  redirect('/write/login')
}

function key() {
  return crypto.randomUUID().replace(/-/g, '').slice(0, 12)
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 96)
}

// Each line of the story becomes a paragraph block
function toBlocks(text: string) {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => ({
      _type: 'block',
      _key: key(),
      style: 'normal',
      markDefs: [],
      children: [{ _type: 'span', _key: key(), text: line, marks: [] }],
    }))
}

function readTime(text: string) {
  const words = text.split(/\s+/).filter(Boolean).length
  return `${Math.max(1, Math.round(words / 200))} min`
}

// Writers can only touch their own stories while they are still unpublished drafts
async function findOwnDraft(id: string, writerId: string) {
  if (!/^[A-Za-z0-9-]+$/.test(id)) return null
  return getWriteClient().fetch<{ _id: string; mainImage?: unknown } | null>(
    `*[_id == $draftId && submittedBy._ref == $writerId][0]{_id, mainImage}`,
    { draftId: `drafts.${id}`, writerId },
  )
}

export async function saveStoryAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const writer = await requireWriter()
  const client = getWriteClient()

  const id = String(formData.get('id') ?? '')
  const title = String(formData.get('title') ?? '').trim()
  const excerpt = String(formData.get('excerpt') ?? '').trim()
  const content = String(formData.get('content') ?? '').trim()
  const imageAlt = String(formData.get('imageAlt') ?? '').trim()
  const image = formData.get('image')
  const categoryIds = formData.getAll('categories').map(String)
  const region = String(formData.get('region') ?? '')

  // Match what the chief editor needs before publishing (see newsItemType validation)
  if (!title) return { error: 'Add a headline.' }
  if (!excerpt) return { error: 'Add a short summary of the story.' }
  // Same limit as the Studio's Summary field
  if (excerpt.length > 600) return { error: 'Keep the summary under 600 characters.' }
  if (categoryIds.length === 0) return { error: 'Choose at least one section.' }
  if (!['zimbabwe', 'africa', 'world'].includes(region)) return { error: 'Choose the region the story is from.' }
  if (!content) return { error: 'Write the story before submitting.' }

  const existing = id ? await findOwnDraft(id, writer._id) : null
  if (id && !existing) {
    return { error: 'This story has already been published or withdrawn, so it can’t be edited here.' }
  }
  const hasPhoto = (image instanceof File && image.size > 0) || Boolean(existing?.mainImage)
  if (hasPhoto && !imageAlt) return { error: 'Describe the photo for readers who can’t see it.' }
  const baseId = id || crypto.randomUUID()
  const draftId = `drafts.${baseId}`

  // Only allow references to categories that really exist
  const validCategories = await client.fetch<string[]>(
    `*[_type == "category" && _id in $ids && !(_id in path("drafts.**"))]._id`,
    { ids: categoryIds },
  )

  let slug = slugify(title) || baseId
  const slugTaken = await client.fetch<boolean>(
    `count(*[_type == "newsItem" && slug.current == $slug && !(_id in [$baseId, $draftId])]) > 0`,
    { slug, baseId, draftId },
  )
  if (slugTaken) slug = `${slug}-${baseId.slice(0, 6)}`

  const fields: Record<string, unknown> = {
    title,
    slug: { _type: 'slug', current: slug },
    excerpt,
    content: toBlocks(content),
    readTime: readTime(content),
    region,
    categories: validCategories.map((ref) => ({ _type: 'reference', _ref: ref, _key: key() })),
    submittedBy: { _type: 'reference', _ref: writer._id },
    // Every submission goes (back) into the chief editor's approval queue
    reviewStatus: 'submitted',
  }
  // Writers are author documents, so their own profile is the byline. Only set it on
  // first submission: the chief editor may change the byline while reviewing.
  if (!id) {
    fields.author = { _type: 'reference', _ref: writer._id }
  }

  if (image instanceof File && image.size > 0) {
    if (!image.type.startsWith('image/')) return { error: 'The photo must be an image file.' }
    if (image.size > MAX_IMAGE_BYTES) return { error: 'The photo must be smaller than 10 MB.' }
    const asset = await client.assets.upload('image', Buffer.from(await image.arrayBuffer()), {
      filename: image.name,
      contentType: image.type,
    })
    fields.mainImage = { _type: 'image', asset: { _type: 'reference', _ref: asset._id }, alt: imageAlt }
  } else if (existing?.mainImage) {
    // Keep the existing photo, but let the writer update its description
    fields['mainImage.alt'] = imageAlt
  }

  try {
    if (id) {
      await client.patch(draftId).set(fields).commit()
    } else {
      // "Published at" is filled in when the chief editor publishes (sanity/actions/setPublishedAt.ts)
      await client.create({ _id: draftId, _type: 'newsItem', ...fields })
    }
  } catch (err) {
    console.error('Failed to save story', err)
    return { error: 'Something went wrong saving your story. Please try again.' }
  }

  revalidatePath('/write')
  redirect('/write?saved=1')
}

export async function withdrawStoryAction(formData: FormData) {
  const writer = await requireWriter()
  const id = String(formData.get('id') ?? '')
  if (await findOwnDraft(id, writer._id)) {
    await getWriteClient().delete(`drafts.${id}`)
  }
  revalidatePath('/write')
  redirect('/write')
}
