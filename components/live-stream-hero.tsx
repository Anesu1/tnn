"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Radio } from "lucide-react"
import { client } from "@/sanity/lib/client"

interface LiveStream {
  title: string
  description?: string
  streamUrl?: string
  startTime?: string
}

// Accepts the usual YouTube link shapes (watch?v=, youtu.be/, /live/, /embed/) and returns an embed URL
function toEmbedUrl(url?: string) {
  if (!url) return null
  const match = url.match(/(?:youtube\.com\/(?:watch\?v=|live\/|embed\/)|youtu\.be\/)([\w-]{11})/)
  return match ? `https://www.youtube.com/embed/${match[1]}?autoplay=0&rel=0` : url
}

export function LiveStreamHero() {
  const [liveStream, setLiveStream] = useState<LiveStream | null>(null)

  useEffect(() => {
    const fetchLiveStream = async () => {
      const query = `*[_type == "liveStream" && isLive == true] | order(startTime desc)[0] {
        title,
        description,
        streamUrl,
        startTime
      }`

      const data = await client.fetch(query)
      setLiveStream(data)
    }

    fetchLiveStream()
  }, [])

  const embedUrl = toEmbedUrl(liveStream?.streamUrl)
  if (!liveStream || !embedUrl) {
    return null // Render nothing if no live stream is active
  }

  return (
    <section className="container mx-auto px-4 py-8 md:py-12">
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex items-center gap-3">
          <Badge variant="destructive" className="gap-1.5 animate-pulse">
            <Radio className="h-3 w-3 fill-current" />
            LIVE
          </Badge>
        </div>
        <h1 className="text-3xl md:text-5xl font-bold text-balance leading-tight">
          {liveStream.title}
        </h1>
      </div>

      <div className="aspect-video w-full bg-muted rounded-lg overflow-hidden">
        <iframe
          width="100%"
          height="100%"
          src={embedUrl}
          title={liveStream.title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full"
        />
      </div>

      <div className="mt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          {liveStream.startTime && (
            <p className="text-muted-foreground text-sm mb-1">
              Started{" "}
              {new Date(liveStream.startTime).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })}
            </p>
          )}
          {liveStream.description && (
            <p className="text-sm leading-relaxed max-w-3xl">{liveStream.description}</p>
          )}
        </div>
      </div>
    </section>
  )
}
