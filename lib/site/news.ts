import { client } from "@/sanity/lib/client"
import { CATEGORY_LABELS, REGIONS, sectionForCategoryKey, SITE_URL } from "./config"

export type StoryImage = {
  url: string
  width: number
  height: number
  alt: string
  caption?: string
  // true for the generated TNN editorial graphic used when a story has no photo
  graphic?: boolean
}

export type Story = {
  id: string
  title: string
  slug: string
  summary: string
  publishedAt: string
  updatedAt: string
  region?: string
  regionTitle?: string
  archived: boolean
  categoryKey?: string
  categoryLabel?: string
  sectionSlug?: string
  author?: { name: string; slug?: string }
  image: StoryImage
  readTime?: string
  tags: string[]
}

export type FullStory = Story & {
  content?: unknown[]
  plainText: string
  sources: { title: string; url: string }[]
}

type RawStory = {
  _id: string
  _updatedAt: string
  title: string
  slug: string
  summary?: string
  publishedAt: string
  region?: string
  archived?: boolean
  categoryKey?: string
  categoryTitle?: string
  author?: { name: string; slug?: string }
  image?: { url?: string; width?: number; height?: number; alt?: string; caption?: string }
  readTime?: string
  tags?: string[]
  content?: unknown[]
  plainText?: string
  sources?: { title?: string; url?: string }[]
}

// Only published stories with a slug and date reach the public site (the client uses the published perspective)
const PUBLIC_STORY = `_type == "newsItem" && defined(slug.current) && defined(publishedAt)`

const STORY_FIELDS = `
  _id, _updatedAt, title, "slug": slug.current, "summary": excerpt, publishedAt, region, archived,
  "categoryKey": categories[0]->key, "categoryTitle": categories[0]->title,
  "author": author->{name, "slug": slug.current},
  "image": mainImage{alt, caption, "url": asset->url,
    "width": asset->metadata.dimensions.width, "height": asset->metadata.dimensions.height},
  readTime, "tags": tags[]->title`

const FULL_STORY_FIELDS = `${STORY_FIELDS}, content, "plainText": pt::text(content), "sources": sources[]{title, url}`

function toStory(raw: RawStory): Story {
  const region = REGIONS.find((r) => r.slug === raw.region)
  const categoryLabel = raw.categoryKey ? (CATEGORY_LABELS[raw.categoryKey] ?? raw.categoryTitle) : raw.categoryTitle
  const image: StoryImage =
    raw.image?.url && raw.image.width && raw.image.height
      ? {
          url: raw.image.url,
          width: raw.image.width,
          height: raw.image.height,
          alt: raw.image.alt || raw.title,
          caption: raw.image.caption,
        }
      : {
          url: `/graphic/${raw.slug}`,
          width: 1200,
          height: 675,
          alt: `TNN editorial graphic: ${raw.title}`,
          caption: "Editorial graphic: The Narrative Network. No scene of the events is depicted.",
          graphic: true,
        }

  return {
    id: raw._id,
    title: raw.title,
    slug: raw.slug,
    summary: raw.summary ?? "",
    publishedAt: raw.publishedAt,
    updatedAt: raw._updatedAt,
    region: raw.region,
    regionTitle: region?.title,
    archived: Boolean(raw.archived),
    categoryKey: raw.categoryKey,
    categoryLabel,
    sectionSlug: sectionForCategoryKey(raw.categoryKey)?.slug,
    author: raw.author?.name ? raw.author : undefined,
    image,
    readTime: raw.readTime,
    tags: raw.tags?.filter(Boolean) ?? [],
  }
}

const options = { next: { revalidate: 60 } }

export async function getStories(filter = "", limit?: number): Promise<Story[]> {
  const range = limit ? `[0...${limit}]` : ""
  const raw = await client.fetch<RawStory[]>(
    `*[${PUBLIC_STORY}${filter ? ` && (${filter})` : ""}] | order(publishedAt desc)${range}{${STORY_FIELDS}}`,
    {},
    options,
  )
  return raw.map(toStory)
}

export async function getStoriesWith(filter: string, params: Record<string, unknown>, limit?: number) {
  const range = limit ? `[0...${limit}]` : ""
  const raw = await client.fetch<RawStory[]>(
    `*[${PUBLIC_STORY} && (${filter})] | order(publishedAt desc)${range}{${STORY_FIELDS}}`,
    params,
    options,
  )
  return raw.map(toStory)
}

export async function getStory(slug: string): Promise<FullStory | null> {
  const raw = await client.fetch<RawStory | null>(
    `*[${PUBLIC_STORY} && slug.current == $slug][0]{${FULL_STORY_FIELDS}}`,
    { slug },
    options,
  )
  if (!raw) return null
  return {
    ...toStory(raw),
    content: raw.content,
    plainText: raw.plainText ?? "",
    sources: (raw.sources ?? []).filter((s): s is { title: string; url: string } => Boolean(s.title && s.url)),
  }
}

// Cards show at most 177 characters of the summary, like the reference design
export function cardSummary(text: string) {
  return text.length > 178 ? `${text.slice(0, 177)}…` : text
}

export function readTimeFor(story: { readTime?: string; plainText?: string }) {
  if (story.readTime) return story.readTime.replace(/\s*min$/, " min read")
  const words = (story.plainText ?? "").split(/\s+/).filter(Boolean).length
  return `${Math.max(1, Math.round(words / 200))} min read`
}

export function storyUrl(slug: string, absolute = false) {
  return `${absolute ? SITE_URL : ""}/news/${slug}`
}

// Responsive Sanity image URLs at the widths the reference design uses
export function imageSources(image: StoryImage) {
  if (image.graphic) return { src: image.url, large: image.url, srcSet: undefined }
  const largest = Math.min(image.width, 1200)
  const widths = [...new Set([...[360, 720].filter((w) => w < largest), largest])]
  const at = (w: number) => `${image.url}?w=${w}&fm=webp&q=82`
  return {
    src: at(Math.min(720, largest)),
    large: at(largest),
    srcSet: widths.map((w) => `${at(w)} ${w}w`).join(","),
  }
}
