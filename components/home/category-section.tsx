import Link from "next/link"
import { ArticleCard } from "@/components/ArticleCard"
import { urlFor } from "@/sanity/lib/image"

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

interface CategorySectionProps {
  title: string
  href: string
  items: NewsItem[]
}

export function CategorySection({ title, href, items }: CategorySectionProps) {
  if (!items.length) {
    return null
  }

  return (
    <section className="container mx-auto px-4 py-10">
      <div className="flex items-center justify-between border-b-2 border-primary mb-6 pb-2">
        <h2 className="text-2xl font-serif font-bold">{title}</h2>
        <Link href={href} className="text-xs font-bold text-accent uppercase tracking-widest hover:underline">
          View All
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {items.slice(0, 3).map((item) => (
          <Link key={item._id} href={item.slug ? `/news/${item.slug}` : "/news"}>
            <ArticleCard
              category={item.category ?? title}
              title={item.title}
              excerpt={item.excerpt}
              image={item.mainImage ? urlFor(item.mainImage).width(800).height(450).url() : undefined}
              author={item.author}
              date={
                item.publishedAt
                  ? new Date(item.publishedAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })
                  : undefined
              }
            />
          </Link>
        ))}
      </div>
    </section>
  )
}
