import { PageShell } from "@/components/page-shell"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function NewsletterPage() {
  return (
    <PageShell
      title="Newsletter"
      description="Get the latest headlines, analysis, and exclusive insights delivered daily."
    >
      <div className="max-w-xl space-y-6">
        <p className="text-muted-foreground">
          Join thousands of readers who start their day with NewsStream.
        </p>
        <form className="flex gap-3">
          <Input placeholder="Email address" type="email" />
          <Button type="submit">Subscribe</Button>
        </form>
      </div>
    </PageShell>
  )
}
