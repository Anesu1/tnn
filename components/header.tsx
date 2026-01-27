"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Menu, Search } from "lucide-react"
import { SearchDialog } from "@/components/search-dialog"
import { SubscribeDialog } from "@/components/subscribe-dialog"
import { useState } from "react"

export function Header() {
  const [searchOpen, setSearchOpen] = useState(false)
  const [subscribeOpen, setSubscribeOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex flex-col items-start gap-1">
            <span className="text-2xl font-bold text-primary">The Narrative Network</span>
            <span className="text-sm text-muted-foreground">Redefining Africa's Narrative</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-sm font-medium hover:text-primary transition-colors">
              Home
            </Link>
            <Link href="/live" className="text-sm font-medium hover:text-primary transition-colors">
              Live
            </Link>
            <Link href="/news" className="text-sm font-medium hover:text-primary transition-colors">
              News
            </Link>
            <Link href="/videos" className="text-sm font-medium hover:text-primary transition-colors">
              Videos
            </Link>
            <Link href="/categories" className="text-sm font-medium hover:text-primary transition-colors">
              Categories
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="hidden sm:flex" onClick={() => setSearchOpen(true)}>
            <Search className="h-5 w-5" />
          </Button>
          {/* <Button className="hidden sm:flex" onClick={() => setSubscribeOpen(true)}>
            Subscribe
          </Button> */}
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
      <SubscribeDialog open={subscribeOpen} onOpenChange={setSubscribeOpen} />
    </header>
  )
}
