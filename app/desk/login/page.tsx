import { redirect } from "next/navigation"

import { codeAction, loginAction } from "@/app/desk/actions"
import { ActionForm, FormFooter, SubmitButton } from "@/components/desk/action-form"
import { PasswordInput } from "@/components/password-input"
import { getDeskUser } from "@/lib/desk/auth"

export default async function DeskLogin({ searchParams }: { searchParams: Promise<{ step?: string }> }) {
  if (await getDeskUser()) redirect("/desk")
  const { step } = await searchParams

  return (
    <>
      <div className="utility">
        <div className="wrap">
          <span>TNN EDITORIAL DESK</span>
          <span>PRIVATE · APPROVED ACCOUNTS ONLY</span>
        </div>
      </div>
      <main className="wrap">
        <div className="panel">
          <img src="/tnn-logo-black.png" alt="The Narrative Network" className="logo" width={132} height={40} />
          <h1 style={{ marginTop: 20 }}>Editorial Desk</h1>
          {step === "code" ? (
            <>
              <p className="meta">Enter the 6-digit code shown in your authenticator app for “TNN Editorial Desk”.</p>
              <ActionForm action={codeAction}>
                <label htmlFor="code">Authenticator code</label>
                <input
                  id="code"
                  name="code"
                  className="code-input"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  pattern="[0-9 ]{6,7}"
                  maxLength={7}
                  required
                  autoFocus
                />
                <FormFooter>
                  <SubmitButton pendingLabel="Checking…" style={{ width: "100%" }}>
                    Continue
                  </SubmitButton>
                </FormFooter>
              </ActionForm>
              <p className="meta" style={{ marginTop: 16 }}>
                <a href="/desk/login">Start again</a> · Lost your phone? Ask the CEO to reset your account.
              </p>
            </>
          ) : (
            <>
              <p className="meta">For the CEO and Managing Editor only. Every sign-in is recorded.</p>
              <ActionForm action={loginAction}>
                <label htmlFor="email">Email address</label>
                <input id="email" name="email" type="email" autoComplete="username" required />
                <label htmlFor="password">Password</label>
                <PasswordInput id="password" name="password" autoComplete="current-password" required />
                <FormFooter>
                  <SubmitButton pendingLabel="Signing in…" style={{ width: "100%" }}>
                    Sign in
                  </SubmitButton>
                </FormFooter>
              </ActionForm>
            </>
          )}
        </div>
      </main>
    </>
  )
}
