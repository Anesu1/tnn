"use client"

import Link from "next/link"
import { Search, Menu, Bell } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { SearchDialog } from "@/components/search-dialog"

export default function Header() {
  const [searchOpen, setSearchOpen] = useState(false)
  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  const categories = [
    { name: "WORLD", slug: "world" },
    { name: "POLITICS", slug: "politics" },
    { name: "BUSINESS", slug: "business" },
    { name: "TECH", slug: "tech" },
    { name: "SCIENCE", slug: "science" },
    { name: "HEALTH", slug: "health" },
    { name: "SPORTS", slug: "sports" },
  ]

  return (
    <header className="border-b border-border bg-background sticky top-0 z-50">
      {/* Top Level: Brand & Actions */}
      <div className="container mx-auto px-4 h-16 flex items-center justify-between border-b border-border/40">
        <div className="flex items-center space-x-6">
          <Link href="/" className="flex items-center space-x-2">
            <h1 className="text-2xl md:text-3xl font-serif font-black tracking-tighter leading-none">
              NEWS<span className="text-accent">STREAM</span>
            </h1>
          </Link>
          <div className="hidden lg:block border-l border-border h-6 mx-4"></div>
          <span className="hidden lg:block text-[10px] font-sans text-muted-foreground uppercase tracking-widest font-bold">
            {currentDate} | Today's Paper
          </span>
        </div>

        <div className="flex items-center space-x-1 md:space-x-3">
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-primary"
            onClick={() => setSearchOpen(true)}
            aria-label="Open search"
          >
            <Search className="h-5 w-5" />
          </Button>
          <div className="hidden md:flex items-center space-x-4 text-[10px] font-sans font-black tracking-widest">
            <Link href="/login" className="hover:text-primary transition-colors border border-border px-3 py-1.5">SIGN IN</Link>
            <Link href="/subscribe" className="bg-accent text-white px-3 py-1.5 hover:bg-accent/90 transition-colors">SUBSCRIBE</Link>
          </div>
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-6 w-6" />
          </Button>
        </div>
      </div>

      {/* Second Level: Categories Navigation */}
      <nav className="bg-secondary/10 overflow-x-auto no-scrollbar border-b border-border/20">
        <div className="container mx-auto px-4">
          <ul className="flex items-center space-x-6 h-10 min-w-max text-[11px] font-sans font-black tracking-[0.15em] text-muted-foreground">
            {categories.map((cat) => (
              <li key={cat.slug} className="relative group">
                <Link
                  href={`/category/${cat.slug}`}
                  className="hover:text-foreground transition-colors block py-2 px-1 relative"
                >
                  {cat.name}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-accent transition-all duration-300 group-hover:w-full"></span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
    </header>
  )
}
