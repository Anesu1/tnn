import Link from "next/link"

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-background">
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-3xl space-y-4">
          <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">
            About
          </span>
          <h1 className="text-4xl md:text-6xl font-serif font-black tracking-tighter">
            The Narrative Network
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            We are an independent newsroom focused on deep reporting, sharp analysis, and live coverage across Africa
            and the global diaspora. Our work blends investigative journalism with modern storytelling formats to make
            complex stories clear, human, and actionable.
          </p>
          <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-muted-foreground">
            <span className="h-2 w-2 rounded-full bg-accent" />
            <span>Founded 2020</span>
            <span className="h-1 w-1 rounded-full bg-muted-foreground/60" />
            <span>24 Countries Covered</span>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 pb-16">
        <div className="grid gap-8 md:grid-cols-3">
          <div className="border border-border p-6">
            <h2 className="text-xl font-serif font-bold mb-3">Our Mission</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Deliver rigorous, context-rich reporting that elevates African perspectives and connects audiences with
              stories that shape policy, culture, and markets.
            </p>
          </div>
          <div className="border border-border p-6">
            <h2 className="text-xl font-serif font-bold mb-3">Editorial Standards</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We verify every claim, label opinion clearly, and correct errors quickly. Our newsroom is guided by
              transparency, fairness, and accountability.
            </p>
          </div>
          <div className="border border-border p-6">
            <h2 className="text-xl font-serif font-bold mb-3">Why We Exist</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              The continent deserves reporting that moves beyond headlines. We invest in long-form coverage, data
              visuals, and live explainers to deepen understanding.
            </p>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 pb-20">
        <div className="bg-secondary/20 border border-border p-8 md:p-12">
          <h2 className="text-2xl md:text-3xl font-serif font-bold mb-4">Stay Connected</h2>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl">
            Join our community for morning briefings, live updates, and exclusive investigations. We publish with
            urgency, but never without context.
          </p>
          <div className="mt-6 flex flex-wrap gap-4 text-xs font-bold uppercase tracking-widest">
            <Link href="/subscribe" className="bg-accent text-white px-4 py-2">Subscribe</Link>
            <Link href="/contact" className="border border-border px-4 py-2">Contact Us</Link>
          </div>
        </div>
      </section>
    </main>
  )
}
