"use client"

import { useEffect } from "react"

export default function DeskError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <main className="wrap">
      <div className="panel">
        <span className="label">Editorial Desk</span>
        <h1 style={{ marginTop: 8 }}>The Desk couldn’t load</h1>
        <p>
          Nothing has been lost. Try again in a moment. If this keeps happening, the Desk database may be unreachable or
          not set up yet; tell the site admin{error.digest ? ` and quote reference ${error.digest}` : ""}.
        </p>
        <button type="button" className="button" onClick={reset}>
          Try again
        </button>
      </div>
    </main>
  )
}
