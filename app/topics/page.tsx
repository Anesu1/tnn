import { Header } from "@/components/Header"
import { Footer } from "@/components/Footer"
import Link from "next/link"
import { client } from "@/sanity/lib/client"

export const revalidate = 300

interface TagItem {
  _id: string
  title: string
  slug?: string
}

async function getTags() {
  const query = `*[_type == "tag"] | order(title asc) {
    _id,
    title,
    "slug": slug.current
  }`
  return client.fetch<TagItem[]>(query)
}

export default async function TopicsPage() {
  const tags = await getTags()

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <section className="container mx-auto px-4 pt-10 pb-6">
          <h1 className="text-4xl md:text-5xl font-serif font-bold">Topics</h1>
          <p className="text-muted-foreground mt-2 max-w-2xl">
            Explore coverage by topic, from markets and policy to AI and health.
          </p>
        </section>
        <section className="container mx-auto px-4 pb-16">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {tags.map((tag) => (
              <Link
                key={tag._id}
                href={tag.slug ? `/topics/${tag.slug}` : "/topics"}
                className="border border-border rounded-lg px-4 py-3 hover:border-accent hover:text-accent transition-colors"
              >
                {tag.title}
              </Link>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
