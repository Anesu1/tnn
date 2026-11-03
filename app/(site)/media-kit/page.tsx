import { StaticPage, staticPageMetadata } from "@/components/site/static-page"

export const metadata = staticPageMetadata("media-kit", "/media-kit")

export default function MediaKitPage() {
  return <StaticPage name="media-kit" />
}
