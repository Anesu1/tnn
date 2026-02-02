import { Header } from "@/components/Header"
import { Footer } from "@/components/Footer"
import { LiveStreamHero } from "@/components/live-stream-hero"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Radio, Users } from "lucide-react"
import Image from "next/image"

const upcomingStreams = [
  {
    id: 1,
    title: "Evening News Briefing",
    scheduledTime: "6:00 PM EST",
    category: "News",
    image: "/news-studio.png",
    expectedViewers: "8K+",
  },
  {
    id: 2,
    title: "Tech Talk: AI Innovations",
    scheduledTime: "8:00 PM EST",
    category: "Technology",
    image: "/tech-discussion.jpg",
    expectedViewers: "5K+",
  },
  {
    id: 3,
    title: "Market Watch Live",
    scheduledTime: "Tomorrow 9:00 AM EST",
    category: "Business",
    image: "/stock-market-screens.jpg",
    expectedViewers: "12K+",
  },
]

export default function LivePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <LiveStreamHero />

        <section className="container mx-auto px-4 py-12">
          <h2 className="text-2xl md:text-3xl font-bold mb-8">Upcoming Live Streams</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingStreams.map((stream) => (
              <Card key={stream.id} className="group overflow-hidden cursor-pointer hover:shadow-lg transition-shadow">
                <div className="relative aspect-video overflow-hidden">
                  <Image
                    src={stream.image || "/placeholder.svg"}
                    alt={stream.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <Badge className="absolute top-3 left-3 bg-accent text-accent-foreground">{stream.category}</Badge>
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors leading-tight">
                    {stream.title}
                  </h3>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Radio className="h-4 w-4" />
                      {stream.scheduledTime}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {stream.expectedViewers}
                    </span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
