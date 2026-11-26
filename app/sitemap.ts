import type { MetadataRoute } from "next"

import { REGIONS, SECTIONS, SITE_URL } from "@/lib/site/config"
import { getStories, storyUrl, type Story } from "@/lib/site/news"

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
  "/watch",
]

// Every live story, plus listing pages dated by their newest story, so search engines
// (Bing asks for accurate lastmod values) know which pages have changed
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const stories = await getStories()
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
    ...[...authors].map(([slug, list]) => ({ url: `${SITE_URL}/authors/${slug}`, lastModified: newest(list) })),
    ...PAGES.map((path) => ({ url: `${SITE_URL}${path}` })),
    ...stories.map((story) => ({ url: storyUrl(story.slug, true), lastModified: story.updatedAt })),
  ]
}
