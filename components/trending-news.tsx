"use client"
import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp } from "lucide-react"
import Image from "next/image"
import { client } from "@/sanity/lib/client"

interface TrendingStory {
  _id: string
  title: string
  category: string
  image: string
  publishedAt: string
}

export function TrendingNews() {
  const [trendingStories, setTrendingStories] = useState<TrendingStory[]>([])

  useEffect(() => {
    const fetchTrendingStories = async () => {
      const query = `*[_type == "newsItem" && trending == true] | order(publishedAt desc) {
        _id,
        title,
        "category": categories[0]->title,
        "image": mainImage.asset->url,
        publishedAt
      }`

      const data = await client.fetch(query)
      setTrendingStories(data)
    }

    fetchTrendingStories()
  }, [])

  return (
    <section className="bg-muted/30 py-12 md:py-16">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-2 mb-8">
          <TrendingUp className="h-6 w-6 text-accent" />
          <h2 className="text-2xl md:text-3xl font-bold">Trending Now</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trendingStories.slice(0,3).map((story) => (
            <Card key={story._id} className="group overflow-hidden cursor-pointer hover:shadow-lg transition-shadow">
              <div className="relative aspect-video overflow-hidden">
                <Image
                  src={story.image || "/placeholder.svg"}
                  alt={story.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <Badge className="absolute top-3 left-3 bg-accent text-accent-foreground">{story.category}</Badge>
              </div>
              <div className="p-4">
                <h3 className="font-medium text-lg mb-2 group-hover:text-accent transition-colors">
                  {story.title}
                </h3>
                <p className="text-sm text-muted-foreground">{new Date(story.publishedAt).toLocaleString()}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
