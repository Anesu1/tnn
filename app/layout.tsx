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
