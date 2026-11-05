import { SiteFooter, SiteHeader } from "@/components/site/chrome"
import { StaticPage } from "@/components/site/static-page"
import { STATIC_PAGES } from "@/lib/site/static-pages"
import "./(site)/site.css"
import "./(site)/icons.css"
import "./(site)/editorial.css"

export const metadata = {
  title: { absolute: STATIC_PAGES["not-found"].title },
  description: STATIC_PAGES["not-found"].description,
  robots: { index: false },
}

// Unknown addresses outside the public site's layout still get the TNN page chrome
export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main className="wrap" id="content">
        <StaticPage name="not-found" />
      </main>
      <SiteFooter />
    </>
  )
}
