import { notFound } from "next/navigation"

import { FollowBand, PageTitle } from "@/components/site/chrome"
import { FeatureStory, StoryGrid } from "@/components/site/stories"
import { SECTIONS } from "@/lib/site/config"
import { pageMetadata } from "@/lib/site/metadata"
import { getStoriesWith } from "@/lib/site/news"

export const revalidate = 60

// Older links used a Sanity category key or slug (e.g. /category/politics-governance), or a
// section that has since been renamed or replaced
export function generateStaticParams() {
  return SECTIONS.map((section) => ({ slug: section.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const section = SECTIONS.find((s) => s.slug === slug)
  return section
    ? pageMetadata({ title: `${section.title} news`, description: `${section.about} Latest reporting from TNN.`, path: `/category/${section.slug}` })
    : {}
}

export default async function SectionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const section = SECTIONS.find((s) => s.slug === slug)
  if (!section) {
    // Old section addresses are redirected in next.config.mjs
    notFound()
  }

  const [lead, ...rest] = await getStoriesWith("categories[0]->key in $keys", { keys: [...section.keys] })
  return (
    <>
      <PageTitle label="The Narrative Network" title={section.title} intro={section.about} />
      {lead ? (
        <>
          <div className="listing-lead">
            <FeatureStory story={lead} heading="h2" />
          </div>
          <StoryGrid stories={rest} />
        </>
      ) : (
        <p className="empty">No stories in {section.title} yet. Browse the <a href="/latest">latest news</a>.</p>
      )}
      <FollowBand />
    </>
  )
}
