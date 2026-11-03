import { notFound, permanentRedirect } from "next/navigation"

import { FollowBand, PageTitle } from "@/components/site/chrome"
import { FeatureStory, StoryGrid } from "@/components/site/stories"
import { SECTIONS } from "@/lib/site/config"
import { pageMetadata } from "@/lib/site/metadata"
import { getStoriesWith } from "@/lib/site/news"

export const revalidate = 60

const intro = (title: string) =>
  `Latest reporting and clearly marked archive stories in ${title.toLowerCase()}.`

// Older links used the Sanity category key or slug (e.g. /category/politics-governance)
const LEGACY_SLUGS: Record<string, string> = {
  "politics-governance": "politics",
  "politics-and-governance": "politics",
  "business-economy": "business",
  "business-and-economy": "business",
  "social-community-affairs": "community",
  "social-and-community-affairs": "community",
  "sports-entertainment": "sport-culture",
  "sports-and-entertainment": "sport-culture",
  "creative-cultural-industries": "sport-culture",
  "creative-and-cultural-industries": "sport-culture",
}

export function generateStaticParams() {
  return SECTIONS.map((section) => ({ slug: section.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const section = SECTIONS.find((s) => s.slug === slug)
  return section
    ? pageMetadata({ title: section.title, description: intro(section.title), path: `/category/${section.slug}` })
    : {}
}

export default async function SectionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const section = SECTIONS.find((s) => s.slug === slug)
  if (!section) {
    if (LEGACY_SLUGS[slug]) permanentRedirect(`/category/${LEGACY_SLUGS[slug]}`)
    notFound()
  }

  const [lead, ...rest] = await getStoriesWith("categories[0]->key in $keys", { keys: [...section.keys] })
  return (
    <>
      <PageTitle label="The Narrative Network" title={section.title} intro={intro(section.title)} />
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
