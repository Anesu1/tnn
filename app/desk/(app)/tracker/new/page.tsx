import Link from "next/link"

import { ItemForm } from "@/components/desk/item-form"
import { requireDeskUser } from "@/lib/desk/auth"
import { people } from "@/lib/desk/data"
import { recentWebStories } from "@/lib/desk/sanity"

export default async function NewItem() {
  await requireDeskUser("editor")
  const [names, stories] = await Promise.all([people(), recentWebStories().catch(() => [])])

  return (
    <>
      <p className="meta">
        <Link href="/desk/tracker">Tracker</Link> /
      </p>
      <h1 style={{ marginTop: 6 }}>Add an item</h1>
      <p className="intro">Only the title and type are needed now. Fill in the rest as the work takes shape.</p>
      <ItemForm people={names} stories={stories} />
    </>
  )
}
