"use client"
import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Clock } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { client } from "@/sanity/lib/client"

interface Article {
  _id: string
  title: string
  excerpt: string
  category: string
  author: string
  publishedAt: string
  readTime: string
  image: string
  slug: string // Added slug for linking to article details
}

export function LatestArticles() {
  const [articles, setArticles] = useState<Article[]>([])

  useEffect(() => {
    const fetchArticles = async () => {
      const query = `*[_type == "newsItem"] | order(publishedAt desc) {
        _id,
        title,
        excerpt,
        "category": categories[0]->title,
        "author": author->name,
        publishedAt,
        readTime,
        "image": mainImage.asset->url,
        "slug": slug.current // Fetching slug for linking
      }`

      const data = await client.fetch(query)
      setArticles(data)
    }

    fetchArticles()
  }, [])

  return (
    <section className="py-12 md:py-16">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-bold mb-8">Latest Articles</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article) => (
            <Link key={article._id} href={`/news/${article.slug}`} passHref>
              <Card className="group overflow-hidden cursor-pointer hover:shadow-lg transition-shadow">
                <div className="relative aspect-video overflow-hidden">
                  <Image
                    src={article.image || "/placeholder.svg"}
                    alt={article.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <Badge className="absolute top-3 left-3 bg-accent text-accent-foreground">
                    {article.category}
                  </Badge>
                </div>
                <div className="p-4">
                  <h3 className="font-medium line-clamp-2 text-lg mb-2 group-hover:text-accent transition-colors">
                    {article.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-2 line-clamp-3">{article.excerpt}</p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>{article.readTime}</span>
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>

        
      </div>
    </section>
  )
}
