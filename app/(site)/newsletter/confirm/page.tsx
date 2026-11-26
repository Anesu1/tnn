import { NewsletterTokenPage, tokenPageMetadata } from "@/components/site/newsletter-token-page"
import { confirmAction } from "../actions"

export const metadata = tokenPageMetadata("Confirm your subscription")

export default async function ConfirmPage({ searchParams }: { searchParams: Promise<{ token?: string; done?: string }> }) {
  const { token = "", done } = await searchParams
  return <NewsletterTokenPage kind="confirm" token={token} done={done} action={confirmAction} />
}
