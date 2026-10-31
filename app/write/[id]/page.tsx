import Link from "next/link"

import { StoryForm } from "@/components/write/story-form"
import { requireWriter } from "@/lib/writer-auth"
import { client } from "@/sanity/lib/client"
import { getWriteClient } from "@/sanity/lib/writeClient"

type DraftStory = {
  title?: string
  excerpt?: string
  content?: { _type: string; children?: { text?: string }[] }[]
  categories?: string[]
  image?: string
  imageAlt?: string
}

export default async function EditStoryPage({ params }: { params: Promise<{ id: string }> }) {
  const writer = await requireWriter()
  const { id } = await params

  const [draft, categories] = await Promise.all([
    /^[A-Za-z0-9-]+$/.test(id)
      ? getWriteClient().fetch<DraftStory | null>(
          `*[_id == $draftId && submittedBy._ref == $writerId][0]{
            title, excerpt, content, "categories": categories[]._ref,
            "image": mainImage.asset->url, "imageAlt": mainImage.alt
          }`,
          { draftId: `drafts.${id}`, writerId: writer._id },
        )
      : null,
    client.fetch<{ _id: string; title: string }[]>(`*[_type == "category"] | order(title asc){_id, title}`),
  ])

  if (!draft) {
    return (
      <div className="empty">
        <h2>This story can&apos;t be edited</h2>
        <p className="meta" style={{ margin: "10px 0 16px", fontSize: 14 }}>
          It has already been published or withdrawn. Ask the chief editor if it needs changes.
        </p>
        <Link href="/write" className="button outline">
          Back to your stories
        </Link>
      </div>
    )
  }

  const content = (draft.content ?? [])
    .filter((block) => block._type === "block")
    .map((block) => (block.children ?? []).map((child) => child.text ?? "").join(""))
    .join("\n\n")

  return (
    <>
      <span className="label">Awaiting approval</span>
      <h1 style={{ marginTop: 8 }}>Edit your story</h1>
      <p className="intro">You can keep editing until the chief editor publishes it.</p>
      <StoryForm categories={categories} initial={{ id, ...draft, content }} />
    </>
  )
}
