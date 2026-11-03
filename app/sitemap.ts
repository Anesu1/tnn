import type { MetadataRoute } from "next"

import { REGIONS, SECTIONS, SITE_URL } from "@/lib/site/config"
import { getStories, storyUrl } from "@/lib/site/news"

export const revalidate = 300

// Same pages as the reference design's sitemap, plus every published story
const PAGES = [
  "/",
  "/latest",
  "/archive",
  ...SECTIONS.map((s) => `/category/${s.slug}`),
  ...REGIONS.map((r) => `/region/${r.slug}`),
  "/contact",
  "/about",
  "/authors/tnn",
  "/editorial-standards",
  "/corrections",
  "/privacy",
  "/newsletter",
  "/partnerships",
  "/media-kit",
  "/watch",
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const stories = await getStories()
  return [
    ...PAGES.map((path) => ({ url: `${SITE_URL}${path}` })),
    ...stories.map((story) => ({ url: storyUrl(story.slug, true), lastModified: story.updatedAt })),
  ]
}
