"use server"

import { redirect } from "next/navigation"

import { confirmSubscription, normaliseEmail, subscribe, unsubscribe, validEmail } from "@/lib/newsletter"

export type SignupState = { status: "idle" | "sent" | "error"; message: string }

// The same reply whether the address is new, already subscribed or recently sent a link, so the
// form can't be used to find out who subscribes
const SENT = "Check your inbox: we’ve sent a link to confirm your subscription. It may take a few minutes, and can land in spam."

export async function signUp(_: SignupState, form: FormData): Promise<SignupState> {
  // Bots fill the hidden field; give them the normal reply and do nothing
  if (String(form.get("bot-field") ?? "")) return { status: "sent", message: SENT }
  const email = normaliseEmail(String(form.get("email") ?? ""))
  if (!validEmail(email)) return { status: "error", message: "Please enter a valid email address." }
  if (form.get("consent") !== "yes") return { status: "error", message: "Please tick the box to agree to receive the briefing." }
  try {
    const result = await subscribe(email)
    if (result === "busy") return { status: "error", message: "We’re receiving a lot of sign-ups. Please try again in an hour." }
    if (result === "unavailable") return { status: "error", message: "Sign-up isn’t available right now. Please try again later." }
    return { status: "sent", message: SENT }
  } catch (error) {
    console.error("Newsletter sign-up failed", error)
    return { status: "error", message: "Sign-up isn’t available right now. Please try again later." }
  }
}

// Confirming and unsubscribing happen on a button press, not on opening the link, so email
// scanners that open links can't confirm or unsubscribe anyone
export async function confirmAction(form: FormData) {
  const token = String(form.get("token") ?? "")
  const ok = await confirmSubscription(token)
  redirect(`/newsletter/confirm?token=${encodeURIComponent(token)}&done=${ok ? "1" : "0"}`)
}

export async function unsubscribeAction(form: FormData) {
  const token = String(form.get("token") ?? "")
  const ok = await unsubscribe(token)
  redirect(`/newsletter/unsubscribe?token=${encodeURIComponent(token)}&done=${ok ? "1" : "0"}`)
}
