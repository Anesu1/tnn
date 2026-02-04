import Link from "next/link"

const packages = [
  {
    title: "Sponsored Briefings",
    detail: "Own the morning briefing slot with brand-safe placements."
  },
  {
    title: "Live Stream Sponsorship",
    detail: "Present live coverage and high-impact studio content."
  },
  {
    title: "Native Storytelling",
    detail: "Collaborate with our studio for premium long-form narratives."
  }
]

export default function AdvertisePage() {
  return (
    <main className="min-h-screen bg-background">
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-3xl space-y-4">
          <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">
            Advertise
          </span>
          <h1 className="text-4xl md:text-6xl font-serif font-black tracking-tighter">Partner With Us</h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Reach an engaged audience of decision-makers across Africa and the global diaspora through premium editorial
            environments and live coverage.
          </p>
        </div>
      </section>

      <section className="container mx-auto px-4 pb-16">
        <div className="grid gap-6 md:grid-cols-3">
          <div className="border border-border p-6">
            <h2 className="text-2xl font-serif font-bold mb-2">2.1M</h2>
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Monthly Readers</p>
          </div>
          <div className="border border-border p-6">
            <h2 className="text-2xl font-serif font-bold mb-2">56%</h2>
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Executive Audience</p>
          </div>
          <div className="border border-border p-6">
            <h2 className="text-2xl font-serif font-bold mb-2">18</h2>
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Live Events / Year</p>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 pb-16">
        <div className="grid gap-6 md:grid-cols-3">
          {packages.map((item) => (
            <div key={item.title} className="border border-border p-6">
              <h3 className="text-xl font-serif font-bold mb-2">{item.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{item.detail}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container mx-auto px-4 pb-20">
        <div className="bg-secondary/20 border border-border p-8 md:p-12 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <h2 className="text-2xl font-serif font-bold mb-2">Download the Media Kit</h2>
            <p className="text-sm text-muted-foreground">
              Audience breakdowns, campaign specs, and editorial calendar highlights.
            </p>
          </div>
          <Link href="/contact" className="bg-accent text-white px-4 py-2 text-xs font-black uppercase tracking-[0.2em]">
            Request Kit
          </Link>
        </div>
      </section>
    </main>
  )
}
