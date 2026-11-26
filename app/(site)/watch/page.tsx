import { FollowBand, PageTitle } from "@/components/site/chrome"
import { Icon } from "@/components/site/icons"
import { SectionHead, VideoGrid } from "@/components/site/stories"
import { EpisodeGrid } from "@/components/site/watch"
import { YOUTUBE_URL } from "@/lib/site/config"
import { pageMetadata } from "@/lib/site/metadata"
import { cardSummary } from "@/lib/site/news"
import { getEpisodeCounts, getLatestEpisodes, getProgrammes } from "@/lib/site/watch"

export const revalidate = 60

const INTRO = "Interviews, programmes and conversations from The Narrative Network, with every episode on its own page."

export const metadata = pageMetadata({
  title: "Watch TNN: programmes and interviews",
  description:
    "Watch TNN programmes and interviews, including Girls’ Chat ZW, Nation Watch and TNN Interviews: conversations on Zimbabwe, Africa and the people shaping them.",
  path: "/watch",
})

export default async function WatchPage() {
  const [programmes, latest] = await Promise.all([getProgrammes(1), getLatestEpisodes(6)])
  const counts = await getEpisodeCounts()

  return (
    <>
      <PageTitle label="TNN on screen" title="Stories. Voices. Perspective." intro={INTRO} />
      {latest.length === 0 ? (
        // Until episodes are entered in the Studio
        <VideoGrid />
      ) : (
        <>
          <section>
            <SectionHead title="Latest episodes" />
            {/* Whole rows of three */}
            <EpisodeGrid episodes={latest.slice(0, latest.length >= 6 ? 6 : 3)} />
          </section>
          <section>
            <SectionHead title="Programmes" />
            <div className="programme-grid">
              {programmes.map(({ programme }) => (
                <a key={programme.id} className="programme-card" href={`/watch/${programme.slug}`}>
                  <h3>{programme.title}</h3>
                  {programme.description && <p>{cardSummary(programme.description)}</p>}
                  <span className="meta">
                    {counts[programme.id] ?? 0} {(counts[programme.id] ?? 0) === 1 ? "episode" : "episodes"}
                    {programme.schedule ? ` · ${programme.schedule}` : ""}
                    <Icon name="arrow-right" />
                  </span>
                </a>
              ))}
            </div>
          </section>
        </>
      )}
      <div className="two-col">
        <div className="box">
          <h2>Interviews & conversations</h2>
          <p>People and perspectives behind the headlines. Browse the channel for every interview and conversation.</p>
          <a data-event="watch_youtube" href={YOUTUBE_URL} target="_blank" rel="noopener">
            Explore the channel
            <Icon name="arrow-up-right" />
          </a>
        </div>
        <div className="box">
          <h2>Commission a programme</h2>
          <p>Discuss a documentary, interview series or clearly labelled sponsored programme.</p>
          <a href="/contact?type=production">
            Send a production brief
            <Icon name="arrow-right" />
          </a>
        </div>
      </div>
      <FollowBand />
    </>
  )
}
