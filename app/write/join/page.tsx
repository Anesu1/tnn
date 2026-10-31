import Link from "next/link"
import { redirect } from "next/navigation"

import { JoinForm } from "@/components/write/join-form"
import { getCurrentWriter } from "@/lib/writer-auth"

export default async function WriterJoinPage() {
  if (await getCurrentWriter()) redirect("/write")

  return (
    <div className="panel">
      <span className="label">Contributors</span>
      <h1 style={{ fontSize: 32, margin: "10px 0 12px" }}>Set up your account</h1>
      <p className="meta" style={{ fontSize: 14 }}>
        Use the invite code from your editor to choose the email and password you&apos;ll sign in with. If your editor
        sent you a new code, this also resets your password.
      </p>
      <JoinForm />
      <p className="meta" style={{ fontSize: 14, marginTop: 22 }}>
        Already set up? <Link href="/write/login">Sign in</Link>.
      </p>
    </div>
  )
}
