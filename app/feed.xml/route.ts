import { SITE_NAME, SITE_URL } from "@/lib/site/config"
import { getStories, storyUrl } from "@/lib/site/news"

// RSS feed of the latest stories, matching the reference design's /feed.xml
export const revalidate = 300

const escapeXml = (text: string) =>
  text.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" })[c]!)

export async function GET() {
  const stories = await getStories("archived != true", 30)
  const items = stories
    .map((story) => {
      const link = storyUrl(story.slug, true)
      return `<item><title>${escapeXml(story.title)}</title><link>${link}</link><guid>${link}</guid><pubDate>${new Date(
        story.publishedAt,
      ).toUTCString()}</pubDate><description>${escapeXml(story.summary)}</description></item>`
    })
    .join("")

  const xml = `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>${SITE_NAME}</title><link>${SITE_URL}</link><description>TNN latest news</description>${items}</channel></rss>`

  return new Response(xml, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8", "Cache-Control": "public, max-age=300" },
  })
}
