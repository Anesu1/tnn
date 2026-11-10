import { notFound } from "next/navigation"

import { ArticleBody } from "@/components/site/article-body"
import { SectionHead, StoryGrid } from "@/components/site/stories"
import { SITE_NAME, SITE_URL } from "@/lib/site/config"
import { pageMetadata } from "@/lib/site/metadata"
import { getStoriesWith } from "@/lib/site/news"
import { STATIC_PAGES } from "@/lib/site/static-pages"
import { client } from "@/sanity/lib/client"

export const revalidate = 60

type Author = {
  _id: string
  name: string
  role?: string
  bio?: unknown[]
  bioText?: string
  photo?: { url: string; alt?: string }
  links?: { platform?: string; url?: string }[]
}

// "tnn" is the TNN Newsroom byline; its page text comes from the reference design
const NEWSROOM_SLUG = "tnn"

async function getAuthor(slug: string) {
  return client.fetch<Author | null>(`*[_type == "author" && slug.current == $slug][0]{
    _id, name, role, bio, "bioText": pt::text(bio), "photo": photo{"url": asset->url, alt}, "links": socialLinks[]{platform, url}
  }`, { slug }, {
    next: { revalidate: 60 },
  })
}

// Only real web addresses are shown or given to search engines
function links(author: Author) {
  return (author.links ?? []).filter((l): l is { platform?: string; url: string } => !!l.url && /^https?:\/\//.test(l.url))
}

function personLd(author: Author, slug: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: author.name,
    url: `${SITE_URL}/authors/${slug}`,
    ...(author.role && { jobTitle: author.role }),
    ...(author.bioText && { description: author.bioText.slice(0, 300) }),
    ...(author.photo?.url && { image: author.photo.url }),
    worksFor: { "@type": "NewsMediaOrganization", name: SITE_NAME, url: SITE_URL },
    ...(links(author).length > 0 && { sameAs: links(author).map((l) => l.url) }),
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  if (slug === NEWSROOM_SLUG) {
    const page = STATIC_PAGES["tnn-newsroom"]
    return pageMetadata({ title: "TNN Newsroom", description: page.description, path: `/authors/${slug}` })
  }
  const author = await getAuthor(slug)
  return author
    ? pageMetadata({
        title: author.name,
        description: author.bioText?.slice(0, 160) || `${author.role ? `${author.role}, ` : ""}reporting by ${author.name} for The Narrative Network.`,
        path: `/authors/${slug}`,
      })
    : {}
}

export default async function AuthorPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const author = await getAuthor(slug)
  if (!author && slug !== NEWSROOM_SLUG) notFound()

  const stories = author ? await getStoriesWith("author._ref == $authorId", { authorId: author._id }) : []

  return (
    <>
      {slug === NEWSROOM_SLUG ? (
        <div dangerouslySetInnerHTML={{ __html: STATIC_PAGES["tnn-newsroom"].html }} />
      ) : (
        <article className="prose author-profile">
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personLd(author!, slug)) }} />
          {author!.photo?.url && (
            <img
              className="author-photo"
              src={`${author!.photo.url}?w=320&h=320&fit=crop&fm=webp&q=82`}
              width={160}
              height={160}
              alt={author!.photo.alt || author!.name}
            />
          )}
          <span className="label">The Narrative Network</span>
          <h1>{author!.name}</h1>
          {author!.role && <p className="intro">{author!.role}</p>}
          {author!.bio && <ArticleBody value={author!.bio} />}
          {links(author!).length > 0 && (
            <ul className="author-links">
              {links(author!).map((link) => (
                <li key={link.url}>
                  <a href={link.url} target="_blank" rel="noopener noreferrer me">
                    {link.platform || new URL(link.url).hostname.replace(/^www\./, "")}
                  </a>
                </li>
              ))}
            </ul>
          )}
          <p>
            <a href="/contact?type=correction">Contact the newsroom</a> ·{" "}
            <a href="/editorial-standards">Editorial standards</a>
          </p>
        </article>
      )}
      {stories.length > 0 && (
        <section>
          <SectionHead title={`Stories by ${author!.name}`} />
          <StoryGrid stories={stories} />
        </section>
      )}
    </>
  )
}
