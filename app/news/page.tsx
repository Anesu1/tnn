import Link from "next/link"
import { client } from "@/sanity/lib/client"
import { urlFor } from "@/sanity/lib/image"
import { ArticleCard } from "@/components/ArticleCard"
import Footer from "../Footer"
import Header from "../Header"

export const revalidate = 60

interface Article {
  _id: string
  title: string
  excerpt?: string
  category?: string
  author?: string
  publishedAt?: string
  mainImage?: any
  slug?: string
}

async function getNews() {
  const query = `*[_type == "newsItem"] | order(publishedAt desc)[0...12]{
    _id,
    title,
    excerpt,
    "category": categories[0]->title,
    "author": author->name,
    publishedAt,
    mainImage,
    "slug": slug.current
  }`

  return await client.fetch<Article[]>(query)
}

export default async function NewsPage() {
  const articles = await getNews()

  return (
    <>
    <Header />
    <main className="min-h-screen bg-background">
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-3xl space-y-4">
          <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">
            Latest
          </span>
          <h1 className="text-4xl md:text-6xl font-serif font-black tracking-tighter">Top Stories</h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Breaking developments and essential context from across our reporting desks.
          </p>
        </div>
      </section>

      <section className="container mx-auto px-4 pb-20">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {articles.map((item) => (
            <Link key={item._id} href={item.slug ? `/article/${item.slug}` : "/news"}>
              <ArticleCard
                category={item.category ?? "News"}
                title={item.title}
                excerpt={item.excerpt}
                image={item.mainImage ? urlFor(item.mainImage).width(900).height(600).url() : undefined}
                author={item.author}
                date={
                  item.publishedAt
                    ? new Date(item.publishedAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric"
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
    </>
  )
}
