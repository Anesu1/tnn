import Link from "next/link"
import Footer  from "../Footer"
import Header from "../Header"

const sections = [
  {
    title: "Information We Collect",
    body:
      "We collect information you provide directly (such as your email for newsletters), usage data (pages viewed, device type, referrer), and limited analytics to understand how readers engage with our journalism."
  },
  {
    title: "How We Use Information",
    body:
      "We use information to deliver subscriptions, personalize newsletters, improve our coverage, and keep our services secure. We never sell personal data."
  },
  {
    title: "Cookies & Tracking",
    body:
      "We use essential cookies for site functionality and optional analytics cookies to measure performance. You can control cookies in your browser settings."
  },
  {
    title: "Sharing & Disclosure",
    body:
      "We share information with trusted vendors that help operate our services (email delivery, analytics, payment processing) and only under strict confidentiality."
  },
  {
    title: "Your Choices",
    body:
      "You can unsubscribe from newsletters at any time, request access to your data, or ask us to delete your account by contacting support."
  },
  {
    title: "Data Security",
    body:
      "We apply industry-standard safeguards and limit access to authorized staff. No system is perfect, but we work continuously to protect your data."
  }
]

export default function PrivacyPolicyPage() {
  return (
    <>
    <Header />
     <main className="min-h-screen bg-background">
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-3xl space-y-4">
          <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">
            Privacy Policy
          </span>
          <h1 className="text-4xl md:text-6xl font-serif font-black tracking-tighter">
            Your privacy matters.
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            This policy explains how The Narrative Network collects, uses, and protects your information when you read,
            subscribe, or interact with our services.
          </p>
          <div className="flex flex-wrap items-center gap-3 text-xs font-bold uppercase tracking-widest text-muted-foreground">
            <span className="h-2 w-2 rounded-full bg-accent" />
            <span>Last updated: February 4, 2026</span>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 pb-16">
        <div className="grid gap-6 md:grid-cols-2">
          {sections.map((section) => (
            <div key={section.title} className="border border-border p-6 bg-card">
              <h2 className="text-xl font-serif font-bold mb-3">{section.title}</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">{section.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container mx-auto px-4 pb-20">
        <div className="bg-secondary/20 border border-border p-8 md:p-12">
          <h2 className="text-2xl font-serif font-bold mb-4">Questions or requests?</h2>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl">
            Contact us to request access, correction, or deletion of your data. We respond to privacy inquiries promptly.
          </p>
          <div className="mt-6 flex flex-wrap gap-4 text-xs font-bold uppercase tracking-widest">
            <Link href="/contact" className="bg-accent text-white px-4 py-2">Contact Support</Link>
            <Link href="/terms-of-service" className="border border-border px-4 py-2">View Terms</Link>
          </div>
        </div>
      </section>
    </main>
    <Footer />
    </>
   
  )
}
