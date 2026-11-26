import { createHash, createHmac, timingSafeEqual } from "node:crypto"

import { sectionForCategoryKey, SITE_URL } from "@/lib/site/config"
import { submitToIndexNow } from "@/lib/site/indexnow"
import { LIVE_STORY, storyUrl } from "@/lib/site/news"
import { client } from "@/sanity/lib/client"

export const dynamic = "force-dynamic"

// Two callers, each authenticated:
// 1. A Sanity webhook (signed with SANITY_WEBHOOK_SECRET) when a story is published, updated or
//    unpublished. It sends {slug, publishedAt, categoryKey, region, operation}.
// 2. The hourly Netlify function (Bearer DESK_CRON_SECRET), which announces scheduled stories
//    as they go live: at publish time their page doesn't exist yet, so the webhook skips them.
// Anything else gets 404, like an address that doesn't exist.

const same = (a: string, b: string) => {
  const hash = (v: string) => createHash("sha256").update(v).digest()
  return timingSafeEqual(hash(a), hash(b))
}

// Sanity's signature header: "t=<ms timestamp>,v1=<base64url HMAC-SHA256 of `${t}.${body}`>"
function validSanitySignature(body: string, header: string | null) {
  const secret = process.env.SANITY_WEBHOOK_SECRET
  if (!secret || !header) return false
  const fields = Object.fromEntries(header.split(",").map((part) => [part.slice(0, part.indexOf("=")), part.slice(part.indexOf("=") + 1)]))
  const timestamp = Number(fields.t)
  if (!fields.v1 || !Number.isFinite(timestamp) || Math.abs(Date.now() - timestamp) > 5 * 60_000) return false
  const expected = createHmac("sha256", secret).update(`${fields.t}.${body}`).digest("base64url")
  return same(expected, fields.v1.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, ""))
}

// The story plus the listing pages it appears on
function pagesFor(story: { slug: string; categoryKey?: string; region?: string }) {
  const section = sectionForCategoryKey(story.categoryKey)
  return [
    storyUrl(story.slug, true),
    `${SITE_URL}/`,
    `${SITE_URL}/latest`,
    ...(section ? [`${SITE_URL}/category/${section.slug}`] : []),
    ...(story.region ? [`${SITE_URL}/region/${story.region}`] : []),
  ]
}

export async function POST(request: Request) {
  const body = await request.text()

  if (request.headers.has("sanity-webhook-signature")) {
    if (!validSanitySignature(body, request.headers.get("sanity-webhook-signature"))) return new Response("Not found", { status: 404 })
    let event: { slug?: string; publishedAt?: string; categoryKey?: string; region?: string; operation?: string }
    try {
      event = JSON.parse(body)
    } catch {
      return Response.json({ error: "invalid body" }, { status: 400 })
    }
    if (!event.slug || !/^[a-z0-9-]+$/.test(event.slug)) return Response.json({ skipped: "no slug" })
    // Scheduled: the hourly run announces it once it is live
    if (event.operation !== "delete" && event.publishedAt && event.publishedAt > new Date().toISOString()) {
      return Response.json({ skipped: "scheduled" })
    }
    // A removed story is announced too, so Bing recrawls it, finds the 404 and drops it
    return Response.json(await submitToIndexNow(pagesFor({ slug: event.slug, categoryKey: event.categoryKey, region: event.region })))
  }

  const secret = process.env.DESK_CRON_SECRET
  const given = request.headers.get("authorization")?.replace(/^Bearer /, "") ?? ""
  if (!secret || secret.length < 24 || !same(given, secret)) return new Response("Not found", { status: 404 })
  const since = new Date(Date.now() - 70 * 60_000).toISOString()
  const recent = await client.withConfig({ useCdn: false }).fetch<{ slug: string; categoryKey?: string; region?: string }[]>(
    `*[_type == "newsItem" && ${LIVE_STORY} && dateTime(publishedAt) >= dateTime($since)]{"slug": slug.current, "categoryKey": categories[0]->key, region}`,
    { since },
  )
  return Response.json(await submitToIndexNow(recent.flatMap(pagesFor)))
}
