"use client"

import { useActionState } from "react"

import { joinAction, type FormState } from "@/app/write/actions"

export function JoinForm() {
  const [state, formAction, pending] = useActionState<FormState, FormData>(joinAction, {})

  return (
    <form action={formAction} className="form">
      <label htmlFor="code">
        Invite code
        <span className="hint">From the email or message your editor sent you.</span>
      </label>
      <input
        id="code"
        name="code"
        className="code"
        placeholder="XXXXX-XXXXX-XXXXX-XXXXX"
        autoComplete="off"
        autoCapitalize="characters"
        spellCheck={false}
        required
      />

      <label htmlFor="email">Email address</label>
      <input id="email" name="email" type="email" autoComplete="email" required />

      <label htmlFor="password">
        Choose a password
        <span className="hint">At least 8 characters.</span>
      </label>
      <input id="password" name="password" type="password" autoComplete="new-password" minLength={8} required />

      <label htmlFor="confirm">Confirm password</label>
      <input id="confirm" name="confirm" type="password" autoComplete="new-password" minLength={8} required />

      {state.error && <p className="error" role="alert">{state.error}</p>}
      <div style={{ marginTop: 20 }}>
        <button className="button" disabled={pending} style={{ width: "100%" }}>
          {pending ? "Setting up…" : "Create my account"}
        </button>
      </div>
    </form>
  )
}
