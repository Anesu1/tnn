import { notFound } from "next/navigation"

import { ArticleBody } from "@/components/site/article-body"
import { FollowBand } from "@/components/site/chrome"
import { SectionHead, StoryGrid, StoryImg } from "@/components/site/stories"
import { formatDateTime, SECTIONS, SITE_NAME, SITE_URL, STORY_TYPES } from "@/lib/site/config"
import { pageMetadata } from "@/lib/site/metadata"
import { getStories, getStory, imageSources, readTimeFor, relatedStories, storyUrl, type FullStory } from "@/lib/site/news"
import { episodesForStory } from "@/lib/site/watch"
import { EpisodeGrid } from "@/components/site/watch"
import { Icon } from "@/components/site/icons"

export const revalidate = 60

// Without this the route is rendered on every request and never cached. Current stories are built
// at deploy; newer ones are rendered on their first visit, then cached and refreshed every minute.
export async function generateStaticParams() {
  const stories = await getStories()
  return stories.map((story) => ({ slug: story.slug }))
}

function absoluteImage(story: FullStory) {
  const src = imageSources(story.image).large
  return src.startsWith("http") ? src : `${SITE_URL}${src}`
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const story = await getStory((await params).slug)
  if (!story) return {}
  const metadata = pageMetadata({
    title: story.seoTitle ?? story.title,
    description: story.seoDescription ?? (story.summary || story.plainText),
    path: storyUrl(story.slug),
    image: absoluteImage(story),
    type: "article",
  })
  // Article details for link previews and search engines
  return {
    ...metadata,
    openGraph: {
      ...metadata.openGraph,
      type: "article" as const,
      publishedTime: story.publishedAt,
      modifiedTime: story.lastUpdated ?? story.publishedAt,
      section: story.categoryLabel,
      authors: [story.author?.name ?? "TNN Newsroom"],
    },
  }
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const story = await getStory((await params).slug)
  if (!story) notFound()

  const url = storyUrl(story.slug, true)
  const section = SECTIONS.find((s) => s.slug === story.sectionSlug)
  const isNewsroom = !story.author || story.author.slug === "tnn"
  const author = story.author ?? { name: "TNN Newsroom", slug: "tnn" }

  // Related reporting (see relatedStories) and any video episode that lists this story
  const [related, episodes] = await Promise.all([relatedStories(story), episodesForStory(story.id)])

  const articleLd = {
    "@context": "https://schema.org",
    "@type": STORY_TYPES[story.storyType].schema,
    headline: story.title,
    description: story.summary,
    datePublished: story.publishedAt,
    // Only substantial updates count, not typo fixes (Google News guidance)
    dateModified: story.lastUpdated ?? story.publishedAt,
    author: {
      "@type": isNewsroom ? "Organization" : "Person",
      name: author.name,
      url: `${SITE_URL}/authors/${author.slug}`,
    },
    publisher: {
      "@type": "NewsMediaOrganization",
      name: SITE_NAME,
      url: SITE_URL,
      logo: { "@type": "ImageObject", url: `${SITE_URL}/tnn-official-logo.png` },
    },
    image: [absoluteImage(story)],
    mainEntityOfPage: url,
    articleSection: story.categoryLabel,
  }

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
      ...(section ? [{ "@type": "ListItem", position: 2, name: section.title, item: `${SITE_URL}/category/${section.slug}` }] : []),
      { "@type": "ListItem", position: section ? 3 : 2, name: story.title, item: url },
    ],
  }

  const whatsapp = `https://wa.me/?text=${encodeURIComponent(`${story.title} ${url}`)}`
  const correction = `/contact?type=correction&article=${encodeURIComponent(storyUrl(story.slug))}`

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <article className="article">
        {(story.categoryLabel || story.regionTitle) && (
          <p className="label">
            {section ? <a href={`/category/${section.slug}`}>{story.categoryLabel}</a> : story.categoryLabel}
            {story.categoryLabel && story.regionTitle && " · "}
            {story.regionTitle}
          </p>
        )}
        {story.breaking && <span className="breaking-label">Breaking</span>}
        {story.typeLabel && <span className="type-label">{story.typeLabel}</span>}
        {story.archived && <span className="status-label">Archive</span>}
        <h1>{story.title}</h1>
        {story.summary && <p className="standfirst">{story.summary}</p>}
        <div className="byline">
          <span>
            By <a href={`/authors/${author.slug}`}>{author.name}</a>
          </span>
          <time dateTime={story.publishedAt}>Published {formatDateTime(story.publishedAt)}</time>
          {story.lastUpdated && <time dateTime={story.lastUpdated}>Updated {formatDateTime(story.lastUpdated)}</time>}
          <span>{readTimeFor(story)}</span>
        </div>
        {/* The editorial graphic repeats the headline, so stories without a photo have no cover */}
        {!story.image.graphic && (
          <figure className="cover">
            <StoryImg image={story.image} variant="cover" priority />
            {story.image.caption && <figcaption>{story.image.caption}</figcaption>}
          </figure>
        )}
        <div className="actions">
          <button type="button" data-share>
            <Icon name="share" />
            Share story
          </button>
          <a data-event="share_whatsapp" href={whatsapp} target="_blank" rel="noopener">
            <Icon name="send" />
            Share on WhatsApp
          </a>
          {/* nofollow: every story links here with its own address, and Google was crawling each copy of the contact page */}
          <a href={correction} rel="nofollow">
            <Icon name="flag" />
            Request a correction
          </a>
          <span role="status" id="share-status"></span>
        </div>
        <div className="article-body">
          {story.content && <ArticleBody value={story.content} />}
          {story.sources.length > 0 && (
            <section className="sources">
              <h2>Sources & further reading</h2>
              <ul>
                {story.sources.map((source) => (
                  <li key={source.url}>
                    <a href={source.url} target="_blank" rel="noopener noreferrer">
                      {source.title}
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
        <p className="meta">
          Read our <a href="/editorial-standards">editorial standards</a> and{" "}
          <a href="/corrections">corrections policy</a>.
        </p>
      </article>
      {episodes.length > 0 && (
        <section>
          <SectionHead title="Watch: on this story" href="/watch" linkText="Watch TNN" />
          <EpisodeGrid episodes={episodes} />
        </section>
      )}
      <FollowBand />
      {related.length > 0 && (
        <section>
          <SectionHead title="Related stories" />
          <StoryGrid stories={related} />
        </section>
      )}
    </>
  )
}
