import { NewsletterForm } from "@/components/site/newsletter-form"
import { WHATSAPP_URL } from "@/lib/site/config"
import { pageMetadata } from "@/lib/site/metadata"

export const metadata = pageMetadata({
  title: "The TNN email briefing",
  description: "Sign up for The Narrative Network’s free weekly email briefing: the stories shaping Zimbabwe and Africa, every Friday morning.",
  path: "/newsletter",
})

export default function NewsletterPage() {
  return (
    <article className="prose">
      <span className="label">The Narrative Network</span>
      <h1>The TNN email briefing</h1>
      <p className="intro">The stories shaping Zimbabwe and Africa, in your inbox every Friday morning.</p>
      <p>
        One email a week with the week’s reporting and new Watch TNN episodes. Free, and you can unsubscribe in one click. For updates
        during the week,{" "}
        <a data-event="follow_whatsapp" href={WHATSAPP_URL} target="_blank" rel="noopener">
          follow TNN on WhatsApp
        </a>
        .
      </p>
      <NewsletterForm />
      <p className="meta">We’ll email you a link to confirm first. We use your address only to send the briefing, and never sell it.</p>
    </article>
  )
}
