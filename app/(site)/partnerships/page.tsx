import { StaticPage, staticPageMetadata } from "@/components/site/static-page"

export const metadata = staticPageMetadata("partnerships", "/partnerships")

export default function PartnershipsPage() {
  return <StaticPage name="partnerships" />
}
