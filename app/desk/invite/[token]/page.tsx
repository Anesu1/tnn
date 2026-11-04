import { acceptInviteAction } from "@/app/desk/actions"
import { ActionForm, FormFooter, SubmitButton } from "@/components/desk/action-form"
import { inviteDetails } from "@/lib/desk/auth"
import { ROLE_LABELS } from "@/lib/desk/config"

// Opening the link only shows this page; the invitation is used when the person clicks
// Continue. Email apps open links to scan them, which mustn't use up the invitation.
export default async function Invite({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const invite = await inviteDetails(token)

  return (
    <>
      <div className="utility">
        <div className="wrap">
          <span>TNN EDITORIAL DESK</span>
          <span>INVITATION</span>
        </div>
      </div>
      <main className="wrap">
        <div className="panel">
          <img src="/tnn-logo-black.png" alt="The Narrative Network" className="logo" width={132} height={40} />
          {invite ? (
            <>
              <span className="label" style={{ display: "block", marginTop: 20 }}>
                {ROLE_LABELS[invite.role]}
              </span>
              <h1 style={{ marginTop: 8 }}>Welcome, {invite.name.split(" ")[0]}</h1>
              <p className="meta">
                Set up your Editorial Desk account for {invite.email}. You’ll choose a password and connect an authenticator app on
                your phone. It takes about two minutes.
              </p>
              <ActionForm action={acceptInviteAction}>
                <input type="hidden" name="token" value={token} />
                <FormFooter>
                  <SubmitButton pendingLabel="Opening…" style={{ width: "100%" }}>
                    Continue
                  </SubmitButton>
                </FormFooter>
              </ActionForm>
            </>
          ) : (
            <>
              <h1 style={{ marginTop: 20 }}>This invitation has expired</h1>
              <p className="meta">
                Invitation links work once and only for a few days. Ask the CEO to send you a new one from the Accounts page. If
                you’ve already set up your account, <a href="/desk/login">sign in here</a>.
              </p>
            </>
          )}
        </div>
      </main>
    </>
  )
}
