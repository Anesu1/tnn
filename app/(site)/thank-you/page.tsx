import { StaticPage, staticPageMetadata } from "@/components/site/static-page"

export const metadata = staticPageMetadata("thank-you", "/thank-you")

export default function ThankYouPage() {
  return <StaticPage name="thank-you" />
}
