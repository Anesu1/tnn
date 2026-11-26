import { FollowBand, PageTitle } from "@/components/site/chrome"
import { StoryGrid } from "@/components/site/stories"
import { pageMetadata } from "@/lib/site/metadata"
import { getStories } from "@/lib/site/news"

export const revalidate = 60

const INTRO = "The latest reporting from TNN. Earlier articles are available in the archive."

export const metadata = pageMetadata({
  title: "Latest Zimbabwe and Africa news",
  description:
    "The latest news from The Narrative Network, newest first: Zimbabwe, Africa and the world, across politics, business, health, education, sport and culture.",
  path: "/latest",
})

export default async function LatestPage() {
  const stories = await getStories("archived != true")
  return (
    <>
      <PageTitle label="The Narrative Network" title="Latest news" intro={INTRO} />
      <StoryGrid stories={stories} />
      <FollowBand />
    </>
  )
}
