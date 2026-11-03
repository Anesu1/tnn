import { pageMetadata } from "@/lib/site/metadata"
import { STATIC_PAGES } from "@/lib/site/static-pages"
import { iconHtml, type IconName } from "./icons"

// Content pages (About, Editorial standards, Contact…) copied from the reference design.
// The HTML is our own fixed content, not user input.

export function staticPageMetadata(name: string, path: string) {
  const page = STATIC_PAGES[name]
  return pageMetadata({ title: page.title.replace(/ \| TNN$/, ""), description: page.description, path })
}

const withIcons = (html: string) => html.replace(/\{\{icon:([a-z-]+)\}\}/g, (_, name: IconName) => iconHtml(name))

export function StaticPage({ name }: { name: string }) {
  return <div style={{ display: "contents" }} dangerouslySetInnerHTML={{ __html: withIcons(STATIC_PAGES[name].html) }} />
}
