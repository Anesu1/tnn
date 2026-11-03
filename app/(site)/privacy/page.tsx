import { StaticPage, staticPageMetadata } from "@/components/site/static-page"

export const metadata = staticPageMetadata("privacy", "/privacy")

export default function PrivacyPage() {
  return <StaticPage name="privacy" />
}
