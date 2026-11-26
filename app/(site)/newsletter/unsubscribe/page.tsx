import { NewsletterTokenPage, tokenPageMetadata } from "@/components/site/newsletter-token-page"
import { unsubscribeAction } from "../actions"

export const metadata = tokenPageMetadata("Unsubscribe")

export default async function UnsubscribePage({ searchParams }: { searchParams: Promise<{ token?: string; done?: string }> }) {
  const { token = "", done } = await searchParams
  return <NewsletterTokenPage kind="unsubscribe" token={token} done={done} action={unsubscribeAction} />
}
