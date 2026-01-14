import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Clock } from "lucide-react"
import Image from "next/image"

const articles = [
  {
    id: 1,
    title: "Space Agency Confirms Plans for Mars Colony by 2035",
    excerpt:
      "In a groundbreaking announcement, the space agency revealed comprehensive plans for establishing the first permanent human settlement on Mars...",
    category: "Science",
    author: "Sarah Johnson",
    date: "Jan 12, 2026",
    readTime: "5 min read",
    image: "/mars-space.jpg",
  },
  {
    id: 2,
    title: "Revolutionary Cancer Treatment Shows 95% Success Rate",
    excerpt:
      "Medical researchers announce breakthrough therapy that could change cancer treatment forever, with unprecedented success in clinical trials...",
    category: "Health",
    author: "Dr. Michael Chen",
    date: "Jan 11, 2026",
    readTime: "7 min read",
    image: "/medical-research-lab.png",
  },
  {
    id: 3,
    title: "Electric Vehicle Sales Surpass Traditional Cars for First Time",
    excerpt:
      "Historic milestone as electric vehicles outsell gasoline-powered cars globally, marking a major shift in the automotive industry...",
    category: "Automotive",
    author: "Emma Rodriguez",
    date: "Jan 11, 2026",
    readTime: "4 min read",
    image: "/electric-cars.jpg",
  },
  {
    id: 4,
    title: "Ancient City Discovered Beneath Amazon Rainforest",
    excerpt:
      "Archaeologists uncover evidence of a previously unknown civilization with advanced urban planning dating back thousands of years...",
    category: "History",
    author: "James Peterson",
    date: "Jan 10, 2026",
    readTime: "6 min read",
    image: "/ancient-ruins.png",
  },
  {
    id: 5,
    title: "Quantum Computing Breakthrough Solves Decade-Old Problem",
    excerpt:
      "Scientists achieve quantum supremacy in practical application, solving complex calculations previously thought impossible...",
    category: "Technology",
    author: "Lisa Wang",
    date: "Jan 10, 2026",
    readTime: "8 min read",
    image: "/quantum-computer.jpg",
  },
  {
    id: 6,
    title: "Renewable Energy Now Powers 60% of Global Grid",
    excerpt:
      "Milestone achievement as renewable energy sources overtake fossil fuels, signaling major progress in climate action...",
    category: "Environment",
    author: "David Kim",
    date: "Jan 9, 2026",
    readTime: "5 min read",
    image: "/solar-panels-rooftop.png",
  },
]

export function LatestArticles() {
  return (
    <section className="container mx-auto px-4 py-12 md:py-16">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl md:text-3xl font-bold">Latest Articles</h2>
        <Button variant="outline">View All</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {articles.map((article) => (
          <Card
            key={article.id}
            className="group overflow-hidden cursor-pointer hover:shadow-lg transition-shadow flex flex-col"
          >
            <div className="relative aspect-[4/3] overflow-hidden">
              <Image
                src={article.image || "/placeholder.svg"}
                alt={article.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="p-5 flex flex-col flex-1">
              <Badge variant="secondary" className="w-fit mb-3">
                {article.category}
              </Badge>
              <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors leading-tight line-clamp-2">
                {article.title}
              </h3>
              <p className="text-sm text-muted-foreground mb-4 leading-relaxed line-clamp-3 flex-1">
                {article.excerpt}
              </p>
              <div className="flex items-center justify-between text-xs text-muted-foreground pt-4 border-t">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {article.date}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {article.readTime}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="mt-10 text-center">
        <Button size="lg">Load More Articles</Button>
      </div>
    </section>
  )
}
