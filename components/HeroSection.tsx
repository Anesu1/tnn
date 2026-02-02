import Image from "next/image"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"

interface HeroStory {
    title: string
    excerpt?: string
    category: string
    image?: string
    author?: string
    readTime?: string
    date?: string
    href?: string
}

interface HeroSectionProps {
    mainStory?: HeroStory
    sideStories?: HeroStory[]
}

const defaultMainStory: HeroStory = {
    title: "Global Markets Rally as Tech Sector Rebounds Unexpectedly",
    excerpt:
        "Analysts remain cautious despite the sudden surge, pointing to underlying volatility in international trade agreements and rising interest rates across major economies.",
    category: "Breaking News",
    image: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?q=80&w=2070&auto=format&fit=crop",
    author: "Sarah Jenkins",
    readTime: "4 min read",
    date: "Just now",
    href: "/news",
}

const defaultSideStories: HeroStory[] = [
    {
        title: "Senate Passes Landmark Climate Bill After Marathon Session",
        excerpt: "The bill aims to cut carbon emissions by 40% over the next decade.",
        category: "Politics",
        href: "/news",
    },
    {
        title: "New AI Regulations Proposed by European Commission",
        excerpt: "Tech giants may face stiff fines if transparency requirements are not met.",
        category: "Technology",
        href: "/news",
    },
    {
        title: "Mars Rover Discovers Traces of Ancient Riverbed",
        excerpt: "Geologists say this could be the strongest evidence of water yet.",
        category: "Science",
        href: "/news",
    },
]

export function HeroSection({ mainStory, sideStories }: HeroSectionProps) {
    const primaryStory = mainStory ?? defaultMainStory
    const secondaryStories = sideStories?.length ? sideStories : defaultSideStories

    return (
        <section className="container mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 border-b border-border pb-12">
            {/* Main Feature - Takes up 8 columns */}
            <div className="lg:col-span-8 group">
                <Link href={primaryStory.href ?? "/news"} className="block">
                    <div className="relative aspect-video w-full overflow-hidden mb-4">
                        {primaryStory.image && (
                            <Image
                                src={primaryStory.image}
                                alt={primaryStory.title}
                                fill
                                className="object-cover transition-transform duration-700 group-hover:scale-105"
                                priority
                            />
                        )}
                    </div>
                    <div className="space-y-3">
                        <Badge
                            variant="outline"
                            className="rounded-none border-primary text-primary hover:bg-primary hover:text-white uppercase tracking-widest text-[10px]"
                        >
                            {primaryStory.category}
                        </Badge>
                        <h2 className="text-4xl md:text-5xl font-serif font-bold leading-tight group-hover:text-accent transition-colors">
                            {primaryStory.title}
                        </h2>
                        {primaryStory.excerpt && (
                            <p className="text-lg text-muted-foreground font-serif max-w-2xl line-clamp-2">
                                {primaryStory.excerpt}
                            </p>
                        )}
                        <div className="flex flex-wrap items-center text-xs font-sans text-muted-foreground gap-x-3 gap-y-1 pt-2">
                            {primaryStory.author && <span className="font-bold text-primary">By {primaryStory.author}</span>}
                            {primaryStory.readTime && <span>{primaryStory.readTime}</span>}
                            {primaryStory.date && <span>{primaryStory.date}</span>}
                        </div>
                    </div>
                </Link>
            </div>

            {/* Side Stories - Takes up 4 columns */}
            <div className="lg:col-span-4 flex flex-col space-y-6 lg:border-l lg:border-border lg:pl-8">
                <div className="flex items-center justify-between border-b-2 border-primary pb-2 mb-2">
                    <h3 className="font-sans font-bold text-sm tracking-widest uppercase">Top Stories</h3>
                </div>

                {secondaryStories.map((story, index) => (
                    <div key={`${story.title}-${index}`} className="group">
                        <Link href={story.href ?? "/news"} className="block">
                            <div className="flex flex-col space-y-2">
                                <span className="text-xs font-bold text-accent uppercase">{story.category}</span>
                                <h4 className="text-xl font-serif font-bold leading-snug group-hover:underline decoration-1 underline-offset-4">
                                    {story.title}
                                </h4>
                                {story.excerpt && (
                                    <p className="text-sm text-muted-foreground line-clamp-2">{story.excerpt}</p>
                                )}
                            </div>
                        </Link>
                        {index < secondaryStories.length - 1 && <div className="h-px bg-border w-full mt-6" />}
                    </div>
                ))}
            </div>
        </section>
    )
}
