
import { HeroSection } from "@/components/HeroSection"
import { NewsGrid } from "@/components/NewsGrid"
// import { Footer } from "@/components/Footer"
import { client } from "@/sanity/lib/client"
import { urlFor } from "@/sanity/lib/image"
import { CategorySection } from "@/components/home/category-section"
import { MostRead } from "@/components/home/most-read"
import { LatestTicker } from "@/components/home/latest-ticker"
import { CategoryStrip } from "@/components/category-strip"
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

  const businessQuery = `*[_type == "newsItem" && count(categories[@->slug.current == "business"]) > 0]
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

  const techQuery = `*[_type == "newsItem" && count(categories[@->slug.current == "tech"]) > 0]
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

  const worldQuery = `*[_type == "newsItem" && count(categories[@->slug.current == "world"]) > 0]
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

  const politicsQuery = `*[_type == "newsItem" && count(categories[@->slug.current == "politics"]) > 0]
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

  const scienceQuery = `*[_type == "newsItem" && count(categories[@->slug.current == "science"]) > 0]
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

  const healthQuery = `*[_type == "newsItem" && count(categories[@->slug.current == "health"]) > 0]
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

  const sportsQuery = `*[_type == "newsItem" && count(categories[@->slug.current == "sports"]) > 0]
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

  const [latest, business, tech, editorsPicks, trending, world, politics, science, health, sports, latestHeadlines] = await Promise.all([
    client.fetch<NewsItem[]>(latestQuery),
    client.fetch<NewsItem[]>(businessQuery),
    client.fetch<NewsItem[]>(techQuery),
    client.fetch<NewsItem[]>(editorsPicksQuery),
    client.fetch<{ _id: string; title: string; slug?: string }[]>(trendingQuery),
    client.fetch<NewsItem[]>(worldQuery),
    client.fetch<NewsItem[]>(politicsQuery),
    client.fetch<NewsItem[]>(scienceQuery),
    client.fetch<NewsItem[]>(healthQuery),
    client.fetch<NewsItem[]>(sportsQuery),
    client.fetch<{ _id: string; title: string; slug?: string }[]>(latestHeadlinesQuery),
  ])

  return {
    latest,
    business,
    tech,
    editorsPicks,
    trending,
    world,
    politics,
    science,
    health,
    sports,
    latestHeadlines,
  }
}

export default async function Home() {
  const { latest, business, tech, editorsPicks, trending, world, politics, science, health, sports, latestHeadlines } =
    await getHomeData()
  const [hero, ...sideStories] = latest
console.log(hero)
  return (
    <main className="min-h-screen bg-background">
      {/* <Header /> */}
      <LatestTicker items={latestHeadlines} />
      <CategoryStrip />
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
        business={business}
        tech={tech}
        editorsPicks={editorsPicks.length ? editorsPicks : latest}
        trending={trending}
      />
      <CategorySection title="World" href="/category/world" items={world} />
      <CategorySection title="Politics" href="/category/politics" items={politics} />
      <CategorySection title="Science" href="/category/science" items={science} />
      <CategorySection title="Health" href="/category/health" items={health} />
      <CategorySection title="Sports" href="/category/sports" items={sports} />

      <MostRead items={trending} />
      {/* <Footer /> */}
    </main>
  )
}
