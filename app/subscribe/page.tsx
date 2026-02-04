import Link from "next/link"

const plans = [
  {
    name: "Digital",
    price: "$9 / month",
    perks: ["Unlimited articles", "Daily briefing newsletter", "Audio summaries"]
  },
  {
    name: "All Access",
    price: "$19 / month",
    perks: ["Everything in Digital", "Live stream access", "Exclusive investigations"]
  },
  {
    name: "Institutional",
    price: "Custom",
    perks: ["Team access", "Industry reports", "Dedicated account manager"]
  }
]

export default function SubscribePage() {
  return (
    <main className="min-h-screen bg-background">
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-3xl space-y-4">
          <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">
            Subscribe
          </span>
          <h1 className="text-4xl md:text-6xl font-serif font-black tracking-tighter">Invest in Independent Journalism</h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Choose a plan that keeps you informed and supports in-depth reporting across the continent.
          </p>
        </div>
      </section>

      <section className="container mx-auto px-4 pb-16">
        <div className="grid gap-6 md:grid-cols-3">
          {plans.map((plan) => (
            <div key={plan.name} className="border border-border p-6 flex flex-col">
              <h2 className="text-2xl font-serif font-bold mb-2">{plan.name}</h2>
              <p className="text-sm text-muted-foreground mb-4">{plan.price}</p>
              <ul className="text-sm text-muted-foreground space-y-2 mb-6">
                {plan.perks.map((perk) => (
                  <li key={perk}>• {perk}</li>
                ))}
              </ul>
              <button className="mt-auto bg-accent text-white py-2 text-xs font-black uppercase tracking-[0.2em]">
                Choose Plan
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="container mx-auto px-4 pb-20">
        <div className="bg-secondary/20 border border-border p-8 md:p-12">
          <h2 className="text-2xl font-serif font-bold mb-3">Need a team plan?</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            We support universities, NGOs, and enterprises with tailored access and reporting.
          </p>
          <div className="mt-6 flex flex-wrap gap-4 text-xs font-bold uppercase tracking-widest">
            <Link href="/contact" className="bg-primary text-primary-foreground px-4 py-2">Talk to us</Link>
            <Link href="/about" className="border border-border px-4 py-2">Learn more</Link>
          </div>
        </div>
      </section>
    </main>
  )
}
