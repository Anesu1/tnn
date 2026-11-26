import type { Metadata } from "next"

import { SITE_NAME, SITE_URL } from "./config"

// Search engines show about 160 characters of a description; cut at a word, not mid-word
export function trimDescription(text: string, max = 160) {
  const clean = text.replace(/\s+/g, " ").trim()
  if (clean.length <= max) return clean
  const cut = clean.slice(0, max - 1)
  return `${cut.slice(0, Math.max(cut.lastIndexOf(" "), max - 20)).replace(/[,;:.\s]+$/, "")}…`
}

// Page metadata in the reference's format: "<Title> | TNN", canonical URL and Open Graph tags
// A listing page goes into Google only once it has enough of its own content. Pages with one
// story and template text look like duplicates of each other ("Crawled - currently not indexed",
// "Google chose different canonical"). Readers can still open them, and links are still followed.
export const MIN_LISTING_ITEMS = 3
export const THIN_PAGE = { robots: { index: false, follow: true } } as const

export function pageMetadata({
  title,
  description,
  path,
  image = `${SITE_URL}/assets/tnn-social.png`,
  type = "website",
}: {
  title: string
  description: string
  path: string
  image?: string
  type?: "website" | "article"
}): Metadata {
  const url = `${SITE_URL}${path}`
  return {
    title: { absolute: `${title} | TNN` },
    description: trimDescription(description),
    alternates: { canonical: path },
    openGraph: { title, description: trimDescription(description, 200), url, type, siteName: SITE_NAME, images: [image] },
    twitter: { card: "summary_large_image" },
  }
}
