import { FollowBand, PageTitle } from "@/components/site/chrome"
import { Icon } from "@/components/site/icons"
import { SITE_NAME, SITE_URL } from "@/lib/site/config"
import { pageMetadata } from "@/lib/site/metadata"
import { LIVE_STORY, storyUrl } from "@/lib/site/news"
import { client } from "@/sanity/lib/client"

export const revalidate = 300

export const metadata = pageMetadata({
  title: "Our reporters",
  description: "The reporters and correspondents behind The Narrative Network’s journalism on Zimbabwe, Africa and the world, with their latest stories.",
  path: "/authors",
})

type Reporter = {
  name: string
  slug: string
  role?: string
  photo?: string
  count: number
  latest: { title: string; slug: string }[]
}

// Bylines that aren't a named person go after the reporters
const GENERIC_BYLINES = new Set(["staff reporter", "tnn newsroom"])

async function getReporters() {
  const rows = await client.fetch<Reporter[]>(
    `*[_type == "author" && defined(slug.current)]{
      name, "slug": slug.current, role, "photo": photo.asset->url,
      "count": count(*[${LIVE_STORY} && author._ref == ^._id]),
      "latest": *[${LIVE_STORY} && author._ref == ^._id] | order(publishedAt desc)[0...3]{title, "slug": slug.current}
    }[count > 0]`,
    {},
    { next: { revalidate: 300 } },
  )
  const generic = (r: Reporter) => GENERIC_BYLINES.has(r.name.trim().toLowerCase())
  return rows.sort((a, b) => Number(generic(a)) - Number(generic(b)) || b.count - a.count || a.name.localeCompare(b.name))
}

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join("")

export default async function ReportersPage() {
  const reporters = await getReporters()
  const ld = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `Reporters at ${SITE_NAME}`,
    url: `${SITE_URL}/authors`,
    mainEntity: {
      "@type": "ItemList",
      itemListElement: reporters.map((r, i) => ({ "@type": "ListItem", position: i + 1, url: `${SITE_URL}/authors/${r.slug}`, name: r.name })),
    },
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <PageTitle
        label="The Narrative Network"
        title="Our reporters"
        intro="The people behind TNN’s reporting. Open a profile for everything they have written."
      />
      <div className="reporter-grid">
        {reporters.map((r) => (
          <section key={r.slug} className="reporter-card">
            <a className="reporter-head" href={`/authors/${r.slug}`}>
              {r.photo ? (
                <img src={`${r.photo}?w=128&h=128&fit=crop&fm=webp&q=80`} width={64} height={64} alt="" loading="lazy" />
              ) : (
                <span className="reporter-initials" aria-hidden="true">
                  {initials(r.name)}
                </span>
              )}
              <span>
                <h2>{r.name}</h2>
                <span className="meta">
                  {[r.role, `${r.count} ${r.count === 1 ? "story" : "stories"}`].filter(Boolean).join(" · ")}
                </span>
              </span>
            </a>
            <ul>
              {r.latest.map((s) => (
                <li key={s.slug}>
                  <a href={storyUrl(s.slug)}>{s.title}</a>
                </li>
              ))}
            </ul>
            <a className="reporter-more" href={`/authors/${r.slug}`}>
              All stories by {r.name}
              <Icon name="arrow-right" />
            </a>
          </section>
        ))}
      </div>
      <p className="meta">
        Want to write for TNN? <a href="/contact?type=general">Get in touch with the newsroom</a>.
      </p>
      <FollowBand />
    </>
  )
}
