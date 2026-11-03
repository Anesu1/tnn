import { StaticPage, staticPageMetadata } from "@/components/site/static-page"

export const metadata = staticPageMetadata("about", "/about")

export default function AboutPage() {
  return <StaticPage name="about" />
}
