import { notFound } from "next/navigation"
import Link from "next/link"
import { client } from "@/sanity/lib/client"
import { urlFor } from "@/sanity/lib/image"
import { ArticleCard } from "@/components/ArticleCard"
import Footer from "../../Footer"
import Header from "../../Header"

export const revalidate = 60

interface Category {
  title: string
  description?: string
}

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

async function getCategoryData(slug: string) {
  const categoryQuery = `*[_type == "category" && slug.current == $slug][0]{
    title,
    description
  }`

  const articlesQuery = `*[_type == "newsItem" && count(categories[@->slug.current == $slug]) > 0]
    | order(publishedAt desc)[0...12]{
      _id,
      title,
      excerpt,
      "category": categories[0]->title,
      "author": author->name,
      publishedAt,
      mainImage,
      "slug": slug.current
    }`

  const [category, articles] = await Promise.all([
    client.fetch<Category | null>(categoryQuery, { slug }),
    client.fetch<Article[]>(articlesQuery, { slug })
  ])

  return { category, articles }
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const { category, articles } = await getCategoryData(slug)

  if (!category) {
    notFound()
  }

  return (
    <>
    <Header />
    <main className="min-h-screen bg-background">
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-3xl space-y-4">
          <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">
            Section
          </span>
          <h1 className="text-4xl md:text-6xl font-serif font-black tracking-tighter">
            {category.title}
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            {category.description ?? "Curated reporting, analysis, and live coverage from our newsroom."}
          </p>
          <div className="flex flex-wrap items-center gap-3 text-xs font-bold uppercase tracking-widest text-muted-foreground">
            <Link href="/news" className="hover:text-accent">Latest News</Link>
            <span className="h-1 w-1 rounded-full bg-muted-foreground/60" />
            <Link href="/subscribe" className="hover:text-accent">Subscribe</Link>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 pb-20">
        {articles.length ? (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {articles.map((item) => (
              <Link key={item._id} href={item.slug ? `/article/${item.slug}` : "/news"}>
                <ArticleCard
                  category={item.category ?? category.title}
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
        ) : (
          <div className="border border-border p-12 text-center text-sm text-muted-foreground">
            No stories in this section yet. Check back soon.
          </div>
        )}
      </section>
    </main>
    <Footer />
    </>
    
  )
}
