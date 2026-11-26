import { client } from "@/sanity/lib/client"
import { SITE_URL, VIDEOS } from "./config"
import { LIVE_STORY, storyUrl } from "./news"

// Watch TNN: programmes and episodes from the Studio. Episodes go live on their "First shown" time.

export type Programme = {
  id: string
  title: string
  slug: string
  description?: string
  presenters: string[]
  schedule?: string
  youtubePlaylist?: string
}

export type Episode = {
  id: string
  title: string
  slug: string
  summary: string
  publishedAt: string
  youtubeUrl: string
  youtubeId: string
  programme: { title: string; slug: string }
  guests: string[]
}

export type FullEpisode = Episode & {
  notes?: unknown[]
  notesText: string
  relatedStories: { title: string; url: string; summary?: string }[]
}

const options = { next: { revalidate: 60 } }
const LIVE_EPISODE = `_type == "episode" && defined(slug.current) && defined(programme->slug.current) && defined(youtubeUrl) && dateTime(publishedAt) <= dateTime(now())`

const EPISODE_FIELDS = `_id, title, "slug": slug.current, summary, publishedAt, youtubeUrl,
  "programme": programme->{title, "slug": slug.current}, "guests": coalesce(guests, [])`

const PROGRAMME_FIELDS = `_id, title, "slug": slug.current, description, "presenters": coalesce(presenters, []), schedule, youtubePlaylist`

export function youtubeId(url: string) {
  return url.match(/(?:v=|youtu\.be\/|\/live\/|\/shorts\/|\/embed\/)([\w-]{11})/)?.[1] ?? ""
}

type RawEpisode = Omit<Episode, "id" | "youtubeId"> & { _id: string }
const toEpisode = (raw: RawEpisode): Episode => ({ ...raw, id: raw._id, youtubeId: youtubeId(raw.youtubeUrl) })
type RawProgramme = Omit<Programme, "id"> & { _id: string }
const toProgramme = (raw: RawProgramme): Programme => ({ ...raw, id: raw._id })

export const episodeUrl = (episode: Pick<Episode, "slug" | "programme">, absolute = false) =>
  `${absolute ? SITE_URL : ""}/watch/${episode.programme.slug}/${episode.slug}`

// Programmes in their set order, each with its newest episodes
export async function getProgrammes(episodesEach = 3) {
  const rows = await client.fetch<(RawProgramme & { episodes: RawEpisode[] })[]>(
    `*[_type == "programme" && defined(slug.current)] | order(coalesce(order, 99), title){
      ${PROGRAMME_FIELDS},
      "episodes": *[${LIVE_EPISODE} && programme._ref == ^._id] | order(publishedAt desc)[0...${episodesEach}]{${EPISODE_FIELDS}}
    }`,
    {},
    options,
  )
  return rows.map((row) => ({ programme: toProgramme(row), episodes: row.episodes.map(toEpisode) }))
}

export async function getProgramme(slug: string) {
  const row = await client.fetch<(RawProgramme & { episodes: RawEpisode[] }) | null>(
    `*[_type == "programme" && slug.current == $slug][0]{
      ${PROGRAMME_FIELDS},
      "episodes": *[${LIVE_EPISODE} && programme._ref == ^._id] | order(publishedAt desc){${EPISODE_FIELDS}}
    }`,
    { slug },
    options,
  )
  return row ? { programme: toProgramme(row), episodes: row.episodes.map(toEpisode) } : null
}

export async function getEpisode(programmeSlug: string, slug: string): Promise<FullEpisode | null> {
  const row = await client.fetch<
    (RawEpisode & { notes?: unknown[]; notesText?: string; related?: { title: string; slug: string; summary?: string }[] }) | null
  >(
    `*[${LIVE_EPISODE} && slug.current == $slug && programme->slug.current == $programmeSlug][0]{
      ${EPISODE_FIELDS}, notes, "notesText": pt::text(notes),
      "related": relatedStories[]->[${LIVE_STORY}]{title, "slug": slug.current, "summary": excerpt}
    }`,
    { slug, programmeSlug },
    options,
  )
  if (!row) return null
  return {
    ...toEpisode(row),
    notes: row.notes,
    notesText: row.notesText ?? "",
    relatedStories: (row.related ?? []).filter(Boolean).map((s) => ({ title: s.title, url: storyUrl(s.slug), summary: s.summary })),
  }
}

export async function getLatestEpisodes(limit = 3) {
  const rows = await client.fetch<RawEpisode[]>(
    `*[${LIVE_EPISODE}] | order(publishedAt desc)[0...${limit}]{${EPISODE_FIELDS}}`,
    {},
    options,
  )
  return rows.map(toEpisode)
}

// Number of live episodes per programme id
export async function getEpisodeCounts() {
  const rows = await client.fetch<{ id: string; count: number }[]>(
    `*[_type == "programme"]{"id": _id, "count": count(*[${LIVE_EPISODE} && programme._ref == ^._id])}`,
    {},
    options,
  )
  return Object.fromEntries(rows.map((r) => [r.id, r.count])) as Record<string, number>
}

// Episodes that list a story as related, shown on that story's page
export async function episodesForStory(storyId: string) {
  const rows = await client.fetch<RawEpisode[]>(
    `*[${LIVE_EPISODE} && references($storyId)] | order(publishedAt desc)[0...2]{${EPISODE_FIELDS}}`,
    { storyId },
    options,
  )
  return rows.map(toEpisode)
}

// Every episode and programme address, for the sitemap and build
export async function getWatchPaths() {
  return client.fetch<{ programmes: { slug: string; hasDescription: boolean }[]; episodes: { slug: string; programme: string; publishedAt: string }[] }>(
    `{
      "programmes": *[_type == "programme" && defined(slug.current)]{"slug": slug.current, "hasDescription": defined(description) && description != ""},
      "episodes": *[${LIVE_EPISODE}]{"slug": slug.current, "programme": programme->slug.current, publishedAt}
    }`,
    {},
    options,
  )
}

// Before any episodes are entered in the Studio, Watch TNN falls back to the original list
export const FALLBACK_VIDEOS = VIDEOS
