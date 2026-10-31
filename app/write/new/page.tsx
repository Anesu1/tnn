import { StoryForm } from "@/components/write/story-form"
import { requireWriter } from "@/lib/writer-auth"
import { client } from "@/sanity/lib/client"

export default async function NewStoryPage() {
  await requireWriter()
  const categories = await client.fetch<{ _id: string; title: string }[]>(
    `*[_type == "category"] | order(title asc){_id, title}`,
  )

  return (
    <>
      <span className="label">New story</span>
      <h1 style={{ marginTop: 8 }}>Write a story</h1>
      <p className="intro">When you submit, your story goes to the chief editor&apos;s approval queue. They review it before it is published.</p>
      <StoryForm categories={categories} />
    </>
  )
}
