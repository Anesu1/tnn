import { StoryTypeListing, storyTypeMetadata } from "@/components/site/story-type-page"

export const revalidate = 60

export const generateMetadata = () => storyTypeMetadata("interviews")

export default function Page() {
  return <StoryTypeListing page="interviews" />
}
