"use client"

import { useState } from "react"

import { Icon } from "./icons"

// Shows the TNN poster until the reader presses play, then loads YouTube's privacy-enhanced
// player. Nothing is fetched from YouTube before that click.
export function VideoPlayer({ youtubeId, title, label }: { youtubeId: string; title: string; label: string }) {
  const [playing, setPlaying] = useState(false)

  if (playing) {
    return (
      <div className="video-frame">
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&rel=0`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    )
  }
  return (
    <button type="button" className="video-poster video-play" onClick={() => setPlaying(true)} aria-label={`Play video: ${title}`}>
      <span className="play" aria-hidden="true">
        <Icon name="play" />
      </span>
      <span>{label}</span>
      <span className="meta">Plays from YouTube</span>
    </button>
  )
}
