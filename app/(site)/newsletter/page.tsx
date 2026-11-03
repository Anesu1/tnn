import { StaticPage, staticPageMetadata } from "@/components/site/static-page"

export const metadata = staticPageMetadata("newsletter", "/newsletter")

export default function NewsletterPage() {
  return <StaticPage name="newsletter" />
}
