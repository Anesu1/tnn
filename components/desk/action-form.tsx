"use client"

import { createContext, useContext, useState, useTransition } from "react"

import type { FormState } from "@/app/desk/actions"

type Action = (prev: FormState, formData: FormData) => Promise<FormState>

const FormContext = createContext<{ state: FormState; pending: boolean }>({ state: {}, pending: false })

// Calls the server action without React's automatic form reset, so a long report keeps
// everything typed into it when the server sends back a validation message.
export function ActionForm({
  action,
  children,
  className = "form",
  resetOnSuccess = false,
  ...props
}: { action: Action; children: React.ReactNode; className?: string; resetOnSuccess?: boolean } & Omit<
  React.FormHTMLAttributes<HTMLFormElement>,
  "action" | "onSubmit"
>) {
  const [state, setState] = useState<FormState>({})
  const [pending, startTransition] = useTransition()

  return (
    <FormContext.Provider value={{ state, pending }}>
      <form
        {...props}
        className={className}
        onSubmit={(event) => {
          event.preventDefault()
          const form = event.currentTarget
          const submitter = (event.nativeEvent as SubmitEvent).submitter as HTMLElement | null
          const data = new FormData(form, submitter)
          startTransition(async () => {
            const result = await action({}, data)
            setState(result ?? {})
            if (result && !result.error && resetOnSuccess) form.reset()
          })
        }}
      >
        {children}
      </form>
    </FormContext.Provider>
  )
}

export function FormMessage() {
  const { state } = useContext(FormContext)
  if (state.error) {
    return (
      <p className="error" role="alert">
        {state.error}
      </p>
    )
  }
  if (state.message) {
    return (
      <div className="notice success" role="status">
        {state.message}
        {state.secret && <code className="secret">{state.secret}</code>}
      </div>
    )
  }
  return null
}

export function SubmitButton({
  children,
  pendingLabel = "Saving…",
  className = "button",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { pendingLabel?: string }) {
  const { pending } = useContext(FormContext)
  return (
    <button {...props} className={className} disabled={pending || props.disabled} aria-disabled={pending}>
      {pending ? pendingLabel : children}
    </button>
  )
}

// The message and buttons, kept in view at the bottom of long forms on phones
export function FormFooter({ children, sticky = false }: { children: React.ReactNode; sticky?: boolean }) {
  return (
    <div className={sticky ? "form-footer sticky" : "form-footer"}>
      <FormMessage />
      <div className="form-buttons">{children}</div>
    </div>
  )
}
