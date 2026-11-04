import { addAccountAction, resendInviteAction, resetAccountAction, signOutEverywhereAction, toggleAccountAction } from "@/app/desk/actions"
import { ActionForm, FormFooter, SubmitButton } from "@/components/desk/action-form"
import { requireDeskUser } from "@/lib/desk/auth"
import { formatStamp, ROLE_LABELS, type Role } from "@/lib/desk/config"
import { db } from "@/lib/desk/db"
import { canSendEmail, emailEnabled } from "@/lib/desk/notify"

type Account = { id: string; name: string; email: string; role: Role; disabled: boolean; totp_enabled: boolean; must_change_password: boolean; last_sign_in: Date | null }

export default async function Accounts() {
  const user = await requireDeskUser("ceo")
  const accounts = await db()<Account[]>`
    select u.id, u.name, u.email, u.role, u.disabled, u.totp_enabled, u.must_change_password,
      (select max(at) from audit_log a where a.user_id = u.id and a.action = 'signed_in') as last_sign_in
    from users u order by u.role, u.name`

  return (
    <>
      <div className="page-head">
        <div>
          <span className="label">CEO only</span>
          <h1 style={{ marginTop: 6 }}>Accounts</h1>
          <p className="meta">Only these people can open the Desk. Each needs a password and an authenticator app.
            New accounts get an email invitation to set these up.</p>
        </div>
      </div>

      <div className="columns wide-left">
        <section>
          <div className="table-wrap">
            <table className="stack">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Role</th>
                  <th>State</th>
                  <th>Last sign-in</th>
                  <th>
                    <span className="visually-hidden">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {accounts.map((a) => (
                  <tr key={a.id}>
                    <td>
                      <strong>{a.name}</strong>
                      <div className="meta">{a.email}</div>
                    </td>
                    <td data-label="Role">{ROLE_LABELS[a.role]}</td>
                    <td data-label="State">
                      {a.disabled ? "Switched off" : a.must_change_password || !a.totp_enabled ? "Waiting for first sign-in" : "Active"}
                    </td>
                    <td data-label="Last sign-in">{a.last_sign_in ? formatStamp(a.last_sign_in) : "Never"}</td>
                    <td>
                      {a.id === user.id ? (
                        <span className="meta">You</span>
                      ) : (
                        <>
                          {a.must_change_password && !a.disabled && canSendEmail() && (
                            <ActionForm action={resendInviteAction} className="form">
                              <input type="hidden" name="id" value={a.id} />
                              <FormFooter>
                                <SubmitButton className="button small dark" pendingLabel="Sending…">
                                  Send a new invitation
                                </SubmitButton>
                              </FormFooter>
                            </ActionForm>
                          )}
                          <ActionForm action={resetAccountAction} className="form">
                            <input type="hidden" name="id" value={a.id} />
                            <FormFooter>
                              <SubmitButton className="button small outline" pendingLabel="Resetting…">
                                Reset password and app
                              </SubmitButton>
                            </FormFooter>
                          </ActionForm>
                          <form action={toggleAccountAction}>
                            <input type="hidden" name="id" value={a.id} />
                            <button className="link-button danger">{a.disabled ? "Switch on" : "Switch off"}</button>
                          </form>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <form action={signOutEverywhereAction} style={{ marginTop: 16 }}>
            <button className="link-button">Sign me out on every device</button>
          </form>
          <p className="meta" style={{ marginTop: 16 }}>
            Reminder emails are {emailEnabled() ? "on" : "off (they’re switched on once the Editor has reviewed the Desk)"}. In-app reminders always show. <a href="/desk/emails">Preview the emails</a>.
          </p>
        </section>

        <section>
          <div className="section-head">
            <h2>Add an account</h2>
          </div>
          <ActionForm action={addAccountAction} resetOnSuccess>
            <label htmlFor="name">Name</label>
            <input id="name" name="name" required maxLength={120} />
            <label htmlFor="email">Email</label>
            <input id="email" name="email" type="email" required maxLength={200} />
            <label htmlFor="role">Role</label>
            <select id="role" name="role" defaultValue="editor">
              {Object.entries(ROLE_LABELS).map(([value, name]) => (
                <option key={value} value={value}>
                  {name}
                </option>
              ))}
            </select>
            <FormFooter>
              <SubmitButton>Create account</SubmitButton>
            </FormFooter>
          </ActionForm>
        </section>
      </div>
    </>
  )
}
