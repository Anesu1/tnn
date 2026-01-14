import { Header } from "@/components/header"
import { LiveStreamHero } from "@/components/live-stream-hero"
import { TrendingNews } from "@/components/trending-news"
import { LatestArticles } from "@/components/latest-articles"
import { Footer } from "@/components/footer"
import { NewsSection } from "@/components/news-section"

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <LiveStreamHero />
         <NewsSection />
        <TrendingNews />
        <LatestArticles />
       
      </main>
      <Footer />
    </div>
  )
}
