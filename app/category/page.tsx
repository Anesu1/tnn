import Link from "next/link"
import { client } from "@/sanity/lib/client"
import Header from "../Header"
import Footer from "../Footer"

export const revalidate = 60

interface Category {
  _id: string
  title: string
  description?: string
  slug?: string
}

async function getCategories() {
  const query = `*[_type == "category"] | order(title asc){
    _id,
    title,
    description,
    "slug": slug.current
  }`

  return await client.fetch<Category[]>(query)
}

export default async function CategoriesIndexPage() {
  const categories = await getCategories()

  return (
    <>
    
    <Header />
    
    
    <main className="min-h-screen bg-background">
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-3xl space-y-4">
          <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">
            Sections
          </span>
          <h1 className="text-4xl md:text-6xl font-serif font-black tracking-tighter">Explore Coverage</h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Browse dedicated desks covering politics, business, technology, and more.
          </p>
        </div>
      </section>

      <section className="container mx-auto px-4 pb-20">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <Link
              key={category._id}
              href={category.slug ? `/category/${category.slug}` : "/"}
              className="border border-border p-6 hover:border-accent transition-colors"
            >
              <h2 className="text-xl font-serif font-bold mb-2">{category.title}</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {category.description ?? "Curated reporting and analysis."}
              </p>
            </Link>
          ))}
        </div>
      </section>
    </main>
    <Footer />
    </>
  )
}
