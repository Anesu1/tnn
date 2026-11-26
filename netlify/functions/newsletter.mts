// Every hour, ask the site whether the weekly TNN briefing is due (Friday from 07:00 Harare time).
// The logic lives in the site (app/api/newsletter/send); nothing is sent unless
// NEWSLETTER_ENABLED is "true".
export default async () => {
  const base = process.env.URL
  const secret = process.env.DESK_CRON_SECRET
  if (!base || !secret) return
  const response = await fetch(`${base}/api/newsletter/send`, { method: "POST", headers: { Authorization: `Bearer ${secret}` } })
  console.log("Newsletter", response.status, await response.text())
}

export const config = { schedule: "@hourly" }
