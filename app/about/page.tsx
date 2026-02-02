import { PageShell } from "@/components/page-shell"

export default function AboutPage() {
  return (
    <PageShell
      title="About NewsStream"
      description="Independent reporting, global coverage, and trusted analysis."
    >
      <div className="max-w-3xl space-y-4 text-muted-foreground">
        <p>
          NewsStream is built for readers who want depth, clarity, and context.
          Our newsroom covers global events, business, science, and culture with
          a focus on accuracy and transparency.
        </p>
        <p>
          We combine breaking headlines with investigative reporting, expert
          analysis, and live coverage to keep you informed every day.
        </p>
      </div>
    </PageShell>
  )
}
