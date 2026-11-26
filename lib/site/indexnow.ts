import 'server-only'

import { SITE_URL } from './config'

// IndexNow tells Bing (and other IndexNow search engines) straight away when a page is added,
// updated or removed, as Bing's webmaster guidelines ask. Needs INDEXNOW_KEY; without it,
// nothing is sent. The key is public by design: /indexnow-key.txt proves the site owns it.
export function indexNowKey() {
  const key = process.env.INDEXNOW_KEY?.trim()
  return key && /^[a-zA-Z0-9-]{8,128}$/.test(key) ? key : undefined
}

export async function submitToIndexNow(urls: string[]) {
  const key = indexNowKey()
  const urlList = [...new Set(urls)].filter((u) => u.startsWith(SITE_URL)).slice(0, 10_000)
  if (!key || urlList.length === 0) return { sent: 0, skipped: key ? 'no urls' : 'INDEXNOW_KEY not set' }
  const response = await fetch('https://api.indexnow.org/indexnow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({ host: new URL(SITE_URL).host, key, keyLocation: `${SITE_URL}/indexnow-key.txt`, urlList }),
  })
  // 200 and 202 are success (202: key still being checked); 403 means the key file didn't match
  if (response.status >= 300) console.error('IndexNow submission failed', response.status, await response.text())
  return { sent: urlList.length, status: response.status }
}
