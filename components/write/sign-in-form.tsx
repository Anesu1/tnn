"use client"

import { useActionState } from "react"

import { signInAction, type FormState } from "@/app/write/actions"

export function SignInForm() {
  const [state, formAction, pending] = useActionState<FormState, FormData>(signInAction, {})

  return (
    <form action={formAction} className="form">
      <label htmlFor="email">Email address</label>
      <input id="email" name="email" type="email" autoComplete="email" required />

      <label htmlFor="password">Password</label>
      <input id="password" name="password" type="password" autoComplete="current-password" required />

      {state.error && <p className="error" role="alert">{state.error}</p>}
      <div style={{ marginTop: 20 }}>
        <button className="button" disabled={pending} style={{ width: "100%" }}>
          {pending ? "Signing in…" : "Sign in"}
        </button>
      </div>
    </form>
  )
}
