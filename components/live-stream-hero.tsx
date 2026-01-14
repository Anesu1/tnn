"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Radio, Users } from "lucide-react"

export function LiveStreamHero() {
  // Replace this with your actual YouTube Live stream video ID
  const youtubeVideoId = "jfKfPfyJRdk" // Example live stream

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
            <span>12,453 watching</span>
          </div>
        </div>
        <h1 className="text-3xl md:text-5xl font-bold text-balance leading-tight">
          Breaking News Coverage: Live Updates
        </h1>
      </div>

      <div className="aspect-video w-full bg-muted rounded-lg overflow-hidden">
        <iframe
          width="100%"
          height="100%"
          src={`https://www.youtube.com/embed/${youtubeVideoId}?autoplay=0&rel=0`}
          title="Live Stream"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full"
        />
      </div>

      <div className="mt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <p className="text-muted-foreground text-sm mb-1">Started 2 hours ago</p>
          <p className="text-sm leading-relaxed max-w-3xl">
            Join us for comprehensive coverage of today&apos;s most important stories. Our team brings you live updates,
            expert analysis, and on-the-ground reporting as events unfold.
          </p>
        </div>
        <Button size="lg" className="shrink-0">
          Enable Notifications
        </Button>
      </div>
    </section>
  )
}
