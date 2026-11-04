import Link from "next/link"

import { HistoryList } from "@/components/desk/ui"
import { requireDeskUser } from "@/lib/desk/auth"
import { history } from "@/lib/desk/data"

const PAGE = 100

export default async function History({ searchParams }: { searchParams: Promise<{ before?: string }> }) {
  await requireDeskUser()
  const { before } = await searchParams
  const rows = await history({ limit: PAGE, before })

  return (
    <>
      <div className="page-head">
        <div>
          <span className="label">Audit log</span>
          <h1 style={{ marginTop: 6 }}>History</h1>
          <p className="meta">Every status change, submitted report, decision and sign-in. Entries can’t be edited or deleted.</p>
        </div>
      </div>
      <HistoryList rows={rows} />
      {rows.length === PAGE && (
        <p style={{ marginTop: 16 }}>
          <Link href={`/desk/history?before=${rows[rows.length - 1].id}`} className="button outline">
            Older entries
          </Link>
        </p>
      )}
    </>
  )
}
