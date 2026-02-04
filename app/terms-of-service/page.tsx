import Link from "next/link"
import Footer from "../Footer"
import Header from "../Header"

const terms = [
  {
    title: "Use of Service",
    body:
      "You may access our content for personal, non-commercial use. Republishing or redistributing our journalism without permission is not allowed."
  },
  {
    title: "Subscriptions & Billing",
    body:
      "Paid plans renew automatically unless cancelled. You can manage billing details in your account or by contacting support."
  },
  {
    title: "User Conduct",
    body:
      "Do not attempt to interfere with the site, scrape content at scale, or use our services for unlawful purposes."
  },
  {
    title: "Intellectual Property",
    body:
      "All content, trademarks, and logos belong to The Narrative Network or its licensors. Unauthorized use is prohibited."
  },
  {
    title: "Third-Party Links",
    body:
      "We may link to third-party sites for context. We are not responsible for their content or policies."
  },
  {
    title: "Changes to Terms",
    body:
      "We may update these terms from time to time. We will post the latest version on this page."
  }
]

export default function TermsOfServicePage() {
  return (
    <>
    <Header />
    <main className="min-h-screen bg-background">
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-3xl space-y-4">
          <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">
            Terms of Service
          </span>
          <h1 className="text-4xl md:text-6xl font-serif font-black tracking-tighter">
            Fair use, clear rules.
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            These terms govern your access to The Narrative Network and outline how our services can be used.
          </p>
          <div className="flex flex-wrap items-center gap-3 text-xs font-bold uppercase tracking-widest text-muted-foreground">
            <span className="h-2 w-2 rounded-full bg-accent" />
            <span>Last updated: February 4, 2026</span>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 pb-16">
        <div className="grid gap-6 md:grid-cols-2">
          {terms.map((term) => (
            <div key={term.title} className="border border-border p-6 bg-card">
              <h2 className="text-xl font-serif font-bold mb-3">{term.title}</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">{term.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container mx-auto px-4 pb-20">
        <div className="bg-secondary/20 border border-border p-8 md:p-12">
          <h2 className="text-2xl font-serif font-bold mb-4">Need clarification?</h2>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl">
            If you have questions about subscriptions, licensing, or usage, our team can help.
          </p>
          <div className="mt-6 flex flex-wrap gap-4 text-xs font-bold uppercase tracking-widest">
            <Link href="/contact" className="bg-accent text-white px-4 py-2">Contact Us</Link>
            <Link href="/privacy-policy" className="border border-border px-4 py-2">View Privacy Policy</Link>
          </div>
        </div>
      </section>
    </main>
    <Footer />
    </>
  )
}
