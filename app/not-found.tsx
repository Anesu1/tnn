import Link from "next/link"
import { ArrowLeft, Compass, Newspaper } from "lucide-react"

export default function NotFound() {
  return (
    <main className="min-h-screen bg-background">
      <section className="container mx-auto px-4 py-20">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div className="space-y-6">
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">
              404 — Page Not Found
            </span>
            <h1 className="text-4xl md:text-6xl font-serif font-black tracking-tighter">
              This story has moved on.
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-xl">
              The page you&#39;re looking for no longer exists or the link is broken. Let&#39;s get you back to live coverage
              and the latest headlines.
            </p>
            <div className="flex flex-wrap gap-4 text-xs font-bold uppercase tracking-widest">
              <Link href="/" className="bg-accent text-white px-5 py-3 inline-flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Home
              </Link>
              <Link href="/news" className="border border-border px-5 py-3 inline-flex items-center gap-2">
                <Newspaper className="h-4 w-4" />
                Latest Stories
              </Link>
            </div>
          </div>

          <div className="border border-border bg-card p-8 md:p-12">
            <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-muted-foreground">
              <Compass className="h-4 w-4 text-accent" />
              Suggested Destinations
            </div>
            <ul className="mt-6 space-y-4 text-sm">
              <li>
                <Link href="/category/breaking-news" className="hover:text-accent">
                  Breaking News Desk
                </Link>
              </li>
              <li>
                <Link href="/category/politics-governance" className="hover:text-accent">
                  Politics & Governance
                </Link>
              </li>
              <li>
                <Link href="/category/business-economy" className="hover:text-accent">
                  Business & Economy
                </Link>
              </li>
              <li>
                <Link href="/category/creative-cultural-industries" className="hover:text-accent">
                  Creative & Cultural Industries
                </Link>
              </li>
              <li>
                <Link href="/category/sports-entertainment" className="hover:text-accent">
                  Sports & Entertainment
                </Link>
              </li>
            </ul>
            <div className="mt-10 border-t border-border pt-6 text-xs text-muted-foreground">
              Or head to <Link href="/category" className="underline">all sections</Link> to browse every desk.
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
