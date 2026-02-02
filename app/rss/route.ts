import { NextResponse } from "next/server"
import { client } from "@/sanity/lib/client"

export const revalidate = 300

interface RssItem {
  title: string
  slug?: string
  excerpt?: string
  publishedAt?: string
}

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
}

export async function GET() {
  const items = await client.fetch<RssItem[]>(
    `*[_type == "newsItem"] | order(publishedAt desc)[0...20]{
      title,
      excerpt,
      publishedAt,
      "slug": slug.current
    }`
  )

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>NewsStream RSS</title>
    <link>${siteUrl}</link>
    <description>Latest headlines from NewsStream</description>
    ${items
      .map((item) => {
        const link = item.slug ? `${siteUrl}/news/${item.slug}` : siteUrl
        return `
    <item>
      <title>${escapeXml(item.title)}</title>
      <link>${link}</link>
      <guid>${link}</guid>
      <pubDate>${item.publishedAt ? new Date(item.publishedAt).toUTCString() : ""}</pubDate>
      <description>${item.excerpt ? escapeXml(item.excerpt) : ""}</description>
    </item>`
      })
      .join("")}
  </channel>
</rss>`

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
    },
  })
}
