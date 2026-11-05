import type { Metadata } from "next"

import { FollowBand } from "@/components/site/chrome"
import { BreakingBand, FeatureStory, SectionHead, SideStory, StoryGrid, VideoGrid } from "@/components/site/stories"
import { formatDate, SITE_DESCRIPTION, SITE_NAME, SITE_URL, WHATSAPP_URL, YOUTUBE_URL } from "@/lib/site/config"
import { getStories, homepageStories } from "@/lib/site/news"

export const revalidate = 60

const TITLE = `${SITE_NAME} — Zimbabwe, Africa and the world`

export const metadata: Metadata = {
  title: { absolute: `${TITLE} | TNN` },
  description: SITE_DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: {
    title: TITLE,
    description: SITE_DESCRIPTION,
    url: `${SITE_URL}/`,
    type: "website",
    siteName: SITE_NAME,
    images: [`${SITE_URL}/assets/tnn-social.png`],
  },
  twitter: { card: "summary_large_image" },
}

const ORGANIZATION_LD = {
  "@context": "https://schema.org",
  "@type": "NewsMediaOrganization",
  name: SITE_NAME,
  url: SITE_URL,
  logo: `${SITE_URL}/tnn-official-logo.png`,
  founder: { "@type": "Person", name: "Kudzai Tinago" },
  sameAs: [
    YOUTUBE_URL,
    "https://www.facebook.com/thenarrativenetwork",
    "https://www.instagram.com/the.narrative.network/",
    "https://www.linkedin.com/company/135218065/",
    WHATSAPP_URL,
  ],
}

export default async function HomePage() {
  const stories = await getStories("", 80)
  const current = stories.filter((story) => !story.archived)
  const archived = stories.filter((story) => story.archived)
  // Placement is the editors' choice in the Studio, separate from publish time
  const { lead, top, latest, breaking } = homepageStories(current.length ? current : stories)
  const zimbabwe = current.filter((story) => story.region === "zimbabwe").slice(0, 3)
  const africa = current.filter((story) => story.region === "africa").slice(0, 3)
  const world = stories.filter((story) => story.region === "world").slice(0, 3)

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ORGANIZATION_LD) }} />

      {/* The lead carries its own BREAKING label, so the band only lists the other breaking stories */}
      <BreakingBand stories={breaking.filter((story) => story.id !== lead?.id)} />

      {lead && (
        <>
          <div className="edition">
            <strong>{lead.breaking ? "Breaking news" : "Top story"}</strong>
            <span>Latest publication · {formatDate(current[0]?.publishedAt ?? lead.publishedAt)}</span>
          </div>
          <section className="hero" aria-label="Top stories">
            <FeatureStory story={lead} />
            <aside className="side">
              <h2>Top stories</h2>
              {top.map((story) => (
                <SideStory key={story.id} story={story} />
              ))}
            </aside>
          </section>
        </>
      )}

      {latest.length > 0 && (
        <section>
          <SectionHead title="Latest news" href="/latest" />
          <StoryGrid stories={latest.slice(0, 12)} />
        </section>
      )}

      {zimbabwe.length > 0 && (
        <section>
          <SectionHead title="Zimbabwe" href="/region/zimbabwe" />
          <StoryGrid stories={zimbabwe} />
        </section>
      )}

      {africa.length > 0 && (
        <section>
          <SectionHead title="Across Africa" href="/region/africa" />
          <StoryGrid stories={africa} />
        </section>
      )}

      {world.length > 0 && (
        <section>
          <SectionHead title="World & international context" href="/region/world" />
          <StoryGrid stories={world} />
        </section>
      )}

      <section>
        <SectionHead title="Watch TNN" href="/watch" linkText="All programmes" />
        <VideoGrid limit={3} />
      </section>

      <FollowBand />

      {archived.length > 0 && (
        <section>
          <SectionHead title="From the archive" href="/archive" linkText="Explore the archive" />
          <p>Earlier reporting, clearly dated. These articles reflect the information available when first published.</p>
          <StoryGrid stories={archived.slice(0, 3)} />
        </section>
      )}
    </>
  )
}
