import type { MetadataRoute } from "next"

import { REGIONS, SECTIONS, SITE_URL } from "@/lib/site/config"
import { MIN_LISTING_ITEMS } from "@/lib/site/metadata"
import { getStories, storyUrl, type Story } from "@/lib/site/news"
import { STORY_TYPE_PAGES } from "@/lib/site/story-type-pages"
import { getWatchPaths } from "@/lib/site/watch"
import { client } from "@/sanity/lib/client"

export const revalidate = 300

// Information pages that rarely change
const PAGES = [
  "/contact",
  "/about",
  "/editorial-standards",
  "/corrections",
  "/privacy",
  "/newsletter",
  "/partnerships",
  "/media-kit",
]

// Every live story, plus listing pages dated by their newest story, so search engines
// (Bing asks for accurate lastmod values) know which pages have changed
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [stories, watch, authorsWithBio] = await Promise.all([
    getStories(),
    getWatchPaths(),
    client.fetch<string[]>(`*[_type == "author" && defined(bio) && pt::text(bio) != ""].slug.current`, {}, { next: { revalidate: 300 } }),
  ])
  const newest = (list: Story[]) =>
    list.reduce<string | undefined>((latest, s) => (!latest || s.updatedAt > latest ? s.updatedAt : latest), undefined)
  const live = stories.filter((s) => !s.archived)

  const authors = new Map<string, Story[]>()
  for (const story of stories) {
    const slug = story.author?.slug ?? "tnn"
    authors.set(slug, [...(authors.get(slug) ?? []), story])
  }

  return [
    { url: `${SITE_URL}/`, lastModified: newest(live) },
    { url: `${SITE_URL}/latest`, lastModified: newest(live) },
    { url: `${SITE_URL}/archive`, lastModified: newest(stories.filter((s) => s.archived)) },
    ...SECTIONS.map((section) => ({
      url: `${SITE_URL}/category/${section.slug}`,
      lastModified: newest(stories.filter((s) => s.sectionSlug === section.slug)),
    })),
    ...REGIONS.map((region) => ({
      url: `${SITE_URL}/region/${region.slug}`,
      lastModified: newest(stories.filter((s) => s.region === region.slug)),
    })),
    // Only pages that are allowed into search results (see MIN_LISTING_ITEMS in lib/site/metadata.ts)
    ...[...authors]
      .filter(([slug, list]) => authorsWithBio.includes(slug) || list.length >= MIN_LISTING_ITEMS)
      .map(([slug, list]) => ({ url: `${SITE_URL}/authors/${slug}`, lastModified: newest(list) })),
    ...Object.entries(STORY_TYPE_PAGES).flatMap(([path, info]) => {
      const list = stories.filter((s) => s.storyType === info.type)
      return list.length >= MIN_LISTING_ITEMS ? [{ url: `${SITE_URL}/${path}`, lastModified: newest(list) }] : []
    }),
    { url: `${SITE_URL}/watch`, lastModified: watch.episodes.map((e) => e.publishedAt).sort().at(-1) },
    ...watch.programmes
      .filter((p) => p.hasDescription || watch.episodes.filter((e) => e.programme === p.slug).length >= MIN_LISTING_ITEMS)
      .map((p) => ({
      url: `${SITE_URL}/watch/${p.slug}`,
      lastModified: watch.episodes.filter((e) => e.programme === p.slug).map((e) => e.publishedAt).sort().at(-1),
    })),
    ...watch.episodes.map((e) => ({ url: `${SITE_URL}/watch/${e.programme}/${e.slug}`, lastModified: e.publishedAt })),
    ...PAGES.map((path) => ({ url: `${SITE_URL}${path}` })),
    ...stories.map((story) => ({ url: storyUrl(story.slug, true), lastModified: story.updatedAt })),
  ]
}
