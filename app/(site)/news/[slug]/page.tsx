import { notFound } from "next/navigation"

import { ArticleBody } from "@/components/site/article-body"
import { FollowBand } from "@/components/site/chrome"
import { SectionHead, StoryGrid, StoryImg } from "@/components/site/stories"
import { formatDateTime, SECTIONS, SITE_NAME, SITE_URL, STORY_TYPES } from "@/lib/site/config"
import { pageMetadata } from "@/lib/site/metadata"
import { getStoriesWith, getStory, imageSources, readTimeFor, storyUrl, type FullStory } from "@/lib/site/news"
import { Icon } from "@/components/site/icons"

export const revalidate = 60

function absoluteImage(story: FullStory) {
  const src = imageSources(story.image).large
  return src.startsWith("http") ? src : `${SITE_URL}${src}`
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const story = await getStory((await params).slug)
  if (!story) return {}
  return pageMetadata({
    title: story.title,
    description: story.summary || story.plainText,
    path: storyUrl(story.slug),
    image: absoluteImage(story),
    type: "article",
  })
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const story = await getStory((await params).slug)
  if (!story) notFound()

  const url = storyUrl(story.slug, true)
  const section = SECTIONS.find((s) => s.slug === story.sectionSlug)
  const isNewsroom = !story.author || story.author.slug === "tnn"
  const author = story.author ?? { name: "TNN Newsroom", slug: "tnn" }

  // Related: same section first, topped up with the latest stories
  const sameSection = section
    ? await getStoriesWith("categories[0]->key in $keys && _id != $id", { keys: [...section.keys], id: story.id }, 3)
    : []
  const latest = sameSection.length >= 3 ? [] : await getStoriesWith("_id != $id", { id: story.id }, 6)
  const related = [...sameSection, ...latest.filter((s) => !sameSection.some((r) => r.id === s.id))].slice(0, 3)

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

  const whatsapp = `https://wa.me/?text=${encodeURIComponent(`${story.title} ${url}`)}`
  const correction = `/contact?type=correction&article=${encodeURIComponent(storyUrl(story.slug))}`

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }} />
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
          <a href={correction}>
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
