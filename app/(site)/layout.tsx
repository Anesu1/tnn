import Script from "next/script"

import { SiteFooter, SiteHeader } from "@/components/site/chrome"
import "./site.css"
import "./icons.css"

// Public TNN site. site.css is the reference design's stylesheet, unchanged.
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main className="wrap" id="content">
        {children}
      </main>
      <SiteFooter />
      <Script src="/assets/site.js" strategy="afterInteractive" />
    </>
  )
}
