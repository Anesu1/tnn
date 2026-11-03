import { client } from "@/sanity/lib/client"
import { CATEGORY_LABELS, REGIONS } from "@/lib/site/config"

// TNN editorial graphic for stories without a photo, in the style of the reference
// design's editorial graphics: dark panel, red edge, place, headline and topic.

export const revalidate = 300

const escapeXml = (text: string) =>
  text.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" })[c]!)

// Greedy word wrap; the last line gets an ellipsis if the headline doesn't fit
function wrap(text: string, maxChars: number, maxLines: number) {
  const words = text.split(/\s+/).filter(Boolean)
  const lines: string[] = []
  let line = ""
  for (const word of words) {
    const next = line ? `${line} ${word}` : word
    if (next.length <= maxChars || !line) {
      line = next
    } else {
      lines.push(line)
      line = word
    }
  }
  if (line) lines.push(line)
  if (lines.length > maxLines) {
    const kept = lines.slice(0, maxLines)
    kept[maxLines - 1] = `${kept[maxLines - 1].replace(/[\s,.;:]+$/, "")}…`
    return kept
  }
  return lines
}

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const story = await client.fetch<{ title: string; region?: string; categoryKey?: string; categoryTitle?: string } | null>(
    `*[_type == "newsItem" && slug.current == $slug][0]{title, region, "categoryKey": categories[0]->key, "categoryTitle": categories[0]->title}`,
    { slug },
  )
  if (!story) return new Response("Not found", { status: 404 })

  const place = REGIONS.find((r) => r.slug === story.region)?.title
  const topic = (story.categoryKey && CATEGORY_LABELS[story.categoryKey]) || story.categoryTitle || "News"
  const lines = wrap(story.title, 30, 4)
  const lineHeight = 78
  // Centre the headline block between the place line (y=130) and the topic line (y=585)
  const firstLine = 350 - ((lines.length - 1) * lineHeight) / 2

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 675"><rect width="1200" height="675" fill="#17251f"/><path d="M0 0h24v675H0z" fill="#ba2028"/><text x="85" y="130" font-family="Arial,sans-serif" font-size="28" fill="#e9b9a9" letter-spacing="5">${escapeXml(place ? `THE NARRATIVE NETWORK · ${place.toUpperCase()}` : "THE NARRATIVE NETWORK")}</text>${lines
    .map(
      (text, i) =>
        `<text x="85" y="${firstLine + i * lineHeight}" font-family="Georgia,serif" font-size="64" fill="#fff">${escapeXml(text)}</text>`,
    )
    .join("")}<text x="85" y="585" font-family="Arial,sans-serif" font-size="28" fill="#c5cec7">${escapeXml(`${topic.toUpperCase()} · EDITORIAL GRAPHIC`)}</text></svg>`

  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": "public, max-age=300, s-maxage=3600",
    },
  })
}
