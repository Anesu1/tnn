"use client"

import Link from "next/link"
import { Search, Menu, Bell } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { SearchDialog } from "@/components/search-dialog"

export function Header() {
  const [searchOpen, setSearchOpen] = useState(false)
  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  return (
    <header className="border-b border-border bg-background sticky top-0 z-50">
      {/* Top Utility Bar */}
      <div className="container mx-auto px-4 h-10 flex items-center justify-between text-xs font-sans text-muted-foreground border-b border-border/40">
        <div className="hidden md:flex items-center space-x-4">
          <span>{currentDate}</span>
          <span>Today's Paper</span>
        </div>
        <div className="flex items-center space-x-4 ml-auto">
          <Link href="/login" className="hover:text-primary transition-colors">Sign In</Link>
          <Link href="/subscribe" className="text-accent font-bold hover:underline">Subscribe</Link>
        </div>
      </div>

      {/* Main Header */}
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        {/* Mobile Menu */}
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-6 w-6" />
        </Button>

        {/* Logo */}
        <Link href="/" className="flex-shrink-0 flex items-center justify-center md:justify-start flex-1 md:flex-none">
          <div className="flex flex-col items-center md:items-start">
            <h1 className="text-3xl md:text-4xl font-serif font-black tracking-tighter leading-none">
              NEWS<span className="text-accent">STREAM</span>
            </h1>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8 mx-auto font-sans font-bold text-sm tracking-wide">
          <Link href="/world" className="hover:text-accent transition-colors">WORLD</Link>
          <Link href="/politics" className="hover:text-accent transition-colors">POLITICS</Link>
          <Link href="/business" className="hover:text-accent transition-colors">BUSINESS</Link>
          <Link href="/tech" className="hover:text-accent transition-colors">TECH</Link>
          <Link href="/science" className="hover:text-accent transition-colors">SCIENCE</Link>
          <Link href="/health" className="hover:text-accent transition-colors">HEALTH</Link>
          <Link href="/sports" className="hover:text-accent transition-colors">SPORTS</Link>
        </nav>

        {/* Actions */}
        <div className="flex items-center space-x-2 flex-1 md:flex-none justify-end">
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-primary"
            onClick={() => setSearchOpen(true)}
            aria-label="Open search"
          >
            <Search className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="hidden md:flex text-muted-foreground hover:text-primary">
            <Bell className="h-5 w-5" />
          </Button>
        </div>
      </div>
      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
    </header>
  )
}
