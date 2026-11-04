import Link from "next/link"

import { DeskNav } from "@/components/desk/desk-nav"
import { signOutAction } from "@/app/desk/actions"
import { requireDeskUser } from "@/lib/desk/auth"
import { formatDay, REPORT_KINDS, ROLE_LABELS, todayISO } from "@/lib/desk/config"
import { decisions, dueReports, type DueReport } from "@/lib/desk/data"
import { db } from "@/lib/desk/db"

export default async function DeskLayout({ children }: { children: React.ReactNode }) {
  const user = await requireDeskUser()
  const [due, open, [{ attention }]] = await Promise.all([
    dueReports(),
    decisions("open"),
    db()<{ attention: number }[]>`
      select count(*)::int as attention from items
      where not archived and status not in ('published', 'dropped') and (blocked or deadline < ${todayISO()}::date)`,
  ])
  const isCeo = user.role === "ceo"

  const links = [
    { href: "/desk", label: "Dashboard", count: isCeo ? undefined : attention },
    { href: "/desk/tracker", label: "Tracker" },
    { href: "/desk/pipeline", label: "Pipeline" },
    { href: "/desk/reports", label: "Reports", count: isCeo ? undefined : due.length },
    { href: "/desk/targets", label: "Targets" },
    { href: "/desk/decisions", label: "Decisions", count: open.length },
    { href: "/desk/history", label: "History" },
    ...(isCeo ? [{ href: "/desk/accounts", label: "Accounts" }] : []),
  ]
  const overdueReports = due.filter((r) => r.overdue)
  // Several missed daily updates show as one line, linking to the most recent
  const missedDaily = due.filter((r) => r.kind === "daily" && r.overdue)
  const banner = [
    ...due.filter((r) => !(r.kind === "daily" && r.overdue)),
    ...missedDaily.slice(-1).map((r) => ({ ...r, count: missedDaily.length })),
  ].sort((a, b) => a.dueAt.localeCompare(b.dueAt)) as (DueReport & { count?: number })[]

  return (
    <>
      <div className="utility no-print">
        <div className="wrap">
          <span>TNN EDITORIAL DESK</span>
          <span>PRIVATE · APPROVED ACCOUNTS ONLY</span>
        </div>
      </div>
      <header className="desk-head no-print">
        <div className="wrap mast">
          <Link href="/desk" className="brand" aria-label="Editorial Desk dashboard">
            <img src="/tnn-logo-black.png" alt="The Narrative Network" className="logo" width={132} height={40} />
            <span>Editorial Desk</span>
          </Link>
          <div className="mast-user">
            <span className="meta">
              {user.name} · {ROLE_LABELS[user.role]}
            </span>
            <form action={signOutAction}>
              <button className="link-button">Sign out</button>
            </form>
          </div>
        </div>
        <div className="wrap">
          <DeskNav links={links} />
        </div>
      </header>

      <main className="wrap" id="content">
        {!isCeo && due.length > 0 && (
          <div className={overdueReports.length ? "banner overdue no-print" : "banner no-print"} role="status">
            <strong>{overdueReports.length ? "Reports overdue:" : "Reports due:"}</strong>
            {banner.map((r) => (
              <Link key={`${r.kind}${r.period}`} href={r.href}>
                {r.count && r.count > 1
                  ? `${r.count} daily updates missed`
                  : `${REPORT_KINDS[r.kind]} · ${r.overdue ? "overdue" : `due ${formatDay(r.dueAt.slice(0, 10))} ${r.dueAt.slice(11)}`}`}
              </Link>
            ))}
          </div>
        )}
        {isCeo && overdueReports.length > 0 && (
          <div className="banner overdue no-print" role="status">
            <strong>Not yet submitted:</strong>
            {banner
              .filter((r) => r.overdue)
              .map((r) => (
                <span key={`${r.kind}${r.period}`}>
                  {r.count && r.count > 1 ? `${r.count} daily updates` : `${REPORT_KINDS[r.kind]} (due ${formatDay(r.dueAt.slice(0, 10))})`}
                </span>
              ))}
          </div>
        )}
        {children}
      </main>
    </>
  )
}
