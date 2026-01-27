import { Header } from "@/components/header"
import { LiveStreamHero } from "@/components/live-stream-hero"
import { TrendingNews } from "@/components/trending-news"
import { LatestArticles } from "@/components/latest-articles"
import { Footer } from "@/components/footer"
import { NewsSection } from "@/components/news-section"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <LiveStreamHero />
        <NewsSection />
        <TrendingNews />
        <LatestArticles />

        <div className="text-center my-8">
          <Link href="/news">
            <button className="px-6 py-3 bg-black-600 text-white rounded-lg hover:bg-black-700 transition">
              View All Articles
            </button>
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  )
}
