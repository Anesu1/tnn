import type { Metadata } from "next"

import { subscriberForToken } from "@/lib/newsletter"

export const tokenPageMetadata = (title: string): Metadata => ({ title, robots: { index: false, follow: false } })

type Props = {
  token: string
  done?: string
  kind: "confirm" | "unsubscribe"
  action: (form: FormData) => Promise<void>
}

const maskEmail = (email: string) => email.replace(/^(.)(.*)(@.*)$/, (_, a: string, rest: string, domain: string) => `${a}${"•".repeat(Math.min(rest.length, 6))}${domain}`)

// Shared body for /newsletter/confirm and /newsletter/unsubscribe: the link opens this page and
// a button press does the change
export async function NewsletterTokenPage({ token, done, kind, action }: Props) {
  const subscriber = await subscriberForToken(token).catch(() => null)
  const confirm = kind === "confirm"

  let heading: string
  let body: React.ReactNode
  if (!subscriber || done === "0") {
    heading = "This link doesn’t work"
    body = (
      <p>
        It may be incomplete or out of date. <a href="/newsletter">Sign up again</a> or <a href="/contact">contact TNN</a>.
      </p>
    )
  } else if (confirm && subscriber.confirmed && !subscriber.unsubscribed) {
    heading = "You’re subscribed"
    body = <p>Thanks. The TNN briefing will arrive at {maskEmail(subscriber.email)} on Friday mornings. Every email has a link to unsubscribe.</p>
  } else if (!confirm && subscriber.unsubscribed) {
    heading = "You’re unsubscribed"
    body = (
      <p>
        {maskEmail(subscriber.email)} won’t receive the TNN briefing any more. Changed your mind? <a href="/newsletter">Sign up again</a>.
      </p>
    )
  } else if (confirm && subscriber.unsubscribed) {
    heading = "This address is unsubscribed"
    body = (
      <p>
        To get the briefing again, <a href="/newsletter">sign up again</a>.
      </p>
    )
  } else {
    heading = confirm ? "Confirm your subscription" : "Unsubscribe from the TNN briefing"
    body = (
      <form action={action}>
        <p>
          {confirm
            ? `Press the button to start the weekly TNN briefing at ${maskEmail(subscriber.email)}.`
            : `Press the button to stop the weekly TNN briefing at ${maskEmail(subscriber.email)}.`}
        </p>
        <input type="hidden" name="token" value={token} />
        <button className="button" type="submit">
          {confirm ? "Confirm my subscription" : "Unsubscribe"}
        </button>
      </form>
    )
  }

  return (
    <article className="prose">
      <span className="label">The TNN email briefing</span>
      <h1>{heading}</h1>
      {body}
    </article>
  )
}
