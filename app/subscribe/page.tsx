import { PageShell } from "@/components/page-shell"
import { Button } from "@/components/ui/button"

export default function SubscribePage() {
  return (
    <PageShell
      title="Subscribe"
      description="Unlimited access to premium reporting and live coverage."
    >
      <div className="max-w-2xl space-y-6">
        <div className="border border-border rounded-lg p-6">
          <h3 className="text-xl font-semibold">Digital Access</h3>
          <p className="text-muted-foreground mt-2">
            Full access to NewsStream on web and mobile devices.
          </p>
          <div className="mt-4 flex items-center gap-3">
            <div className="text-2xl font-bold">$6.99</div>
            <div className="text-sm text-muted-foreground">per month</div>
          </div>
          <Button className="mt-4">Start Subscription</Button>
        </div>
      </div>
    </PageShell>
  )
}
