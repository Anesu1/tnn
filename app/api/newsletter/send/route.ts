import { createHash, timingSafeEqual } from "node:crypto"

import { sendWeeklyBriefing } from "@/lib/newsletter"

export const dynamic = "force-dynamic"

const same = (a: string, b: string) => {
  const hash = (v: string) => createHash("sha256").update(v).digest()
  return timingSafeEqual(hash(a), hash(b))
}

// Called hourly by netlify/functions/newsletter.mts. Sends only on Friday from 07:00 Harare time,
// once a week, and only when NEWSLETTER_ENABLED is "true". Anyone else gets 404.
export async function POST(request: Request) {
  const secret = process.env.DESK_CRON_SECRET
  const auth = request.headers.get("authorization") ?? ""
  if (!secret || !same(auth, `Bearer ${secret}`)) return new Response("Not found", { status: 404 })
  try {
    return Response.json(await sendWeeklyBriefing())
  } catch (error) {
    console.error("Newsletter send failed", error)
    return Response.json({ error: "send failed" }, { status: 500 })
  }
}
