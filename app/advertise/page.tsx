import { PageShell } from "@/components/page-shell"

export default function AdvertisePage() {
  return (
    <PageShell
      title="Advertise"
      description="Partner with NewsStream to reach a global, engaged audience."
    >
      <div className="max-w-3xl space-y-4 text-muted-foreground">
        <p>
          We offer sponsorships, branded content, and display advertising options
          tailored to your goals. Get in touch to learn about opportunities.
        </p>
        <p>Email: advertise@newsstream.com</p>
      </div>
    </PageShell>
  )
}
