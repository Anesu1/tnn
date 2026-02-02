
import { client } from "@/sanity/lib/client"
import { ArticleCard } from "@/components/ArticleCard"
import { urlFor } from "@/sanity/lib/image"
import { Suspense } from "react"
import SearchResults from "@/components/search-results"
import { Header } from "@/components/Header"
import { Footer } from "@/components/Footer"

export default function SearchPage() {
    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1">
                <div className="bg-secondary/10 border-b border-border/40 py-12">
                    <div className="container mx-auto px-4">
                        <h1 className="text-4xl md:text-5xl font-serif font-black tracking-tighter uppercase mb-2">
                            Search Results
                        </h1>
                        <p className="text-muted-foreground font-serif">
                            Discover articles from across the NewsStream network.
                        </p>
                    </div>
                </div>

                <section className="container mx-auto px-4 py-12">
                    <Suspense fallback={
                        <div className="flex justify-center items-center py-24">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        </div>
                    }>
                        <SearchResults />
                    </Suspense>
                </section>
            </main>
            <Footer />
        </div>
    )
}
