import type { Metadata } from "next"

import { FollowBand, PageTitle } from "@/components/site/chrome"
import { FeatureStory, StoryGrid } from "@/components/site/stories"
import { pageMetadata } from "@/lib/site/metadata"
import { getStoriesWith } from "@/lib/site/news"
import { STORY_TYPE_PAGES, type StoryTypePage } from "@/lib/site/story-type-pages"

const storiesOf = (page: StoryTypePage) => getStoriesWith("storyType == $type", { type: STORY_TYPE_PAGES[page].type })

// Empty listings are kept out of search results until they have stories (thin pages hurt ranking)
export async function storyTypeMetadata(page: StoryTypePage): Promise<Metadata> {
  const info = STORY_TYPE_PAGES[page]
  const stories = await storiesOf(page)
  return {
    ...pageMetadata({ title: info.title, description: info.description, path: `/${page}` }),
    ...(stories.length === 0 && { robots: { index: false, follow: true } }),
  }
}

export async function StoryTypeListing({ page }: { page: StoryTypePage }) {
  const info = STORY_TYPE_PAGES[page]
  const [lead, ...rest] = await storiesOf(page)
  return (
    <>
      <PageTitle label="The Narrative Network" title={info.title} intro={info.intro} />
      {lead ? (
        <>
          <div className="listing-lead">
            <FeatureStory story={lead} heading="h2" />
          </div>
          <StoryGrid stories={rest} />
        </>
      ) : (
        <p className="empty">
          Nothing published here yet. Read the <a href="/latest">latest news</a>.
        </p>
      )}
      <FollowBand />
    </>
  )
}
