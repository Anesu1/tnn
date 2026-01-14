import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp } from "lucide-react"
import Image from "next/image"

const trendingStories = [
  {
    id: 1,
    title: "Global Climate Summit Reaches Historic Agreement",
    category: "Environment",
    image: "/climate-summit-global.png",
    time: "15 min ago",
  },
  {
    id: 2,
    title: "Tech Giants Announce Revolutionary AI Partnership",
    category: "Technology",
    image: "/technology-ai.jpg",
    time: "1 hour ago",
  },
  {
    id: 3,
    title: "Markets Rally on Economic Recovery Signs",
    category: "Business",
    image: "/stock-market-analysis.png",
    time: "2 hours ago",
  },
]

export function TrendingNews() {
  return (
    <section className="bg-muted/30 py-12 md:py-16">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-2 mb-8">
          <TrendingUp className="h-6 w-6 text-accent" />
          <h2 className="text-2xl md:text-3xl font-bold">Trending Now</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trendingStories.map((story) => (
            <Card key={story.id} className="group overflow-hidden cursor-pointer hover:shadow-lg transition-shadow">
              <div className="relative aspect-video overflow-hidden">
                <Image
                  src={story.image || "/placeholder.svg"}
                  alt={story.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <Badge className="absolute top-3 left-3 bg-accent text-accent-foreground">{story.category}</Badge>
              </div>
              <div className="p-5">
                <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors leading-tight">
                  {story.title}
                </h3>
                <p className="text-sm text-muted-foreground">{story.time}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
