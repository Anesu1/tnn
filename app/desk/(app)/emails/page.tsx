import { requireDeskUser } from "@/lib/desk/auth"
import { addDays, todayISO, weekStart } from "@/lib/desk/config"
import { renderEmail, type EmailContent } from "@/lib/desk/email"
import { digestEmail, emailEnabled, reportEmail } from "@/lib/desk/notify"

// What each Desk email looks like. The morning summary uses today's real data; the others
// show the layout with an example.
export default async function EmailPreview({ searchParams }: { searchParams: Promise<{ width?: string }> }) {
  await requireDeskUser()
  const phone = (await searchParams).width === "phone"
  const today = todayISO()

  const samples: { name: string; who: string; subject: string; content: EmailContent }[] = [
    { name: "Morning summary", who: "CEO and Managing Editor, 07:00 daily", subject: "Morning summary", content: await digestEmail() },
    {
      name: "Report reminder",
      who: "Managing Editor, two hours before each report is due",
      ...reportEmail({ kind: "daily", period: today, dueAt: `${today}T18:00`, overdue: false, href: `/desk/reports/new/daily?period=${today}` }),
    },
    {
      name: "Report overdue",
      who: "Managing Editor, once, when a report is late",
      ...reportEmail({ kind: "weekly_report", period: weekStart(today), dueAt: `${addDays(weekStart(today), 4)}T16:00`, overdue: true, href: `/desk/reports/new/weekly_report` }),
    },
    {
      name: "Work blocked",
      who: "CEO, as soon as an item is marked blocked",
      subject: "Blocked: (example item)",
      content: {
        label: "Alert · work blocked",
        title: "Example: Mutoko grains follow-up",
        intro: "The Managing Editor has marked this item blocked. Work can’t move until it is resolved.",
        sections: [{ heading: "What is blocking it", text: "Example: waiting for a comment from the ministry." }],
        action: { label: "Open the item", href: "/desk/tracker" },
      },
    },
    {
      name: "Decision needed",
      who: "CEO, when the Managing Editor asks for a decision or support",
      subject: "Decision needed",
      content: {
        label: "Decision needed · daily update",
        title: "Example: Approve the transport budget for the Mutoko trip",
        intro: "From today’s Daily Editorial Update.",
        action: { label: "Answer it on the Desk", href: "/desk/decisions" },
      },
    },
  ]

  return (
    <>
      <div className="page-head">
        <div>
          <span className="label">Emails</span>
          <h1 style={{ marginTop: 6 }}>Email preview</h1>
          <p className="meta">
            Reminder and alert emails are {emailEnabled() ? "on" : "off until the review with the Editor is done"}. This is how they will look.
          </p>
        </div>
        <div className="actions">
          <a href="/desk/emails" className={phone ? "button outline" : "button"}>
            Desktop width
          </a>
          <a href="/desk/emails?width=phone" className={phone ? "button" : "button outline"}>
            Phone width
          </a>
        </div>
      </div>

      {samples.map((sample) => (
        <section key={sample.name}>
          <div className="section-head">
            <h2>{sample.name}</h2>
            <span className="meta">{sample.who}</span>
          </div>
          <p className="meta">Subject: TNN Desk: {sample.subject}</p>
          <iframe
            title={`${sample.name} email`}
            srcDoc={renderEmail(sample.content).html}
            sandbox=""
            style={{ display: "block", width: phone ? 375 : "100%", maxWidth: "100%", height: 760, border: "1px solid var(--line)", background: "#fff", marginTop: 10 }}
          />
        </section>
      ))}
    </>
  )
}
