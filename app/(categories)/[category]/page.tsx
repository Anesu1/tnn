import { notFound } from "next/navigation"
import type { Metadata } from "next"

import { HeroSection } from "@/components/HeroSection"
import { ArticleCard } from "@/components/ArticleCard"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { client } from "@/sanity/lib/client"
import { urlFor } from "@/sanity/lib/image"
import { Newspaper } from "lucide-react"
import Link from "next/link"
import { MostRead } from "@/components/home/most-read"
import { LatestTicker } from "@/components/home/latest-ticker"
import { CategoryStrip } from "@/components/category-strip"
import { Header } from "@/components/Header"
import { Footer } from "@/components/Footer"

export const revalidate = 60

const CATEGORY_CONFIG = {
  world: {
    title: "World",
    description: "Global headlines, conflicts, diplomacy, and stories shaping the world.",
  },
  politics: {
    title: "Politics",
    description: "Election coverage, policy updates, and political analysis.",
  },
  business: {
    title: "Business",
    description: "Markets, companies, and the global economy.",
  },
  tech: {
    title: "Tech",
    description: "Innovation, startups, AI, and the future of technology.",
  },
  science: {
    title: "Science",
    description: "Discoveries, research, and breakthroughs in science.",
  },
  health: {
    title: "Health",
    description: "Medical research, wellness, and public health updates.",
  },
  sports: {
    title: "Sports",
    description: "Scores, highlights, and analysis across major sports.",
  },
} as const

type CategoryKey = keyof typeof CATEGORY_CONFIG

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

function formatDate(date?: string) {
  if (!date) return undefined
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

function GridSection({
  title,
  items,
  columns = "lg:grid-cols-3",
}: {
  title: string
  items: NewsItem[]
  columns?: string
}) {
  if (!items.length) return null
  return (
    <section className="container mx-auto px-4 py-10">
      <div className="flex items-center justify-between border-b-2 border-primary mb-6 pb-2">
        <h2 className="text-2xl font-serif font-bold">{title}</h2>
      </div>
      <div className={`grid grid-cols-1 md:grid-cols-2 ${columns} gap-8`}>
        {items.map((article) => (
          <Link key={article._id} href={article.slug ? `/news/${article.slug}` : "/news"}>
            <ArticleCard
              category={article.category ?? title}
              title={article.title}
              excerpt={article.excerpt}
              image={article.mainImage ? urlFor(article.mainImage).width(800).height(450).url() : undefined}
              author={article.author}
              date={formatDate(article.publishedAt)}
            />
          </Link>
        ))}
      </div>
    </section>
  )
}

function HorizontalSection({ title, items }: { title: string; items: NewsItem[] }) {
  if (!items.length) return null
  return (
    <section className="container mx-auto px-4 py-10">
      <div className="flex items-center justify-between border-b-2 border-primary mb-6 pb-2">
        <h2 className="text-2xl font-serif font-bold">{title}</h2>
      </div>
      <div className="space-y-6">
        {items.map((article) => (
          <Link key={article._id} href={article.slug ? `/news/${article.slug}` : "/news"}>
            <ArticleCard
              variant="horizontal"
              category={article.category ?? title}
              title={article.title}
              excerpt={article.excerpt}
              image={article.mainImage ? urlFor(article.mainImage).width(700).height(500).url() : undefined}
              author={article.author}
              date={formatDate(article.publishedAt)}
            />
          </Link>
        ))}
      </div>
    </section>
  )
}

function CompactRail({ title, items }: { title: string; items: NewsItem[] }) {
  if (!items.length) return null
  return (
    <section className="container mx-auto px-4 py-10">
      <div className="flex items-center justify-between border-b-2 border-primary mb-6 pb-2">
        <h2 className="text-2xl font-serif font-bold">{title}</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {items.map((article) => (
          <Link key={article._id} href={article.slug ? `/news/${article.slug}` : "/news"}>
            <ArticleCard
              variant="compact"
              category={article.category ?? title}
              title={article.title}
              date={article.author ?? ""}
            />
          </Link>
        ))}
      </div>
    </section>
  )
}

async function getCategoryArticles(category: CategoryKey) {
  const query = `*[_type == "newsItem" && count(categories[@->slug.current == $slug]) > 0]
    | order(publishedAt desc) {
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

  return client.fetch<NewsItem[]>(query, { slug: category })
}

async function getLatestHeadlines(category: CategoryKey) {
  const query = `*[_type == "newsItem" && count(categories[@->slug.current == $slug]) > 0]
    | order(publishedAt desc)[0...8]{
      _id,
      title,
      "slug": slug.current
    }`
  return client.fetch<{ _id: string; title: string; slug?: string }[]>(query, { slug: category })
}

export async function generateMetadata({
  params,
}: {
  params: { category: string }
}): Promise<Metadata> {
  const categoryKey = params.category as CategoryKey
  const config = CATEGORY_CONFIG[categoryKey]

  if (!config) {
    return {}
  }

  return {
    title: `${config.title} | NewsStream`,
    description: config.description,
  }
}

export default async function CategoryPage({
  params,
}: {
  params: { category: string }
}) {
  const categoryKey = params.category as CategoryKey
  const config = CATEGORY_CONFIG[categoryKey]

  if (!config) {
    notFound()
  }

  const [articles, latestHeadlines] = await Promise.all([
    getCategoryArticles(categoryKey),
    getLatestHeadlines(categoryKey),
  ])
  const [primary, ...rest] = articles
  const topGrid = rest.slice(0, 6)
  const secondary = rest.slice(6)
  const compactItems = secondary.slice(0, 6)
  const horizontalItems = secondary.slice(6, 9)
  const heroSideStories = rest.slice(0, 3).map((item) => ({
    title: item.title,
    excerpt: item.excerpt,
    category: item.category ?? config.title,
    href: item.slug ? `/news/${item.slug}` : "/news",
  }))

  const heroStory = primary
    ? {
        title: primary.title,
        excerpt: primary.excerpt,
        category: primary.category ?? config.title,
        image: primary.mainImage ? urlFor(primary.mainImage).width(1600).height(900).url() : undefined,
        author: primary.author,
        readTime: primary.readTime,
        date: primary.publishedAt
          ? new Date(primary.publishedAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })
          : undefined,
        href: primary.slug ? `/news/${primary.slug}` : "/news",
      }
    : undefined

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <LatestTicker items={latestHeadlines} />
      <CategoryStrip />
      <main className="flex-1">
        <section className="container mx-auto px-4 pt-10 pb-6">
          <h1 className="text-4xl md:text-5xl font-serif font-bold">{config.title}</h1>
          <p className="text-muted-foreground mt-2 max-w-2xl">{config.description}</p>
        </section>

        {articles.length > 0 && (
          <HeroSection mainStory={heroStory} sideStories={heroSideStories} />
        )}

        {articles.length === 0 ? (
          <section className="container mx-auto px-4 py-12">
            <Empty className="border border-dashed">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <Newspaper className="h-5 w-5" />
                </EmptyMedia>
                <EmptyTitle>No stories yet</EmptyTitle>
                <EmptyDescription>
                  We do not have any {config.title.toLowerCase()} stories published yet.
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <p>Check back later or explore other sections for the latest updates.</p>
              </EmptyContent>
            </Empty>
          </section>
        ) : (
          <>
            {categoryKey === "world" && (
              <>
                <GridSection title="Top Stories" items={topGrid} />
                <HorizontalSection title="Global Briefing" items={horizontalItems} />
                <CompactRail title="On the Ground" items={compactItems} />
              </>
            )}
            {categoryKey === "politics" && (
              <>
                <GridSection title="Policy & Elections" items={topGrid} />
                <HorizontalSection title="Analysis" items={horizontalItems} />
                <CompactRail title="Inside Government" items={compactItems} />
              </>
            )}
            {categoryKey === "business" && (
              <>
                <GridSection title="Markets & Economy" items={topGrid} />
                <HorizontalSection title="Deals & Companies" items={horizontalItems} />
                <CompactRail title="Market Movers" items={compactItems} />
              </>
            )}
            {categoryKey === "tech" && (
              <>
                <GridSection title="Innovation" items={topGrid} columns="lg:grid-cols-2" />
                <HorizontalSection title="Startups & AI" items={horizontalItems} />
                <CompactRail title="Product Briefs" items={compactItems} />
              </>
            )}
            {categoryKey === "science" && (
              <>
                <GridSection title="Discoveries" items={topGrid} />
                <HorizontalSection title="Research Deep Dive" items={horizontalItems} />
                <CompactRail title="Quick Briefs" items={compactItems} />
              </>
            )}
            {categoryKey === "health" && (
              <>
                <GridSection title="Medical Research" items={topGrid} />
                <HorizontalSection title="Public Health" items={horizontalItems} />
                <CompactRail title="Wellness Updates" items={compactItems} />
              </>
            )}
            {categoryKey === "sports" && (
              <>
                <GridSection title="Highlights" items={topGrid} />
                <HorizontalSection title="Game Reports" items={horizontalItems} />
                <CompactRail title="Scores & Schedules" items={compactItems} />
              </>
            )}
          </>
        )}
        {articles.length > 0 && (
          <MostRead
            items={articles.slice(0, 5).map((article) => ({
              _id: article._id,
              title: article.title,
              slug: article.slug,
            }))}
          />
        )}
      </main>
      <Footer />
    </div>
  )
}
