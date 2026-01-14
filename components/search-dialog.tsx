"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import Link from "next/link"

interface SearchDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SearchDialog({ open, onOpenChange }: SearchDialogProps) {
  const [searchQuery, setSearchQuery] = useState("")

  // Mock search results - replace with real search logic
  const mockResults = [
    { id: 1, title: "Breaking: Climate Summit Reaches Historic Agreement", category: "Politics", url: "/news" },
    { id: 2, title: "Tech Giants Announce New AI Partnership", category: "Technology", url: "/news" },
    { id: 3, title: "Markets Rally on Economic Reports", category: "Business", url: "/news" },
    { id: 4, title: "Scientists Discover New Species in Amazon", category: "Science", url: "/news" },
  ]

  const filteredResults = searchQuery
    ? mockResults.filter((result) => result.title.toLowerCase().includes(searchQuery.toLowerCase()))
    : mockResults

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Search News</DialogTitle>
          <DialogDescription>Search for news articles, videos, and live streams</DialogDescription>
        </DialogHeader>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search for news, videos, categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
            autoFocus
          />
        </div>

        <div className="mt-4 max-h-[400px] overflow-y-auto">
          {filteredResults.length > 0 ? (
            <div className="space-y-2">
              {filteredResults.map((result) => (
                <Link
                  key={result.id}
                  href={result.url}
                  onClick={() => onOpenChange(false)}
                  className="block rounded-lg border p-3 hover:bg-accent transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-1">
                      <h3 className="font-medium text-sm leading-relaxed">{result.title}</h3>
                      <p className="text-xs text-muted-foreground mt-1">{result.category}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Search className="h-12 w-12 mx-auto mb-2 opacity-20" />
              <p className="text-sm">No results found</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
