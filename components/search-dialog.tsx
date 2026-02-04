"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import Link from "next/link"
import { client } from "@/sanity/lib/client"

interface SearchDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface SearchResult {
  _id: string
  title: string
  category: string
  slug: string
}

export function SearchDialog({ open, onOpenChange }: SearchDialogProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [results, setResults] = useState<SearchResult[]>([])

  useEffect(() => {
    let isActive = true
    const debounce = setTimeout(async () => {
      if (searchQuery.trim() === "") {
        setResults([])
        setIsSearching(false)
        return
      }

      setIsSearching(true)

      const query = `*[_type == "newsItem" && (
        title match $searchQuery ||
        excerpt match $searchQuery ||
        content[].children[].text match $searchQuery
      )] | order(publishedAt desc)[0...10] {
        _id,
        title,
        "category": categories[0]->title,
        "slug": slug.current
      }`

      const data = await client.fetch(query, { searchQuery: `${searchQuery}*` })
      if (isActive) {
        setResults(data)
        setIsSearching(false)
      }
    }, 250)

    return () => {
      isActive = false
      clearTimeout(debounce)
    }
  }, [searchQuery])

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

        <div className="mt-4 max-h-100 overflow-y-auto">
          {results.length > 0 ? (
            <div className="space-y-2">
              {results.map((result) => (
                <Link
                  key={result._id}
                  href={`/news/${result.slug}`}
                  onClick={() => onOpenChange(false)}
                  className="block rounded-lg border p-3 hover:bg-accent group transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-1">
                      <h3 className="font-medium text-sm leading-relaxed group-hover:text-white">{result.title}</h3>
                      <p className="text-xs text-muted-foreground mt-1 group-hover:text-white">{result.category}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Search className="h-12 w-12 mx-auto mb-2 opacity-20" />
              <p className="text-sm">
                {isSearching ? "Searching..." : "No results found"}
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
