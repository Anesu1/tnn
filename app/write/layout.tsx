import type { Metadata } from "next"
import Link from "next/link"

import { getCurrentWriter } from "@/lib/writer-auth"
import { signOutAction } from "./actions"
import "./portal.css"

export const metadata: Metadata = {
  title: "Writer Portal - The Narrative Network",
  robots: { index: false, follow: false },
}

export default async function WriteLayout({ children }: { children: React.ReactNode }) {
  const writer = await getCurrentWriter()

  return (
    <div className="tnn-portal">
      <div className="utility">
        <div className="wrap">
          <span>WRITER PORTAL</span>
          <span>EVERY STORY IS REVIEWED BEFORE IT IS PUBLISHED</span>
        </div>
      </div>
      <header className="wrap">
        <div className="mast">
          <Link href="/write" aria-label="Writer portal home">
            <img src="/tnn-logo-black.png" alt="The Narrative Network" className="logo" />
          </Link>
          {writer && (
            <div className="mast-user">
              <span className="meta">Signed in as {writer.name}</span>
              <form action={signOutAction}>
                <button className="link-button">Sign out</button>
              </form>
            </div>
          )}
        </div>
      </header>
      <main className="wrap">{children}</main>
    </div>
  )
}
