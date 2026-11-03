import { FollowBand, PageTitle } from "@/components/site/chrome"
import { VideoGrid } from "@/components/site/stories"
import { YOUTUBE_URL } from "@/lib/site/config"
import { pageMetadata } from "@/lib/site/metadata"
import { Icon } from "@/components/site/icons"

const INTRO = "Explore published interviews, reports and conversations on our official YouTube channel."

export const metadata = pageMetadata({ title: "Watch TNN", description: INTRO, path: "/watch" })

export default function WatchPage() {
  return (
    <>
      <PageTitle label="TNN on screen" title="Stories. Voices. Perspective." intro={INTRO} />
      <VideoGrid />
      <div className="two-col">
        <div className="box">
          <h2>Interviews & conversations</h2>
          <p>People and perspectives behind the headlines. Browse the channel for available interviews and conversations.</p>
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
