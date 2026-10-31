import Link from "next/link"
import { redirect } from "next/navigation"

import { SignInForm } from "@/components/write/sign-in-form"
import { getCurrentWriter } from "@/lib/writer-auth"

export default async function WriterLoginPage() {
  if (await getCurrentWriter()) redirect("/write")

  return (
    <div className="panel">
      <span className="label">Contributors</span>
      <h1 style={{ fontSize: 32, margin: "10px 0 12px" }}>Sign in</h1>
      <p className="meta" style={{ fontSize: 14 }}>
        Submit stories and see everything you have contributed. Every story is reviewed by the chief editor before it
        is published.
      </p>
      <SignInForm />
      <p className="meta" style={{ fontSize: 14, marginTop: 22 }}>
        Got an invite code? <Link href="/write/join">Set up your account</Link>.
        <br />
        Forgot your password? Ask your editor for a new invite code.
      </p>
    </div>
  )
}
