import { notFound } from "next/navigation"
import { Header } from "@/components/Header"
import { Footer } from "@/components/Footer"
import { ArticleCard } from "@/components/ArticleCard"
import { client } from "@/sanity/lib/client"
import { urlFor } from "@/sanity/lib/image"
import Link from "next/link"

export const revalidate = 120

interface TagDetail {
  title: string
  description?: string
}

interface NewsItem {
  _id: string
  title: string
  excerpt?: string
  category?: string
  author?: string
  publishedAt?: string
  readTime?: string
  mainImage?: any
  slug?: string
}

async function getTag(slug: string) {
  const query = `*[_type == "tag" && slug.current == $slug][0]{
    title
  }`
  return client.fetch<TagDetail | null>(query, { slug })
}

async function getTagArticles(slug: string) {
  const query = `*[_type == "newsItem" && count(tags[@->slug.current == $slug]) > 0]
    | order(publishedAt desc){
      _id,
      title,
      excerpt,
      "category": categories[0]->title,
      "author": author->name,
      publishedAt,
      readTime,
      mainImage,
      "slug": slug.current
    }`
  return client.fetch<NewsItem[]>(query, { slug })
}

export default async function TopicPage({ params }: { params: { slug: string } }) {
  const tag = await getTag(params.slug)
  if (!tag) {
    notFound()
  }

  const articles = await getTagArticles(params.slug)

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <section className="container mx-auto px-4 pt-10 pb-6">
          <h1 className="text-4xl md:text-5xl font-serif font-bold">{tag.title}</h1>
          <p className="text-muted-foreground mt-2 max-w-2xl">
            Latest coverage and analysis on {tag.title}.
          </p>
        </section>
        <section className="container mx-auto px-4 pb-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.map((article) => (
              <Link key={article._id} href={article.slug ? `/news/${article.slug}` : "/news"}>
                <ArticleCard
                  category={article.category ?? "News"}
                  title={article.title}
                  excerpt={article.excerpt}
                  image={article.mainImage ? urlFor(article.mainImage).width(800).height(450).url() : undefined}
                  author={article.author}
                  date={
                    article.publishedAt
                      ? new Date(article.publishedAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })
                      : undefined
                  }
                />
              </Link>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
