import { notFound } from "next/navigation"

import { FollowBand, PageTitle } from "@/components/site/chrome"
import { Icon } from "@/components/site/icons"
import { EpisodeGrid } from "@/components/site/watch"
import { SITE_NAME, SITE_URL } from "@/lib/site/config"
import { MIN_LISTING_ITEMS, pageMetadata, THIN_PAGE } from "@/lib/site/metadata"
import { episodeUrl, getProgramme, getWatchPaths } from "@/lib/site/watch"

export const revalidate = 60

export async function generateStaticParams() {
  const { programmes } = await getWatchPaths()
  return programmes.map((p) => ({ programme: p.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ programme: string }> }) {
  const data = await getProgramme((await params).programme)
  if (!data) return {}
  const { programme, episodes } = data
  // Indexed once it has a description or a few episodes; until then it repeats its episode page
  const thin = !programme.description?.trim() && episodes.length < MIN_LISTING_ITEMS
  return {
    ...pageMetadata({
    title: `${programme.title}: all episodes`,
    description:
      programme.description ??
      `Every episode of ${programme.title} from The Narrative Network${episodes[0] ? `, including “${episodes[0].title}”` : ""}.`,
    path: `/watch/${programme.slug}`,
    }),
    ...(thin && THIN_PAGE),
  }
}

export default async function ProgrammePage({ params }: { params: Promise<{ programme: string }> }) {
  const data = await getProgramme((await params).programme)
  if (!data) notFound()
  const { programme, episodes } = data

  // The programme as a series of episodes, for search engines
  const seriesLd = {
    "@context": "https://schema.org",
    "@type": "CreativeWorkSeries",
    name: programme.title,
    url: `${SITE_URL}/watch/${programme.slug}`,
    ...(programme.description && { description: programme.description }),
    publisher: { "@type": "NewsMediaOrganization", name: SITE_NAME, url: SITE_URL },
    hasPart: episodes.map((e) => ({ "@type": "VideoObject", name: e.title, url: episodeUrl(e, true) })),
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(seriesLd) }} />
      <PageTitle
        label="Watch TNN"
        title={programme.title}
        intro={programme.description ?? `Every episode of ${programme.title}, newest first.`}
      />
      {(programme.presenters.length > 0 || programme.schedule) && (
        <p className="meta programme-facts">
          {programme.presenters.length > 0 && <>Presented by {programme.presenters.join(", ")}</>}
          {programme.presenters.length > 0 && programme.schedule && " · "}
          {programme.schedule}
        </p>
      )}
      {episodes.length > 0 ? (
        <EpisodeGrid episodes={episodes} />
      ) : (
        <p className="empty">
          No episodes yet. Browse <a href="/watch">all programmes</a>.
        </p>
      )}
      {programme.youtubePlaylist && (
        <p>
          <a href={programme.youtubePlaylist} target="_blank" rel="noopener">
            The {programme.title} playlist on YouTube
            <Icon name="arrow-up-right" />
          </a>
        </p>
      )}
      <FollowBand />
    </>
  )
}
