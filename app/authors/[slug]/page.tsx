import { notFound } from "next/navigation"
import { Header } from "@/components/Header"
import { Footer } from "@/components/Footer"
import { ArticleCard } from "@/components/ArticleCard"
import { client } from "@/sanity/lib/client"
import { urlFor } from "@/sanity/lib/image"
import Image from "next/image"
import Link from "next/link"

export const revalidate = 120

interface AuthorDetail {
  name: string
  role?: string
  bio?: any[]
  photo?: any
}

interface NewsItem {
  _id: string
  title: string
  excerpt?: string
  category?: string
  publishedAt?: string
  readTime?: string
  mainImage?: any
  slug?: string
}

async function getAuthor(slug: string) {
  const query = `*[_type == "author" && slug.current == $slug][0]{
    name,
    role,
    bio,
    photo
  }`
  return client.fetch<AuthorDetail | null>(query, { slug })
}

async function getAuthorArticles(slug: string) {
  const query = `*[_type == "newsItem" && author->slug.current == $slug]
    | order(publishedAt desc){
      _id,
      title,
      excerpt,
      "category": categories[0]->title,
      publishedAt,
      readTime,
      mainImage,
      "slug": slug.current
    }`
  return client.fetch<NewsItem[]>(query, { slug })
}

export default async function AuthorPage({ params }: { params: { slug: string } }) {
  const author = await getAuthor(params.slug)
  if (!author) {
    notFound()
  }

  const articles = await getAuthorArticles(params.slug)

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <section className="container mx-auto px-4 pt-10 pb-6">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <div className="relative h-24 w-24 rounded-full overflow-hidden bg-muted">
              {author.photo && (
                <Image
                  src={urlFor(author.photo).width(200).height(200).url()}
                  alt={author.name}
                  fill
                  className="object-cover"
                />
              )}
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-serif font-bold">{author.name}</h1>
              {author.role && <p className="text-muted-foreground mt-1">{author.role}</p>}
            </div>
          </div>
        </section>
        <section className="container mx-auto px-4 pb-16">
          <div className="flex items-center justify-between border-b-2 border-primary mb-6 pb-2">
            <h2 className="text-2xl font-serif font-bold">Latest from {author.name}</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.map((article) => (
              <Link key={article._id} href={article.slug ? `/news/${article.slug}` : "/news"}>
                <ArticleCard
                  category={article.category ?? "News"}
                  title={article.title}
                  excerpt={article.excerpt}
                  image={article.mainImage ? urlFor(article.mainImage).width(800).height(450).url() : undefined}
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
