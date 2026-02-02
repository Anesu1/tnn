import { PageShell } from "@/components/page-shell"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"

const videos = [
  {
    id: 1,
    title: "Inside the Global Markets Rally",
    category: "Business",
    image: "/news-studio.png",
  },
  {
    id: 2,
    title: "AI Race: How the Tech Giants Compete",
    category: "Tech",
    image: "/tech-discussion.jpg",
  },
  {
    id: 3,
    title: "Health Watch: New Vaccines on the Horizon",
    category: "Health",
    image: "/stock-market-screens.jpg",
  },
]

export default function VideoPage() {
  return (
    <PageShell
      title="Video"
      description="Watch interviews, explainers, and on-the-ground coverage."
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {videos.map((video) => (
          <Card key={video.id} className="group overflow-hidden cursor-pointer hover:shadow-lg transition-shadow">
            <div className="relative aspect-video overflow-hidden">
              <Image
                src={video.image || "/placeholder.svg"}
                alt={video.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <Badge className="absolute top-3 left-3 bg-accent text-accent-foreground">{video.category}</Badge>
            </div>
            <div className="p-5">
              <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors leading-tight">
                {video.title}
              </h3>
            </div>
          </Card>
        ))}
      </div>
    </PageShell>
  )
}
