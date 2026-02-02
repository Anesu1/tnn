"use client"

import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { client } from "@/sanity/lib/client"
import { ArticleCard } from "@/components/ArticleCard"
import { urlFor } from "@/sanity/lib/image"
import Link from "next/link"

export default function SearchResults() {
    const searchParams = useSearchParams()
    const query = searchParams.get("q")
    const [results, setResults] = useState<any[]>([])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        async function fetchResults() {
            if (!query) {
                setResults([])
                return
            }

            setLoading(true)
            try {
                const groqQuery = `*[_type == "newsItem" && (title match $query + "*" || excerpt match $query + "*" || content[].children[].text match $query + "*")] | order(publishedAt desc) {
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
                const params = { query: query || "" };
                const fetchedResults = await client.fetch<any[]>(groqQuery, params as any);
                setResults(fetchedResults)


            } catch (error) {
                console.error("Search error:", error)
            } finally {
                setLoading(false)
            }
        }

        fetchResults()
    }, [query])

    if (loading) {
        return (
            <div className="flex justify-center items-center py-24">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        )
    }

    if (!query) {
        return (
            <div className="text-center py-24 border-2 border-dashed border-border/40">
                <h3 className="text-2xl font-serif font-bold text-muted-foreground">Enter a search term to begin.</h3>
            </div>
        )
    }

    if (results.length === 0) {
        return (
            <div className="text-center py-24 border-2 border-dashed border-border/40">
                <h3 className="text-2xl font-serif font-bold text-muted-foreground mb-4">No results found for "{query}"</h3>
                <p className="text-muted-foreground">Try different keywords or check your spelling.</p>
            </div>
        )
    }

    return (
        <div>
            <h2 className="text-xl font-sans font-black tracking-widest uppercase mb-8 pb-2 border-b-2 border-primary w-fit">
                Showing {results.length} results for "{query}"
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
                {results.map((item) => (
                    <Link key={item._id} href={`/article/${item.slug}`}>
                        <ArticleCard
                            category={item.category ?? "News"}
                            title={item.title}
                            excerpt={item.excerpt}
                            image={item.mainImage ? urlFor(item.mainImage).width(800).height(450).url() : undefined}
                            author={item.author}
                            date={new Date(item.publishedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        />
                    </Link>
                ))}
            </div>
        </div>
    )
}
