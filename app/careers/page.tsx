import Link from "next/link"

const roles = [
  {
    title: "Investigations Editor",
    location: "Nairobi · Hybrid",
    summary: "Lead investigative reporting projects and mentor cross-border teams."
  },
  {
    title: "Live Stream Producer",
    location: "Lagos · On-site",
    summary: "Own daily live coverage, run-downs, and on-air coordination."
  },
  {
    title: "Data Journalist",
    location: "Remote",
    summary: "Build data-driven stories, visualizations, and newsroom tools."
  },
  {
    title: "Audience Growth Lead",
    location: "Cape Town · Hybrid",
    summary: "Grow our member community and design retention programs."
  }
]

export default function CareersPage() {
  return (
    <main className="min-h-screen bg-background">
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-3xl space-y-4">
          <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">
            Careers
          </span>
          <h1 className="text-4xl md:text-6xl font-serif font-black tracking-tighter">Join the Newsroom</h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            We&#39;re building a multi-disciplinary newsroom with reporters, designers, technologists, and storytellers
            who believe in redefining Africa&#39;s narrative.
          </p>
        </div>
      </section>

      <section className="container mx-auto px-4 pb-16">
        <div className="grid gap-6 md:grid-cols-2">
          {roles.map((role) => (
            <div key={role.title} className="border border-border p-6">
              <h2 className="text-xl font-serif font-bold mb-2">{role.title}</h2>
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">{role.location}</p>
              <p className="text-sm text-muted-foreground leading-relaxed mb-6">{role.summary}</p>
              <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-widest">
                <Link href="/contact" className="border border-border px-3 py-2">Ask a question</Link>
                <Link href="/contact" className="bg-accent text-white px-3 py-2">Apply</Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="container mx-auto px-4 pb-20">
        <div className="bg-secondary/20 border border-border p-8 md:p-12">
          <h2 className="text-2xl font-serif font-bold mb-3">What We Offer</h2>
          <div className="grid gap-6 md:grid-cols-3 text-sm text-muted-foreground">
            <div>Flexible work arrangements and generous leave.</div>
            <div>International reporting opportunities and training budgets.</div>
            <div>Transparent pay bands and equity participation.</div>
          </div>
        </div>
      </section>
    </main>
  )
}
