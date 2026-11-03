import { notFound } from "next/navigation"

import { FollowBand, PageTitle } from "@/components/site/chrome"
import { StoryGrid } from "@/components/site/stories"
import { REGIONS } from "@/lib/site/config"
import { pageMetadata } from "@/lib/site/metadata"
import { getStoriesWith } from "@/lib/site/news"

export const revalidate = 60

export function generateStaticParams() {
  return REGIONS.map((region) => ({ region: region.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ region: string }> }) {
  const { region: slug } = await params
  const region = REGIONS.find((r) => r.slug === slug)
  return region ? pageMetadata({ title: region.title, description: region.intro, path: `/region/${region.slug}` }) : {}
}

export default async function RegionPage({ params }: { params: Promise<{ region: string }> }) {
  const { region: slug } = await params
  const region = REGIONS.find((r) => r.slug === slug)
  if (!region) notFound()

  const stories = await getStoriesWith("region == $region", { region: region.slug })
  return (
    <>
      <PageTitle label="The Narrative Network" title={region.title} intro={region.intro} />
      {stories.length > 0 ? (
        <StoryGrid stories={stories} />
      ) : (
        <p className="empty">No stories from {region.title} yet. Browse the <a href="/latest">latest news</a>.</p>
      )}
      <FollowBand />
    </>
  )
}
