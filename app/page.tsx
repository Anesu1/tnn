
import { HeroSection } from "@/components/HeroSection"
import { NewsGrid } from "@/components/NewsGrid"
// import { Footer } from "@/components/Footer"
import { client } from "@/sanity/lib/client"
import { urlFor } from "@/sanity/lib/image"
import { CategorySection } from "@/components/home/category-section"
import { MostRead } from "@/components/home/most-read"
import { LatestTicker } from "@/components/home/latest-ticker"
import { CategoryStrip } from "@/components/category-strip"
import Header from "./Header"
import Footer from "./Footer"
// import { Header } from "@/components/Header"

export const revalidate = 60

interface NewsItem {
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

async function getHomeData() {
  const latestQuery = `*[_type == "newsItem"] | order(publishedAt desc)[0...4]{
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

  const breakingQuery = `*[_type == "newsItem" && count(categories[@->slug.current == "breaking-news"]) > 0]
    | order(publishedAt desc)[0...4]{
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

  const politicsQuery = `*[_type == "newsItem" && count(categories[@->slug.current == "politics-governance"]) > 0]
    | order(publishedAt desc)[0...4]{
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

  const businessQuery = `*[_type == "newsItem" && count(categories[@->slug.current == "business-economy"]) > 0]
    | order(publishedAt desc)[0...4]{
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

  const socialQuery = `*[_type == "newsItem" && count(categories[@->slug.current == "social-community-affairs"]) > 0]
    | order(publishedAt desc)[0...4]{
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

  const creativeQuery = `*[_type == "newsItem" && count(categories[@->slug.current == "creative-cultural-industries"]) > 0]
    | order(publishedAt desc)[0...4]{
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

  const sportsQuery = `*[_type == "newsItem" && count(categories[@->slug.current == "sports-entertainment"]) > 0]
    | order(publishedAt desc)[0...4]{
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

  const editorsPicksQuery = `*[_type == "newsItem" && trending == true]
    | order(publishedAt desc)[0...4]{
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

  const trendingQuery = `*[_type == "newsItem"] | order(publishedAt desc)[0...5]{
    _id,
    title,
    "slug": slug.current
  }`

  const latestHeadlinesQuery = `*[_type == "newsItem"] | order(publishedAt desc)[0...8]{
    _id,
    title,
    "slug": slug.current
  }`

  const [latest, breaking, politics, business, social, creative, sports, editorsPicks, trending, latestHeadlines] = await Promise.all([
    client.fetch<NewsItem[]>(latestQuery),
    client.fetch<NewsItem[]>(breakingQuery),
    client.fetch<NewsItem[]>(politicsQuery),
    client.fetch<NewsItem[]>(businessQuery),
    client.fetch<NewsItem[]>(socialQuery),
    client.fetch<NewsItem[]>(creativeQuery),
    client.fetch<NewsItem[]>(sportsQuery),
    client.fetch<NewsItem[]>(editorsPicksQuery),
    client.fetch<{ _id: string; title: string; slug?: string }[]>(trendingQuery),
    client.fetch<{ _id: string; title: string; slug?: string }[]>(latestHeadlinesQuery),
  ])

  return {
    latest,
    breaking,
    politics,
    business,
    social,
    creative,
    sports,
    editorsPicks,
    trending,
    latestHeadlines,
  }
}

export default async function Home() {
  const { latest, breaking, politics, business, social, creative, sports, editorsPicks, trending, latestHeadlines } =
    await getHomeData()
  const [hero, ...sideStories] = latest
console.log(hero)
  return (
    <main className="min-h-screen bg-background">
      <Header />
      <LatestTicker items={latestHeadlines} />
      {/* <CategoryStrip /> */}
      <HeroSection
        mainStory={
          hero
            ? {
              title: hero.title,
              excerpt: hero.excerpt,
              category: hero.category ?? "Breaking News",
              image: hero.mainImage ? urlFor(hero.mainImage).width(1600).height(900).url() : undefined,
              author: hero.author,
              readTime: hero.readTime,
              date: hero.publishedAt
                ? new Date(hero.publishedAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })
                : undefined,
              href: hero.slug ? `/article/${hero.slug}` : "/news",
            }
            : undefined
        }
        sideStories={sideStories.map((item) => ({
          title: item.title,
          excerpt: item.excerpt,
          category: item.category ?? "Top Stories",
          href: item.slug ? `/article/${item.slug}` : "/news",
        }))}
      />
      <NewsGrid
        breaking={breaking}
        politics={politics}
        business={business}
        social={social}
        creative={creative}
        sports={sports}
        editorsPicks={editorsPicks.length ? editorsPicks : latest}
        trending={trending}
      />
      <CategorySection title="Breaking News" href="/category/breaking-news" items={breaking} />
      <CategorySection title="Politics & Governance" href="/category/politics-governance" items={politics} />
      <CategorySection title="Social & Community Affairs" href="/category/social-community-affairs" items={social} />
      <CategorySection title="Creative & Cultural Industries" href="/category/creative-cultural-industries" items={creative} />
      <CategorySection title="Sports & Entertainment" href="/category/sports-entertainment" items={sports} />

      <MostRead items={trending} />
      <Footer />
    </main>
  )
}
