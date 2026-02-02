import { PageShell } from "@/components/page-shell"

export default function CareersPage() {
  return (
    <PageShell
      title="Careers"
      description="Join the team shaping the future of global journalism."
    >
      <div className="max-w-3xl space-y-4 text-muted-foreground">
        <p>
          We are building a newsroom that reflects the diversity of our audience.
          If you care about storytelling, accuracy, and impact, we would love to
          hear from you.
        </p>
        <p>Open roles will be posted here soon.</p>
      </div>
    </PageShell>
  )
}
