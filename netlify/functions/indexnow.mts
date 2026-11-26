// Every hour, announce stories that went live in the last hour (including scheduled ones) to
// Bing through IndexNow. The logic lives in the site (app/api/indexnow); this only triggers it.
export default async () => {
  const base = process.env.URL
  const secret = process.env.DESK_CRON_SECRET
  if (!base || !secret) return
  const response = await fetch(`${base}/api/indexnow`, { method: "POST", headers: { Authorization: `Bearer ${secret}` } })
  console.log("IndexNow", response.status, await response.text())
}

export const config = { schedule: "@hourly" }
