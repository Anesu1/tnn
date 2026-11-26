import { indexNowKey } from "@/lib/site/indexnow"

// The IndexNow key file. Search engines fetch it to confirm submissions come from this site.
export const dynamic = "force-dynamic"

export function GET() {
  const key = indexNowKey()
  return key
    ? new Response(key, { headers: { "Content-Type": "text/plain; charset=utf-8" } })
    : new Response("Not found", { status: 404 })
}
