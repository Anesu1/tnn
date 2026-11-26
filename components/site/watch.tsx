import { formatDate } from "@/lib/site/config"
import { cardSummary } from "@/lib/site/news"
import { episodeUrl, type Episode } from "@/lib/site/watch"
import { Icon } from "./icons"

// Episode cards keep the reference design's poster panel and link to the episode's own page
export function EpisodeCard({ episode }: { episode: Episode }) {
  return (
    <article className="video-card">
      <a href={episodeUrl(episode)}>
        <div className="video-poster">
          <span className="play" aria-hidden="true">
            <Icon name="play" />
          </span>
          <span>{episode.programme.title}</span>
        </div>
        <h3>{episode.title}</h3>
        <p>{cardSummary(episode.summary)}</p>
        <span className="meta">
          {formatDate(episode.publishedAt)} · Watch
          <Icon name="arrow-right" />
        </span>
      </a>
    </article>
  )
}

export function EpisodeGrid({ episodes }: { episodes: Episode[] }) {
  return (
    <div className="grid video-grid">
      {episodes.map((episode) => (
        <EpisodeCard key={episode.id} episode={episode} />
      ))}
    </div>
  )
}
