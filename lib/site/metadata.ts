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
