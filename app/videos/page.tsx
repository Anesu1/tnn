import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Play, Clock, Eye } from "lucide-react"
import Image from "next/image"

const videos = [
  {
    id: 1,
    title: "Special Report: The Future of Renewable Energy",
    category: "Documentary",
    thumbnail: "/solar-wind-landscape.png",
    duration: "28:45",
    views: "124K",
    uploadedDate: "2 days ago",
  },
  {
    id: 2,
    title: "Interview: Tech CEO Discusses Innovation Strategies",
    category: "Interview",
    thumbnail: "/business-interview.png",
    duration: "15:32",
    views: "89K",
    uploadedDate: "3 days ago",
  },
  {
    id: 3,
    title: "On the Ground: Climate Change Effects in Arctic",
    category: "Reporting",
    thumbnail: "/arctic-landscape.jpg",
    duration: "22:18",
    views: "156K",
    uploadedDate: "5 days ago",
  },
  {
    id: 4,
    title: "Analysis: Global Economic Trends for 2026",
    category: "Analysis",
    thumbnail: "/economic-charts-graphs.jpg",
    duration: "18:05",
    views: "67K",
    uploadedDate: "1 week ago",
  },
  {
    id: 5,
    title: "Exclusive: Behind the Scenes of Space Exploration",
    category: "Documentary",
    thumbnail: "/space-exploration-rocket.jpg",
    duration: "35:20",
    views: "203K",
    uploadedDate: "1 week ago",
  },
  {
    id: 6,
    title: "Investigative Report: Cybersecurity in Modern World",
    category: "Investigation",
    thumbnail: "/cybersecurity-digital.png",
    duration: "25:47",
    views: "98K",
    uploadedDate: "2 weeks ago",
  },
  {
    id: 7,
    title: "Health Focus: Advances in Medical Technology",
    category: "Health",
    thumbnail: "/medical-technology.png",
    duration: "20:15",
    views: "112K",
    uploadedDate: "2 weeks ago",
  },
  {
    id: 8,
    title: "Culture Watch: Art Movements Shaping Our Time",
    category: "Culture",
    thumbnail: "/modern-art-gallery.jpg",
    duration: "16:38",
    views: "76K",
    uploadedDate: "3 weeks ago",
  },
  {
    id: 9,
    title: "Political Roundtable: Experts Debate Key Issues",
    category: "Politics",
    thumbnail: "/political-debate.png",
    duration: "42:10",
    views: "145K",
    uploadedDate: "3 weeks ago",
  },
]

export default function VideosPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <section className="container mx-auto px-4 py-8 md:py-12">
          <h1 className="text-3xl md:text-5xl font-bold mb-8">Video Library</h1>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.map((video) => (
              <Card key={video.id} className="group overflow-hidden cursor-pointer hover:shadow-lg transition-shadow">
                <div className="relative aspect-video overflow-hidden bg-muted">
                  <Image
                    src={video.thumbnail || "/placeholder.svg"}
                    alt={video.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="h-16 w-16 rounded-full bg-primary flex items-center justify-center">
                      <Play className="h-8 w-8 text-primary-foreground fill-current ml-1" />
                    </div>
                  </div>
                  <Badge className="absolute top-3 left-3 bg-accent text-accent-foreground">{video.category}</Badge>
                  <div className="absolute bottom-3 right-3 bg-black/80 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {video.duration}
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-lg mb-3 group-hover:text-primary transition-colors leading-tight line-clamp-2">
                    {video.title}
                  </h3>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      {video.views} views
                    </span>
                    <span>{video.uploadedDate}</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <div className="mt-10 text-center">
            <Button size="lg">Load More Videos</Button>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
