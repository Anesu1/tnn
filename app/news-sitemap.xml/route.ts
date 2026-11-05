import { SITE_NAME } from "@/lib/site/config"
import { getStoriesWith, storyUrl } from "@/lib/site/news"

// Google News sitemap: only stories published in the last 2 days, as Google asks
// (https://developers.google.com/search/docs/crawling-indexing/sitemaps/news-sitemap).
// The normal /sitemap.xml still lists every story.
export const revalidate = 300

const escapeXml = (text: string) =>
  text.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" })[c]!)

export async function GET() {
  const since = new Date(Date.now() - 2 * 24 * 3600_000).toISOString()
  const stories = await getStoriesWith("archived != true && dateTime(publishedAt) >= dateTime($since)", { since }, 1000)
  const urls = stories
    .map(
      (story) =>
        `<url><loc>${storyUrl(story.slug, true)}</loc><news:news><news:publication><news:name>${escapeXml(SITE_NAME)}</news:name><news:language>en</news:language></news:publication><news:publication_date>${story.publishedAt}</news:publication_date><news:title>${escapeXml(story.title)}</news:title></news:news></url>`,
    )
    .join("")

  const xml = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">${urls}</urlset>`

  return new Response(xml, {
    headers: { "Content-Type": "application/xml; charset=utf-8", "Cache-Control": "public, max-age=300" },
  })
}
