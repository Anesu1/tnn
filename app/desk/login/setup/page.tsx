import { redirect } from "next/navigation"
import QRCode from "qrcode"

import { setupAction } from "@/app/desk/actions"
import { ActionForm, FormFooter, SubmitButton } from "@/components/desk/action-form"
import { PasswordInput } from "@/components/password-input"
import { MIN_PASSWORD_LENGTH, newTotpSecret, setupDetails, totpUri } from "@/lib/desk/auth"

// First sign-in (or after a reset): a new password and an authenticator app
export default async function DeskSetup() {
  const account = await setupDetails()
  if (!account) redirect("/desk/login")

  const secret = newTotpSecret()
  const qr = await QRCode.toString(totpUri(secret, account.email), { type: "svg", margin: 1, errorCorrectionLevel: "M" })

  return (
    <>
      <div className="utility">
        <div className="wrap">
          <span>TNN EDITORIAL DESK</span>
          <span>ACCOUNT SET-UP</span>
        </div>
      </div>
      <main className="wrap">
        <div className="panel">
          <span className="label">Welcome, {account.name.split(" ")[0]}</span>
          <h1 style={{ marginTop: 8 }}>Secure your account</h1>
          <p className="meta">This takes two minutes and is needed once. You’ll need your phone.</p>

          <ActionForm action={setupAction}>
            <input type="hidden" name="secret" value={secret} />
            <label htmlFor="password">
              Choose a new password
              <span className="hint">At least {MIN_PASSWORD_LENGTH} characters. A short sentence is easy to remember.</span>
            </label>
            <PasswordInput id="password" name="password" autoComplete="new-password" minLength={MIN_PASSWORD_LENGTH} required />
            <label htmlFor="confirm">Type it again</label>
            <PasswordInput id="confirm" name="confirm" autoComplete="new-password" minLength={MIN_PASSWORD_LENGTH} required />

            <h2 style={{ marginTop: 28 }}>Connect an authenticator app</h2>
            <ol className="steps">
              <li>Install Google Authenticator or Microsoft Authenticator on your phone.</li>
              <li>In the app, add an account and scan this code.</li>
              <li>Type the 6-digit code the app shows.</li>
            </ol>
            <span className="qr" dangerouslySetInnerHTML={{ __html: qr }} role="img" aria-label="QR code for your authenticator app" />
            <p className="meta">
              Can’t scan? Enter this key in the app instead:
              <code className="secret" style={{ fontSize: 15, wordBreak: "break-all" }}>
                {secret.match(/.{1,4}/g)!.join(" ")}
              </code>
            </p>
            <label htmlFor="code">6-digit code from the app</label>
            <input id="code" name="code" className="code-input" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9 ]{6,7}" maxLength={7} required />
            <FormFooter>
              <SubmitButton pendingLabel="Saving…" style={{ width: "100%" }}>
                Finish and open the Desk
              </SubmitButton>
            </FormFooter>
          </ActionForm>
        </div>
      </main>
    </>
  )
}
