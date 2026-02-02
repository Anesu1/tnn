import { notFound } from "next/navigation"
import Link from "next/link"
import { PortableText, PortableTextComponents } from "@portabletext/react"
import { client } from "@/sanity/lib/client"
import { urlFor } from "@/sanity/lib/image"
import { Header } from "@/components/Header"
import { Footer } from "@/components/Footer"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, User, Share2 } from "lucide-react"

async function getArticle(slug: string) {
    const query = `*[_type == "newsItem" && slug.current == $slug][0]{
    title,
    excerpt,
    publishedAt,
    readTime,
    mainImage,
    content,
    "author": author->name,
    "category": categories[0]->title
  }`
    return await client.fetch(query, { slug })
}

interface PageProps {
    params: Promise<{ slug: string }>
}

const portableTextComponents: PortableTextComponents = {
    types: {
        image: ({ value }) => {
            return (
                <figure className="my-10 space-y-2">
                    <img
                        src={urlFor(value).width(1200).url()}
                        alt={value.alt || "Article image"}
                        className="w-full aspect-video object-cover"
                    />
                    {value.alt && (
                        <figcaption className="text-sm text-muted-foreground italic text-center font-serif">
                            {value.alt}
                        </figcaption>
                    )}
                </figure>
            )
        },
    },
    block: {
        h2: ({ children }) => <h2 className="text-3xl font-serif font-bold mt-12 mb-6">{children}</h2>,
        h3: ({ children }) => <h3 className="text-2xl font-serif font-bold mt-8 mb-4">{children}</h3>,
        normal: ({ children }) => <p className="text-lg leading-relaxed font-serif mb-6 text-foreground/90">{children}</p>,
        blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-accent pl-6 py-2 my-8 italic text-2xl font-serif text-muted-foreground">
                {children}
            </blockquote>
        ),
    },
}

export default async function ArticlePage({ params }: PageProps) {
    const { slug } = await params
    const article = await getArticle(slug)

    if (!article) {
        notFound()
    }

    return (
        <div className="min-h-screen flex flex-col bg-background">
            <Header />
            <main className="flex-1">
                <article className="container mx-auto px-4 py-12 max-w-4xl">
                    {/* Article Header */}
                    <header className="space-y-6 mb-12 text-center md:text-left">
                        <Badge variant="secondary" className="rounded-none uppercase tracking-[0.2em] font-black text-xs px-3 py-1">
                            {article.category}
                        </Badge>
                        <h1 className="text-4xl md:text-6xl font-serif font-black leading-tight tracking-tighter">
                            {article.title}
                        </h1>
                        <p className="text-xl md:text-2xl text-muted-foreground font-serif italic leading-relaxed">
                            {article.excerpt}
                        </p>

                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 text-xs font-sans font-bold uppercase tracking-widest text-muted-foreground pt-6 border-t border-border">
                            <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-accent" />
                                <span>{article.author}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-accent" />
                                <span>{new Date(article.publishedAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-accent" />
                                <span>{article.readTime}</span>
                            </div>
                            <button className="flex items-center gap-2 hover:text-accent transition-colors ml-auto hidden md:flex">
                                <Share2 className="h-4 w-4" />
                                <span>Share Story</span>
                            </button>
                        </div>
                    </header>

                    {/* Main Hero Image */}
                    {article.mainImage && (
                        <div className="relative aspect-video w-full mb-12 shadow-2xl">
                            <img
                                src={urlFor(article.mainImage).width(1600).height(900).url()}
                                alt={article.title}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    )}

                    {/* Article Content */}
                    <div className="max-w-3xl mx-auto">
                        <PortableText value={article.content} components={portableTextComponents} />
                    </div>

                    {/* Article Footer */}
                    <footer className="mt-16 pt-8 border-t border-border flex justify-between items-center">
                        <div className="flex gap-4">
                            <button className="p-2 border border-border hover:bg-accent hover:text-white transition-all"><Share2 className="h-4 w-4" /></button>
                        </div>
                        <Link href="/" className="text-xs font-black uppercase tracking-widest hover:text-accent transition-colors">
                            Back to News Stream
                        </Link>
                    </footer>
                </article>
            </main>
            <Footer />
        </div>
    )
}
