import { FollowBand, PageTitle } from "@/components/site/chrome"
import { StoryGrid } from "@/components/site/stories"
import { pageMetadata } from "@/lib/site/metadata"
import { getStories } from "@/lib/site/news"

export const revalidate = 60

const INTRO =
  "Earlier reporting with its original publication date. Events and figures may have changed since publication."

export const metadata = pageMetadata({ title: "The TNN archive", description: INTRO, path: "/archive" })

export default async function ArchivePage() {
  const stories = await getStories("archived == true")
  return (
    <>
      <PageTitle label="The Narrative Network" title="The TNN archive" intro={INTRO} />
      {stories.length > 0 ? (
        <StoryGrid stories={stories} />
      ) : (
        <p className="empty">There are no archive stories yet. Browse the <a href="/latest">latest news</a>.</p>
      )}
      <FollowBand />
    </>
  )
}
