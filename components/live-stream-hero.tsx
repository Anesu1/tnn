"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Radio, Users } from "lucide-react"
import { client } from "@/sanity/lib/client"

interface LiveStream {
  title: string
  description: string
  videoId: string
  viewers: number
  startedAt: string
}

export function LiveStreamHero() {
  const [liveStream, setLiveStream] = useState<LiveStream | null>(null)

  useEffect(() => {
    const fetchLiveStream = async () => {
      const query = `*[_type == "liveStream" && isActive == true][0] {
        title,
        description,
        videoId,
        viewers,
        startedAt
      }`

      const data = await client.fetch(query)
      setLiveStream(data)
    }

    fetchLiveStream()
  }, [])

  // if (!liveStream) {
  //   return null // Render nothing if no live stream is active
  // }

  return (
    <section className="container mx-auto px-4 py-8 md:py-12">
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex items-center gap-3">
          <Badge variant="destructive" className="gap-1.5 animate-pulse">
            <Radio className="h-3 w-3 fill-current" />
            LIVE
          </Badge>
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>{liveStream.viewers} watching</span>
          </div>
        </div>
        <h1 className="text-3xl md:text-5xl font-bold text-balance leading-tight">
          {liveStream.title}
        </h1>
      </div>

      <div className="aspect-video w-full bg-muted rounded-lg overflow-hidden">
        <iframe
          width="100%"
          height="100%"
          src={`https://www.youtube.com/embed/${liveStream.videoId}?autoplay=0&rel=0`}
          title="Live Stream"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full"
        />
      </div>

      <div className="mt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <p className="text-muted-foreground text-sm mb-1">Started {liveStream.startedAt}</p>
          <p className="text-sm leading-relaxed max-w-3xl">
            {liveStream.description}
          </p>
        </div>
        <Button size="lg" className="shrink-0">
          Enable Notifications
        </Button>
      </div>
    </section>
  )
}
