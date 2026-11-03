import { notFound } from "next/navigation"

import { ArticleBody } from "@/components/site/article-body"
import { SectionHead, StoryGrid } from "@/components/site/stories"
import { pageMetadata } from "@/lib/site/metadata"
import { getStoriesWith } from "@/lib/site/news"
import { STATIC_PAGES } from "@/lib/site/static-pages"
import { client } from "@/sanity/lib/client"

export const revalidate = 60

type Author = { _id: string; name: string; role?: string; bio?: unknown[] }

// "tnn" is the TNN Newsroom byline; its page text comes from the reference design
const NEWSROOM_SLUG = "tnn"

async function getAuthor(slug: string) {
  return client.fetch<Author | null>(`*[_type == "author" && slug.current == $slug][0]{_id, name, role, bio}`, { slug }, {
    next: { revalidate: 60 },
  })
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
        description: `Reporting by ${author.name} for The Narrative Network.`,
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
        <article className="prose">
          <span className="label">The Narrative Network</span>
          <h1>{author!.name}</h1>
          {author!.role && <p className="intro">{author!.role}</p>}
          {author!.bio && <ArticleBody value={author!.bio} />}
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
