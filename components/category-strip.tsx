import Link from "next/link"
import { client } from "@/sanity/lib/client"

export const revalidate = 300

interface CategoryItem {
  _id: string
  title: string
  slug?: string
  postCount: number
}

async function getCategories() {
  const query = `*[_type == "category"] | order(title asc) {
    _id,
    title,
    "slug": slug.current,
    "postCount": count(*[_type == "newsItem" && references(^._id)])
  }`
  return client.fetch<CategoryItem[]>(query)
}

export async function CategoryStrip() {
  const categories = await getCategories()
  if (!categories.length) {
    return null
  }

  return (
    <div className="border-b border-border bg-secondary/40">
      <div className="container mx-auto px-4 py-3 flex flex-wrap gap-4 text-xs font-bold uppercase tracking-widest">
        {categories.map((category) => (
          <Link
            key={category._id}
            href={category.slug ? `/${category.slug}` : "/"}
            className="text-muted-foreground hover:text-accent transition-colors"
          >
            {category.title} <span className="text-[10px] text-muted-foreground/70">({category.postCount})</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
