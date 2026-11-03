import { CATEGORY_LABELS, formatDate, REGIONS } from "@/lib/site/config"
import { storyUrl } from "@/lib/site/news"
import { client } from "@/sanity/lib/client"

// Search index for /search, in the same shape as the reference design's stories.json
export const revalidate = 60

type Row = {
  title: string
  slug: string
  summary?: string
  body?: string
  topics?: string[]
  categoryKey?: string
  categoryTitle?: string
  region?: string
  publishedAt: string
  archived?: boolean
  image?: { url?: string; width?: number; height?: number; alt?: string }
}

export async function GET() {
  const rows = await client.fetch<Row[]>(
    `*[_type == "newsItem" && defined(slug.current) && defined(publishedAt)] | order(publishedAt desc){
      title, "slug": slug.current, "summary": excerpt, "body": pt::text(content), "topics": tags[]->title,
      "categoryKey": categories[0]->key, "categoryTitle": categories[0]->title, region, publishedAt, archived,
      "image": mainImage{alt, "url": asset->url, "width": asset->metadata.dimensions.width, "height": asset->metadata.dimensions.height}
    }`,
  )

  const stories = rows.map((row) => {
    const hasPhoto = Boolean(row.image?.url && row.image.width && row.image.height)
    const image = hasPhoto ? `${row.image!.url}?w=360&fm=webp&q=82` : `/graphic/${row.slug}`
    return {
      title: row.title,
      url: storyUrl(row.slug),
      summary: row.summary ?? "",
      body: (row.body ?? "").slice(0, 20000),
      topics: (row.topics ?? []).filter(Boolean),
      category: (row.categoryKey && CATEGORY_LABELS[row.categoryKey]) || row.categoryTitle || "",
      region: REGIONS.find((r) => r.slug === row.region)?.title ?? "",
      date: formatDate(row.publishedAt),
      archived: Boolean(row.archived),
      image,
      image_alt: hasPhoto ? row.image!.alt || row.title : `TNN editorial graphic: ${row.title}`,
    }
  })

  return Response.json(stories, { headers: { "Cache-Control": "public, max-age=60, s-maxage=300" } })
}
