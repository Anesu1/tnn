"use client"

import { usePathname } from "next/navigation"
import { SECTIONS } from "@/lib/site/config"
import { Icon } from "./icons"

// `short` labels replace the full ones on phones (see .nav-short in editorial.css)
const MAIN_NAV: { href: string; label: string; short?: string }[] = [
  { href: "/latest", label: "LATEST" },
  ...SECTIONS.map((section) => ({ href: `/category/${section.slug}`, label: section.nav, short: section.short })),
  { href: "/watch", label: "WATCH TNN", short: "WATCH" },
  { href: "/archive", label: "ARCHIVE" },
]

// The reference marks only Latest and the section pages as the current page
const MARKS_CURRENT = new Set(["/latest", ...SECTIONS.map((section) => `/category/${section.slug}`)])

export function MainNav() {
  const pathname = usePathname()
  return (
    <nav className="nav" aria-label="News categories">
      {MAIN_NAV.map((item) => (
        <a
          key={item.href}
          href={item.href}
          aria-current={pathname === item.href && MARKS_CURRENT.has(item.href) ? "page" : undefined}
        >
          {item.short && item.short !== item.label ? (
            <>
              <span className="nav-full">{item.label}</span>
              <span className="nav-short">{item.short}</span>
            </>
          ) : (
            item.label
          )}
        </a>
      ))}
      <a className="search-link" href="/search">
        <Icon name="search" />
        SEARCH
      </a>
    </nav>
  )
}
