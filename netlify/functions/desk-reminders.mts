// Every hour, ask the site to send any Editorial Desk reminders that are due.
// The reminder logic lives in the site (lib/desk/notify.ts); this only triggers it.
export default async () => {
  const base = process.env.URL
  const secret = process.env.DESK_CRON_SECRET
  if (!base || !secret) return
  const response = await fetch(`${base}/desk/cron`, { method: "POST", headers: { Authorization: `Bearer ${secret}` } })
  console.log("Desk reminders", response.status, await response.text())
}

export const config = { schedule: "@hourly" }
