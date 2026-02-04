import Link from "next/link"
import Footer from "../Footer"
import Header from "../Header"

export default function ContactPage() {
  return (
    <>
    <Header />
    <main className="min-h-screen bg-background">
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-3xl space-y-4">
          <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">
            Contact
          </span>
          <h1 className="text-4xl md:text-6xl font-serif font-black tracking-tighter">Let&#39;s Talk</h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Have a story tip, partnership idea, or support request? Reach the right desk below and we&#39;ll respond quickly.
          </p>
        </div>
      </section>

      <section className="container mx-auto px-4 pb-16">
        <div className="grid gap-8 md:grid-cols-2">
          <div className="space-y-6">
            <div className="border border-border p-6">
              <h2 className="text-xl font-serif font-bold mb-2">Newsroom</h2>
              <p className="text-sm text-muted-foreground">tips@thenarrativenetwork.com</p>
              <p className="text-xs text-muted-foreground mt-2">Encrypted tips available upon request.</p>
            </div>
            <div className="border border-border p-6">
              <h2 className="text-xl font-serif font-bold mb-2">Partnerships</h2>
              <p className="text-sm text-muted-foreground">partners@thenarrativenetwork.com</p>
              <p className="text-xs text-muted-foreground mt-2">Events, content collaborations, and syndication.</p>
            </div>
            <div className="border border-border p-6">
              <h2 className="text-xl font-serif font-bold mb-2">Support</h2>
              <p className="text-sm text-muted-foreground">support@thenarrativenetwork.com</p>
              <p className="text-xs text-muted-foreground mt-2">Account help, subscriptions, and billing.</p>
            </div>
          </div>

          <div className="border border-border p-6">
            <h2 className="text-2xl font-serif font-bold mb-4">Send a Message</h2>
            <form className="space-y-4">
              <input
                className="w-full border border-border bg-background/60 px-3 py-2 text-sm"
                placeholder="Full name"
              />
              <input
                className="w-full border border-border bg-background/60 px-3 py-2 text-sm"
                placeholder="Email address"
                type="email"
              />
              <select className="w-full border border-border bg-background/60 px-3 py-2 text-sm">
                <option>General inquiry</option>
                <option>Newsroom tip</option>
                <option>Partnership</option>
                <option>Support</option>
              </select>
              <textarea
                className="w-full border border-border bg-background/60 px-3 py-2 text-sm"
                rows={6}
                placeholder="Tell us more"
              />
              <button className="bg-primary text-primary-foreground px-4 py-2 text-xs font-black uppercase tracking-[0.2em]">
                Send Message
              </button>
            </form>
            <p className="text-[11px] text-muted-foreground mt-4">
              By sending this form you agree to our <Link href="#" className="underline">privacy policy</Link>.
            </p>
          </div>
        </div>
      </section>
    </main>
    <Footer />
    </>
  )
}
