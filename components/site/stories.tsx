import { formatDate, formatDateTime, VIDEOS } from "@/lib/site/config"
import { cardSummary, imageSources, storyUrl, type Story, type StoryImage } from "@/lib/site/news"
import { Icon } from "./icons"

const CARD_SIZES = "(max-width:600px) calc(100vw - 36px), (max-width:900px) 50vw, 390px"
const FEATURE_SIZES = "(max-width:900px) 100vw, 760px"

export function StoryImg({
  image,
  variant = "card",
  priority = false,
}: {
  image: StoryImage
  variant?: "card" | "feature" | "cover"
  priority?: boolean
}) {
  const sources = imageSources(image)
  const loading = priority ? "eager" : "lazy"
  if (image.graphic) {
    return (
      <img
        src={sources.src}
        alt={image.alt}
        width={image.width}
        height={image.height}
        fetchPriority={priority ? "high" : undefined}
        loading={loading}
      />
    )
  }
  return (
    <img
      className=""
      src={variant === "card" ? sources.src : sources.large}
      srcSet={sources.srcSet}
      sizes={variant === "card" ? CARD_SIZES : FEATURE_SIZES}
      width={image.width}
      height={image.height}
      alt={image.alt}
      decoding="async"
      fetchPriority={priority ? "high" : undefined}
      loading={loading}
    />
  )
}

// Section, then BREAKING (only until its end time), the story type (except ordinary news) and Archive
function Labels({ story }: { story: Story }) {
  return (
    <>
      {story.categoryLabel && <span className="label">{story.categoryLabel}</span>}
      {story.breaking && <span className="breaking-label">Breaking</span>}
      {story.typeLabel && <span className="type-label">{story.typeLabel}</span>}
      {story.archived && <span className="status-label">Archive</span>}
    </>
  )
}

// Red band above the homepage lead while stories are marked breaking
export function BreakingBand({ stories }: { stories: Story[] }) {
  if (stories.length === 0) return null
  return (
    <section className="breaking-band" aria-label="Breaking news">
      <strong>Breaking</strong>
      <ul>
        {stories.slice(0, 3).map((story) => (
          <li key={story.id}>
            <a href={storyUrl(story.slug)}>{story.title}</a>
            <span className="meta">{formatDateTime(story.publishedAt)}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}

export function StoryCard({ story }: { story: Story }) {
  const meta = [formatDate(story.publishedAt), story.regionTitle, "Read story"].filter(Boolean).join(" · ")
  // "Read story" is last, so the arrow sits right after it
  return (
    <article className="card">
      <a href={storyUrl(story.slug)}>
        <div className="thumb">
          <StoryImg image={story.image} />
        </div>
        <Labels story={story} />
        <h3>{story.title}</h3>
        {story.summary && <p>{cardSummary(story.summary)}</p>}
        <span className="meta">
          {meta}
          <Icon name="arrow-right" />
        </span>
      </a>
    </article>
  )
}

export function StoryGrid({ stories, id }: { stories: Story[]; id?: string }) {
  return (
    <div className="grid" id={id}>
      {stories.map((story) => (
        <StoryCard key={story.id} story={story} />
      ))}
    </div>
  )
}

// Large lead story: the homepage hero uses an <h1>, section pages an <h2>.
// Without a photo it shows the design's plain green panel: the editorial graphic would repeat the headline.
export function FeatureStory({ story, heading = "h1" }: { story: Story; heading?: "h1" | "h2" }) {
  const Heading = heading
  return (
    <a className="feature" href={storyUrl(story.slug)}>
      {!story.image.graphic && <StoryImg image={story.image} variant="feature" priority />}
      <div className="feature-copy">
        <Labels story={story} />
        <Heading>{story.title}</Heading>
        {story.summary && <p>{cardSummary(story.summary)}</p>}
        <span className="meta">
          {formatDate(story.publishedAt)} · Read story
          <Icon name="arrow-right" />
        </span>
      </div>
    </a>
  )
}

export function SideStory({ story }: { story: Story }) {
  const meta = [formatDate(story.publishedAt), story.regionTitle].filter(Boolean).join(" · ")
  return (
    <a className="side-story" href={storyUrl(story.slug)}>
      <Labels story={story} />
      <h3>{story.title}</h3>
      <span className="meta">{meta}</span>
    </a>
  )
}

export function SectionHead({ title, href, linkText = "View all" }: { title: string; href?: string; linkText?: string }) {
  return (
    <div className="section-head">
      <h2>{title}</h2>
      {href && (
        <a href={href}>
          {linkText}
          <Icon name="arrow-right" />
        </a>
      )}
    </div>
  )
}

export function VideoGrid({ limit }: { limit?: number }) {
  return (
    <div className="grid video-grid">
      {VIDEOS.slice(0, limit).map((video) => (
        <article className="video-card" key={video.url}>
          <a data-event="watch_episode" href={video.url} target="_blank" rel="noopener">
            <div className="video-poster">
              <span className="play" aria-hidden="true">
                <Icon name="play" />
              </span>
              <span>{video.programme}</span>
            </div>
            <h3>{video.title}</h3>
            <p>{video.summary}</p>
            <span className="meta">
              Watch on YouTube
              <Icon name="arrow-up-right" />
            </span>
          </a>
        </article>
      ))}
    </div>
  )
}
