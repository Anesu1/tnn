"use client"

import { useActionState } from "react"

import { signUp, type SignupState } from "@/app/(site)/newsletter/actions"
import { Icon } from "./icons"

export function NewsletterForm() {
  const [state, action, pending] = useActionState<SignupState, FormData>(signUp, { status: "idle", message: "" })

  if (state.status === "sent") {
    return (
      <div className="notice" role="status">
        <strong>Almost there.</strong> {state.message}
      </div>
    )
  }

  return (
    <form action={action} className="form" data-native name="email-briefing">
      <p className="hp">
        <label>
          Leave this field empty
          <input name="bot-field" tabIndex={-1} autoComplete="off" />
        </label>
      </p>
      <label>
        Email address
        <input name="email" type="email" required autoComplete="email" maxLength={254} />
      </label>
      <label className="check">
        <input name="consent" type="checkbox" required value="yes" />
        <span>
          Send me TNN’s weekly email briefing. I understand I can unsubscribe at any time. <a href="/privacy">Privacy notice</a>.
        </span>
      </label>
      <button className="button" type="submit" disabled={pending}>
        <Icon name="mail" />
        {pending ? "Signing up…" : "Sign up"}
      </button>
      <p id="form-status" role="status">
        {state.status === "error" ? state.message : ""}
      </p>
    </form>
  )
}
