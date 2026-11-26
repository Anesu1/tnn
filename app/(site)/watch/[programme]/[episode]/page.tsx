import { notFound } from "next/navigation"

import { ArticleBody } from "@/components/site/article-body"
import { FollowBand } from "@/components/site/chrome"
import { Icon } from "@/components/site/icons"
import { SectionHead } from "@/components/site/stories"
import { VideoPlayer } from "@/components/site/video-player"
import { EpisodeGrid } from "@/components/site/watch"
import { formatDate, SITE_NAME, SITE_URL } from "@/lib/site/config"
import { pageMetadata } from "@/lib/site/metadata"
import { cardSummary } from "@/lib/site/news"
import { episodeUrl, getEpisode, getProgramme, getWatchPaths } from "@/lib/site/watch"

export const revalidate = 60

export async function generateStaticParams() {
  const { episodes } = await getWatchPaths()
  return episodes.map((e) => ({ programme: e.programme, episode: e.slug }))
}

type Params = { params: Promise<{ programme: string; episode: string }> }

export async function generateMetadata({ params }: Params) {
  const { programme, episode: slug } = await params
  const episode = await getEpisode(programme, slug)
  if (!episode) return {}
  return pageMetadata({
    title: `${episode.title} | ${episode.programme.title}`,
    description: episode.summary,
    path: episodeUrl(episode),
    image: `https://i.ytimg.com/vi/${episode.youtubeId}/hqdefault.jpg`,
  })
}

export default async function EpisodePage({ params }: Params) {
  const { programme: programmeSlug, episode: slug } = await params
  const [episode, programme] = await Promise.all([getEpisode(programmeSlug, slug), getProgramme(programmeSlug)])
  if (!episode) notFound()
  const more = (programme?.episodes ?? []).filter((e) => e.id !== episode.id).slice(0, 3)
  const url = episodeUrl(episode, true)

  // Lets the episode appear in Google and Bing video results; every value is shown on the page
  const videoLd = {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: episode.title,
    description: episode.summary,
    uploadDate: episode.publishedAt,
    thumbnailUrl: [`https://i.ytimg.com/vi/${episode.youtubeId}/hqdefault.jpg`],
    embedUrl: `https://www.youtube.com/embed/${episode.youtubeId}`,
    url,
    partOfSeries: { "@type": "CreativeWorkSeries", name: episode.programme.title, url: `${SITE_URL}/watch/${episode.programme.slug}` },
    publisher: { "@type": "NewsMediaOrganization", name: SITE_NAME, url: SITE_URL },
    ...(episode.notesText && { transcript: episode.notesText.slice(0, 5000) }),
  }
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Watch TNN", item: `${SITE_URL}/watch` },
      { "@type": "ListItem", position: 2, name: episode.programme.title, item: `${SITE_URL}/watch/${episode.programme.slug}` },
      { "@type": "ListItem", position: 3, name: episode.title, item: url },
    ],
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(videoLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <article className="article episode">
        <p className="label">
          <a href={`/watch/${episode.programme.slug}`}>{episode.programme.title}</a>
        </p>
        <h1>{episode.title}</h1>
        <p className="standfirst">{episode.summary}</p>
        <div className="byline">
          <time dateTime={episode.publishedAt}>First shown {formatDate(episode.publishedAt)}</time>
          {episode.guests.length > 0 && <span>With {episode.guests.join(", ")}</span>}
        </div>
        <div className="cover">
          <VideoPlayer youtubeId={episode.youtubeId} title={episode.title} label={episode.programme.title} />
        </div>
        <div className="actions">
          <a data-event="watch_episode" href={episode.youtubeUrl} target="_blank" rel="noopener">
            <Icon name="play" />
            Watch on YouTube
          </a>
        </div>
        {episode.notes && episode.notes.length > 0 && (
          <div className="article-body">
            <h2>About this episode</h2>
            <ArticleBody value={episode.notes} />
          </div>
        )}
        {episode.relatedStories.length > 0 && (
          <section className="sources">
            <h2>Related reporting</h2>
            <ul>
              {episode.relatedStories.map((story) => (
                <li key={story.url}>
                  <a href={story.url}>{story.title}</a>
                  {story.summary && <span className="meta"> · {cardSummary(story.summary)}</span>}
                </li>
              ))}
            </ul>
          </section>
        )}
      </article>
      {more.length > 0 && (
        <section>
          <SectionHead title={`More from ${episode.programme.title}`} href={`/watch/${episode.programme.slug}`} linkText="All episodes" />
          <EpisodeGrid episodes={more} />
        </section>
      )}
      <FollowBand />
    </>
  )
}
