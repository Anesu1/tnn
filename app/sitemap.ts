import type { MetadataRoute } from "next"

import { REGIONS, SECTIONS, SITE_URL } from "@/lib/site/config"
import { getStories, storyUrl, type Story } from "@/lib/site/news"
import { STORY_TYPE_PAGES } from "@/lib/site/story-type-pages"
import { getWatchPaths } from "@/lib/site/watch"

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
  const [stories, watch] = await Promise.all([getStories(), getWatchPaths()])
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
    // Story-type pages only once they have stories (empty ones are noindex)
    ...Object.entries(STORY_TYPE_PAGES).flatMap(([path, info]) => {
      const list = stories.filter((s) => s.storyType === info.type)
      return list.length ? [{ url: `${SITE_URL}/${path}`, lastModified: newest(list) }] : []
    }),
    { url: `${SITE_URL}/watch`, lastModified: watch.episodes.map((e) => e.publishedAt).sort().at(-1) },
    ...watch.programmes.map((p) => ({
      url: `${SITE_URL}/watch/${p.slug}`,
      lastModified: watch.episodes.filter((e) => e.programme === p.slug).map((e) => e.publishedAt).sort().at(-1),
    })),
    ...watch.episodes.map((e) => ({ url: `${SITE_URL}/watch/${e.programme}/${e.slug}`, lastModified: e.publishedAt })),
    ...PAGES.map((path) => ({ url: `${SITE_URL}${path}` })),
    ...stories.map((story) => ({ url: storyUrl(story.slug, true), lastModified: story.updatedAt })),
  ]
}
