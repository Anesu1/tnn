"use client"

import { useState } from "react"

// A password box with a Show/Hide button. Shared by the Desk and the writer portal; each
// styles .password-field in its own stylesheet.
export function PasswordInput(props: Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> & { id: string }) {
  const [visible, setVisible] = useState(false)

  return (
    <span className="password-field">
      <input {...props} type={visible ? "text" : "password"} autoCapitalize="off" spellCheck={false} />
      <button
        type="button"
        className="password-toggle"
        aria-controls={props.id}
        aria-pressed={visible}
        aria-label={visible ? "Hide password" : "Show password"}
        onClick={() => setVisible((v) => !v)}
      >
        {visible ? "Hide" : "Show"}
      </button>
    </span>
  )
}
