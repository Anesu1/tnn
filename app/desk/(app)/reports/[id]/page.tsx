import Link from "next/link"
import { notFound } from "next/navigation"

import { reviewReportAction } from "@/app/desk/actions"
import { ActionForm, FormFooter, SubmitButton } from "@/components/desk/action-form"
import { PrintButton } from "@/components/desk/print-button"
import { ReportBody, reportPeriod } from "@/components/desk/report-view"
import { Comments } from "@/components/desk/ui"
import { requireDeskUser } from "@/lib/desk/auth"
import { formatStamp, REPORT_KINDS } from "@/lib/desk/config"
import { commentsFor, getReport, reportVersions } from "@/lib/desk/data"

export default async function ReportPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ submitted?: string }> }) {
  const user = await requireDeskUser()
  const { id } = await params
  const { submitted } = await searchParams
  const report = await getReport(id)
  if (!report) notFound()
  const [versions, comments] = await Promise.all([reportVersions(report.kind, report.period_start), commentsFor("report", report.id)])
  const latest = versions[0]?.id === report.id

  return (
    <>
      <p className="meta no-print">
        <Link href="/desk/reports">Reports</Link> /
      </p>
      <div className="page-head no-print">
        <div>
          <span className="label">{REPORT_KINDS[report.kind]}</span>
          <h1 style={{ marginTop: 6 }}>{reportPeriod(report)}</h1>
          <p className="meta">
            Submitted by {report.submitted_by_name}, {formatStamp(report.submitted_at)}
            {report.version > 1 ? ` · version ${report.version}` : ""}
          </p>
        </div>
        <div className="actions">
          {user.role === "editor" && latest && (
            <Link href={`/desk/reports/new/${report.kind}?period=${report.period_start}`} className="button outline">
              Submit a new version
            </Link>
          )}
          <PrintButton />
        </div>
      </div>

      {submitted && (
        <div className="notice success no-print" role="status">
          Submitted. The CEO can see it now.
        </div>
      )}
      {!latest && (
        <div className="notice no-print" role="status">
          This is an older version. <Link href={`/desk/reports/${versions[0].id}`}>See the latest version</Link>.
        </div>
      )}

      <div className="columns wide-left">
        <article className="report">
          <div className="print-head">
            <strong>The Narrative Network · {REPORT_KINDS[report.kind]}</strong>
            <div>
              {reportPeriod(report)} · submitted by {report.submitted_by_name}, {formatStamp(report.submitted_at)}
              {report.version > 1 ? ` · version ${report.version}` : ""}
            </div>
          </div>
          <ReportBody report={report} />
          {report.review_status !== "submitted" && (
            <div className={report.review_status === "changes_requested" ? "review-box changes" : "review-box"}>
              <strong>{report.review_status === "reviewed" ? "Reviewed" : "Changes requested"}</strong> by {report.reviewed_by_name},{" "}
              {formatStamp(report.reviewed_at!)}
              {report.review_note && <p className="pre">{report.review_note}</p>}
            </div>
          )}
        </article>

        <div className="no-print">
          {user.role === "ceo" && (
            <section>
              <div className="section-head">
                <h2>Your review</h2>
              </div>
              <ActionForm action={reviewReportAction}>
                <input type="hidden" name="id" value={report.id} />
                <label htmlFor="note">
                  Note to the Managing Editor
                  <span className="hint">Optional when marking reviewed; needed when asking for changes.</span>
                </label>
                <textarea id="note" name="note" defaultValue={report.review_note ?? ""} />
                <FormFooter>
                  <SubmitButton name="outcome" value="reviewed" className="button dark">
                    Mark reviewed
                  </SubmitButton>
                  <SubmitButton name="outcome" value="changes_requested" className="button outline">
                    Ask for changes
                  </SubmitButton>
                </FormFooter>
              </ActionForm>
            </section>
          )}

          {versions.length > 1 && (
            <section>
              <div className="section-head">
                <h2>Versions</h2>
              </div>
              <ul className="versions">
                {versions.map((v) => (
                  <li key={v.id}>
                    {v.id === report.id ? (
                      <strong>Version {v.version} (this one)</strong>
                    ) : (
                      <Link href={`/desk/reports/${v.id}`}>Version {v.version}</Link>
                    )}{" "}
                    · {formatStamp(v.submitted_at)}
                  </li>
                ))}
              </ul>
            </section>
          )}

          <Comments entity="report" entityId={report.id} comments={comments} />
        </div>
      </div>
    </>
  )
}
