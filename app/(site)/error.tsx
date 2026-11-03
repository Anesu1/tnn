"use client"

import { useEffect } from "react"

import { Icon } from "@/components/site/icons"

// Shown inside the site layout when a page fails to load, for example if Sanity is unreachable
export default function SiteError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <article className="prose">
      <span className="label">The Narrative Network</span>
      <h1>This page could not load</h1>
      <p className="intro">Something went wrong on our side. Please try again in a moment.</p>
      <div className="actions">
        <button type="button" onClick={reset}>
          Try again
        </button>
        <a href="/latest">
          Latest news
          <Icon name="arrow-right" />
        </a>
      </div>
    </article>
  )
}
