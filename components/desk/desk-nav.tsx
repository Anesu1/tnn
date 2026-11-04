"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

export function DeskNav({ links }: { links: { href: string; label: string; count?: number }[] }) {
  const pathname = usePathname()
  return (
    <nav className="desk-nav" aria-label="Editorial Desk">
      {links.map((link) => {
        const active = link.href === "/desk" ? pathname === "/desk" : pathname.startsWith(link.href)
        return (
          <Link key={link.href} href={link.href} aria-current={active ? "page" : undefined}>
            {link.label}
            {!!link.count && (
              <span className="count" aria-label={`${link.count} need attention`}>
                {link.count}
              </span>
            )}
          </Link>
        )
      })}
    </nav>
  )
}
