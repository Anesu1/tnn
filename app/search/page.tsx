"use client"

import { useEffect, useMemo, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Header } from "@/components/Header"
import { Footer } from "@/components/Footer"
import { ArticleCard } from "@/components/ArticleCard"
import { Input } from "@/components/ui/input"
import { client } from "@/sanity/lib/client"
import { urlFor } from "@/sanity/lib/image"
import { Search } from "lucide-react"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import Link from "next/link"

interface SearchResult {
  _id: string
  title: string
  excerpt?: string
  category?: string
  author?: string
  publishedAt?: string
  readTime?: string
  mainImage?: any
  slug?: string
}

const MAX_RESULTS = 18

export default function SearchPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const initialQuery = searchParams.get("q") ?? ""
  const [query, setQuery] = useState(initialQuery)
  const [results, setResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)

  const trimmedQuery = useMemo(() => query.trim(), [query])

  useEffect(() => {
    const urlQuery = searchParams.get("q") ?? ""
    if (urlQuery !== query) {
      setQuery(urlQuery)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  useEffect(() => {
    let isActive = true
    const debounce = setTimeout(async () => {
      if (trimmedQuery === "") {
        setResults([])
        setIsSearching(false)
        return
      }

      setIsSearching(true)

      const queryString = `*[_type == "newsItem" && (
        title match $searchQuery ||
        excerpt match $searchQuery ||
        content[].children[].text match $searchQuery
      )] | order(publishedAt desc)[0...${MAX_RESULTS}] {
        _id,
        title,
        excerpt,
        "category": categories[0]->title,
        "author": author->name,
        publishedAt,
        readTime,
        mainImage,
        "slug": slug.current
      }`

      const data = await client.fetch<SearchResult[]>(queryString, {
        searchQuery: `${trimmedQuery}*`,
      })

      if (isActive) {
        setResults(data)
        setIsSearching(false)
      }
    }, 300)

    return () => {
      isActive = false
      clearTimeout(debounce)
    }
  }, [trimmedQuery])

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const nextQuery = query.trim()
    const params = new URLSearchParams()
    if (nextQuery) {
      params.set("q", nextQuery)
    }
    router.replace(`/search?${params.toString()}`)
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <section className="container mx-auto px-4 pt-10 pb-6">
          <h1 className="text-4xl md:text-5xl font-serif font-bold">Search</h1>
          <p className="text-muted-foreground mt-2 max-w-2xl">
            Explore articles across all categories and find the stories you care about.
          </p>
        </section>

        <section className="container mx-auto px-4 pb-10">
          <form onSubmit={handleSubmit} className="relative max-w-2xl">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search for news, categories, or topics..."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="pl-9"
            />
          </form>
          <div className="mt-3 text-sm text-muted-foreground">
            {trimmedQuery
              ? `Showing results for "${trimmedQuery}"`
              : "Start typing to search across all NewsStream coverage."}
          </div>
        </section>

        <section className="container mx-auto px-4 pb-16">
          {trimmedQuery && results.length === 0 && !isSearching ? (
            <Empty className="border border-dashed">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <Search className="h-5 w-5" />
                </EmptyMedia>
                <EmptyTitle>No results found</EmptyTitle>
                <EmptyDescription>
                  We could not find any articles matching "{trimmedQuery}".
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <p>Try different keywords or explore the latest stories instead.</p>
              </EmptyContent>
            </Empty>
          ) : null}

          {isSearching && (
            <div className="text-sm text-muted-foreground">Searching...</div>
          )}

          {results.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {results.map((article) => (
                <Link key={article._id} href={article.slug ? `/news/${article.slug}` : "/news"}>
                  <ArticleCard
                    category={article.category ?? "News"}
                    title={article.title}
                    excerpt={article.excerpt}
                    image={article.mainImage ? urlFor(article.mainImage).width(800).height(450).url() : undefined}
                    author={article.author}
                    date={
                      article.publishedAt
                        ? new Date(article.publishedAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })
                        : undefined
                    }
                  />
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  )
}
