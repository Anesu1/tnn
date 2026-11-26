import { unsubscribe } from "@/lib/newsletter"

export const dynamic = "force-dynamic"

// One-click unsubscribe (RFC 8058): Gmail and Apple Mail show an "Unsubscribe" button that POSTs
// here using the List-Unsubscribe header. Only POST changes anything.
export async function POST(request: Request) {
  const token = new URL(request.url).searchParams.get("token") ?? ""
  await unsubscribe(token).catch((error) => console.error("One-click unsubscribe failed", error))
  return new Response(null, { status: 204 })
}

// Someone opening the header link in a browser gets the normal page with its button
export function GET(request: Request) {
  const token = new URL(request.url).searchParams.get("token") ?? ""
  return Response.redirect(new URL(`/newsletter/unsubscribe?token=${encodeURIComponent(token)}`, request.url), 303)
}
