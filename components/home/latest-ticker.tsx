import Link from "next/link"

interface HeadlineItem {
  _id: string
  title: string
  slug?: string
}

interface LatestTickerProps {
  items: HeadlineItem[]
}

export function LatestTicker({ items }: LatestTickerProps) {
  if (!items.length) {
    return null
  }
  const looped = [...items, ...items]

  return (
    <div className="border-b border-border bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-2 flex items-center gap-4 text-xs uppercase tracking-widest">
        <span className="bg-accent text-accent-foreground px-2 py-1 font-bold">Latest</span>
        <div className="overflow-hidden flex-1">
          <div className="flex items-center gap-8 ticker-track">
            {looped.map((item, index) => (
              <Link
                key={`${item._id}-${index}`}
                href={item.slug ? `/news/${item.slug}` : "/news"}
                className="whitespace-nowrap hover:text-accent-foreground/80 transition-colors"
              >
                {item.title}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
