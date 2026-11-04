import type { Metadata } from "next"

import "./desk.css"

export const metadata: Metadata = {
  title: { absolute: "Editorial Desk | TNN" },
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
}

// Private workspace for the CEO and Managing Editor. Every page and action checks the
// signed-in account on the server; see lib/desk/auth.ts.
export const dynamic = "force-dynamic"

export default function DeskRootLayout({ children }: { children: React.ReactNode }) {
  return <div className="tnn-desk">{children}</div>
}
