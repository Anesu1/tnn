import 'server-only'

import { LIVE_STORY, storyUrl } from '@/lib/site/news'
import { client } from '@/sanity/lib/client'
import { addDays } from './config'

export type WebStory = { id: string; title: string; url: string; publishedAt: string; author?: string }

// Harare is UTC+2 all year
const startOfDay = (iso: string) => new Date(`${iso}T00:00:00+02:00`).toISOString()

// Stories live on the public website between two Harare dates (inclusive). Read without the
// CDN so a story published a minute ago is counted.
export async function webStories(from: string, to: string): Promise<WebStory[]> {
  const rows = await client.withConfig({ useCdn: false }).fetch<
    { _id: string; title?: string; slug?: string; publishedAt: string; author?: string }[]
  >(
    `*[_type == "newsItem" && ${LIVE_STORY}
       && dateTime(publishedAt) >= dateTime($from) && dateTime(publishedAt) < dateTime($to)]
     | order(publishedAt desc){ _id, title, "slug": slug.current, publishedAt, "author": author->name }`,
    { from: startOfDay(from), to: startOfDay(addDays(to, 1)) },
  )
  return rows.map((row) => ({
    id: row._id,
    title: row.title || 'Untitled story',
    url: storyUrl(row.slug!),
    publishedAt: row.publishedAt,
    author: row.author,
  }))
}

// Recent stories, for linking a tracker item to what it became on the website
export async function recentWebStories(days = 45) {
  const today = new Date().toISOString().slice(0, 10)
  return webStories(addDays(today, -days), addDays(today, 1))
}
