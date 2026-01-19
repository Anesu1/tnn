"use client"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card } from "@/components/ui/card"
import Link from "next/link"
import { useEffect, useState } from "react"
import { client } from "@/sanity/lib/client"

interface Category {
  id: string
  title: string
  description: string
  key: string
  color: string
  isBreaking: boolean
  featured: boolean
  order: number
  seo: {
    metaTitle: string
    metaDescription: string
  }
}

const CategoriesPage = () => {
  const [categories, setCategories] = useState<Category[]>([])

  useEffect(() => {
    const fetchCategories = async () => {
      const data = await client.fetch(
        `*[_type == "category"] | order(order asc) {
          _id,
          title,
          description,
          "id": _id,
          key,
          color,
          isBreaking,
          featured,
          order,
          seo
        }`
      )
      setCategories(data)
    }

    fetchCategories()
  }, [])

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <section className="container mx-auto px-4 py-8 md:py-12">
          <div className="mb-12">
            <h1 className="text-3xl md:text-5xl font-bold mb-4">Browse by Category</h1>
            <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">
              Explore news and content organized by topic. Select a category to see the latest articles and videos.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category) => (
              <Link key={category.id} href={`/categories/${category.key}`}>
                <Card
                  className="group h-full p-6 cursor-pointer hover:shadow-lg transition-all hover:border-primary"
                  style={{ borderColor: category.color }}
                >
                  <div className="flex flex-col items-center text-center">
                    <div
                      className={`h-16 w-16 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                      style={{ backgroundColor: category.color }}
                    >
                      {category.isBreaking && (
                        <span className="text-xs font-bold text-red-600">Breaking</span>
                      )}
                    </div>
                    <h3 className="font-bold text-xl mb-2 group-hover:text-primary transition-colors">
                      {category.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
                      {category.description}
                    </p>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}

export default CategoriesPage
