import { StaticPage, staticPageMetadata } from "@/components/site/static-page"

export const metadata = staticPageMetadata("contact", "/contact")

export default function ContactPage() {
  return <StaticPage name="contact" />
}
