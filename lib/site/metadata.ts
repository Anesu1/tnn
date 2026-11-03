import type { Metadata } from "next"

import { SITE_NAME, SITE_URL } from "./config"

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
    description: description.slice(0, 180),
    alternates: { canonical: path },
    openGraph: { title, description: description.slice(0, 200), url, type, siteName: SITE_NAME, images: [image] },
    twitter: { card: "summary_large_image" },
  }
}
