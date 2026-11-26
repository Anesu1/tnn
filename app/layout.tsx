import type React from "react"
import type { Metadata, Viewport } from "next"

import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site/config"

// Kept minimal on purpose: the public site, the writer portal and the Sanity Studio
// each bring their own styles (app/(site)/site.css, app/write/portal.css, Studio built-ins).
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: `${SITE_NAME} — Zimbabwe, Africa and the world | TNN`,
  description: SITE_DESCRIPTION,
  icons: {
    icon: [{ url: "/favicon.ico", sizes: "any" }, { url: "/favicon.png", type: "image/png" }],
    apple: "/apple-touch-icon.png",
  },
  alternates: {
    types: { "application/rss+xml": [{ url: "/feed.xml", title: "TNN latest news" }] },
  },
  // Lets Google show large image previews, full snippets and video previews. Discover and Top
  // Stories only use large images when max-image-preview:large is set. Bing reads the same
  // settings from the general robots tag. Pages that must stay out of search (desk, write, 404)
  // set their own robots, which replaces this.
  robots: {
    index: true,
    follow: true,
    "max-image-preview": "large",
    "max-snippet": -1,
    "max-video-preview": -1,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 },
  },
}


export const viewport: Viewport = {
  themeColor: "#b51f2a",
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
