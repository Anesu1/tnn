"use client"

import { usePathname } from "next/navigation"
import { SECTIONS } from "@/lib/site/config"
import { Icon } from "./icons"

const MAIN_NAV = [
  { href: "/latest", label: "LATEST" },
  ...SECTIONS.map((section) => ({ href: `/category/${section.slug}`, label: section.nav })),
  { href: "/watch", label: "WATCH TNN" },
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
          {item.label}
        </a>
      ))}
      <a className="search-link" href="/search">
        <Icon name="search" />
        SEARCH
      </a>
    </nav>
  )
}
