import { createHash, timingSafeEqual } from "node:crypto"

import { runReminders } from "@/lib/desk/notify"

export const dynamic = "force-dynamic"

// Called every hour by netlify/functions/desk-reminders.mts with DESK_CRON_SECRET.
// Without the secret it answers 404, the same as an address that doesn't exist.
export async function POST(request: Request) {
  const secret = process.env.DESK_CRON_SECRET
  const given = request.headers.get("authorization")?.replace(/^Bearer /, "") ?? ""
  const hash = (value: string) => createHash("sha256").update(value).digest()
  if (!secret || secret.length < 24 || !timingSafeEqual(hash(given), hash(secret))) {
    return new Response("Not found", { status: 404 })
  }
  try {
    return Response.json(await runReminders())
  } catch (err) {
    console.error("Desk reminders failed", err)
    return Response.json({ error: "failed" }, { status: 500 })
  }
}
