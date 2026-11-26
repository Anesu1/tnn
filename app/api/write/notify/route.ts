import { createHash, timingSafeEqual } from "node:crypto"

import { runStoryNotifications } from "@/lib/story-notify"

export const dynamic = "force-dynamic"

const same = (a: string, b: string) => {
  const hash = (v: string) => createHash("sha256").update(v).digest()
  return timingSafeEqual(hash(a), hash(b))
}

// Called every five minutes by netlify/functions/story-notify.mts. Anyone else gets 404.
export async function POST(request: Request) {
  const secret = process.env.DESK_CRON_SECRET
  if (!secret || !same(request.headers.get("authorization") ?? "", `Bearer ${secret}`)) {
    return new Response("Not found", { status: 404 })
  }
  try {
    return Response.json(await runStoryNotifications())
  } catch (error) {
    console.error("Story notifications failed", error)
    return Response.json({ error: "failed" }, { status: 500 })
  }
}
