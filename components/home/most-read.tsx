import Link from "next/link"

interface MostReadItem {
  _id: string
  title: string
  slug?: string
}

interface MostReadProps {
  items: MostReadItem[]
}

export function MostRead({ items }: MostReadProps) {
  if (!items.length) {
    return null
  }

  return (
    <section className="container mx-auto px-4 py-10">
      <div className="flex items-center justify-between border-b-2 border-primary mb-6 pb-2">
        <h2 className="text-2xl font-serif font-bold">Most Read</h2>
      </div>
      <ol className="list-decimal list-inside space-y-4 font-serif font-bold text-lg marker:text-accent marker:font-sans">
        {items.map((item) => (
          <li key={item._id}>
            <Link href={item.slug ? `/news/${item.slug}` : "/news"} className="hover:text-accent">
              {item.title}
            </Link>
          </li>
        ))}
      </ol>
    </section>
  )
}
