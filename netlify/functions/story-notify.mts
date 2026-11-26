// Every five minutes, email reporters whose story the editor has sent back or published.
// The logic lives in the site (app/api/write/notify); this only triggers it.
export default async () => {
  const base = process.env.URL
  const secret = process.env.DESK_CRON_SECRET
  if (!base || !secret) return
  const response = await fetch(`${base}/api/write/notify`, { method: "POST", headers: { Authorization: `Bearer ${secret}` } })
  console.log("Story notifications", response.status, await response.text())
}

export const config = { schedule: "*/5 * * * *" }
