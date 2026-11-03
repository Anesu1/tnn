import { StaticPage, staticPageMetadata } from "@/components/site/static-page"

export const metadata = staticPageMetadata("corrections", "/corrections")

export default function CorrectionsPage() {
  return <StaticPage name="corrections" />
}
