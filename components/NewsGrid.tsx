import Link from "next/link"
import { ArticleCard } from "./ArticleCard"
import { urlFor } from "@/sanity/lib/image"

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

interface TrendingItem {
    _id: string
    title: string
    slug?: string
}

interface NewsGridProps {
    business: NewsItem[]
    tech: NewsItem[]
    editorsPicks: NewsItem[]
    trending: TrendingItem[]
}

export function NewsGrid({ business, tech, editorsPicks, trending }: NewsGridProps) {
    return (
        <section className="container mx-auto px-4 py-12">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* Main Feed - 8 Columns */}
                <div className="lg:col-span-8 space-y-12">

                    {/* Section: Business */}
                    <div>
                        <div className="flex items-center justify-between border-b-2 border-primary mb-6 pb-2">
                            <h2 className="text-2xl font-serif font-bold">Business & Economy</h2>
                            <Link href="/business" className="text-xs font-bold text-accent uppercase tracking-widest hover:underline">
                                View All
                            </Link>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {business.slice(0, 2).map((item) => (
                                <Link key={item._id} href={item.slug ? `/news/${item.slug}` : "/news"}>
                                    <ArticleCard
                                        category={item.category ?? "Business"}
                                        title={item.title}
                                        excerpt={item.excerpt}
                                        image={item.mainImage ? urlFor(item.mainImage).width(900).height(600).url() : undefined}
                                        author={item.author}
                                        date={
                                            item.publishedAt
                                                ? new Date(item.publishedAt).toLocaleDateString("en-US", {
                                                    month: "short",
                                                    day: "numeric",
                                                })
                                                : undefined
                                        }
                                    />
                                </Link>
                            ))}
                        </div>
                        <div className="grid grid-cols-1 gap-6 mt-8">
                            {business.slice(2, 4).map((item) => (
                                <Link key={item._id} href={item.slug ? `/news/${item.slug}` : "/news"}>
                                    <ArticleCard
                                        variant="horizontal"
                                        category={item.category ?? "Business"}
                                        title={item.title}
                                        excerpt={item.excerpt}
                                        image={item.mainImage ? urlFor(item.mainImage).width(600).height(450).url() : undefined}
                                        author={item.author}
                                        date={
                                            item.publishedAt
                                                ? new Date(item.publishedAt).toLocaleDateString("en-US", {
                                                    month: "short",
                                                    day: "numeric",
                                                })
                                                : undefined
                                        }
                                    />
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Section: Technology */}
                    <div>
                        <div className="flex items-center justify-between border-b-2 border-primary mb-6 pb-2">
                            <h2 className="text-2xl font-serif font-bold">Technology</h2>
                            <Link href="/tech" className="text-xs font-bold text-accent uppercase tracking-widest hover:underline">
                                View All
                            </Link>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {tech.slice(0, 4).map((item, index) => (
                                <Link key={item._id} href={item.slug ? `/news/${item.slug}` : "/news"}>
                                    <ArticleCard
                                        category={item.category ?? "Tech"}
                                        title={item.title}
                                        image={item.mainImage ? urlFor(item.mainImage).width(800).height(520).url() : undefined}
                                        className={index === 0 || index === 3 ? "md:col-span-2" : undefined}
                                    />
                                </Link>
                            ))}
                        </div>
                    </div>

                </div>

                {/* Sidebar - 4 Columns */}
                <aside className="lg:col-span-4 space-y-12 lg:border-l lg:border-border lg:pl-8">

                    {/* Editors Picks */}
                    <div className="bg-secondary/40 p-6">
                        <h3 className="font-sans font-bold text-sm tracking-widest uppercase mb-4 border-b border-border pb-2">Editor's Picks</h3>
                        <div className="space-y-6">
                            {editorsPicks.map((item) => (
                                <Link key={item._id} href={item.slug ? `/news/${item.slug}` : "/news"}>
                                    <ArticleCard
                                        variant="compact"
                                        category={item.category ?? "News"}
                                        title={item.title}
                                        date={item.author ?? ""}
                                    />
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Newsletter Signup (Placeholder) */}
                    <div className="border border-border p-6 text-center">
                        <h3 className="font-serif font-bold text-xl mb-2">Daily Briefing</h3>
                        <p className="text-sm text-muted-foreground mb-4">Essential news, expert analysis, and exclusive content delivered straight to your inbox.</p>
                        <div className="flex flex-col space-y-2">
                            <input type="email" placeholder="Your email address" className="w-full px-3 py-2 border border-input bg-background/50 text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
                            <button className="w-full bg-primary text-primary-foreground py-2 text-sm font-bold tracking-wide hover:bg-primary/90">SUBSCRIBE</button>
                        </div>
                    </div>

                    {/* Trending */}
                    <div>
                        <h3 className="font-sans font-bold text-sm tracking-widest uppercase mb-4 border-b border-border pb-2">Trending Now</h3>
                        <ol className="list-decimal list-inside space-y-4 font-serif font-bold text-lg marker:text-accent marker:font-sans">
                            {trending.map((item) => (
                                <li key={item._id}>
                                    <Link href={item.slug ? `/news/${item.slug}` : "/news"} className="hover:text-accent">
                                        {item.title}
                                    </Link>
                                </li>
                            ))}
                        </ol>
                    </div>

                </aside>

            </div>
        </section>
    )
}
