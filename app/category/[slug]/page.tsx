import { Header } from "@/components/Header"
import { Footer } from "@/components/Footer"
import { client } from "@/sanity/lib/client"
import { ArticleCard } from "@/components/ArticleCard"
import { urlFor } from "@/sanity/lib/image"
import { notFound } from "next/navigation"

async function getCategoryData(slug: string) {
    const query = `{
    "category": *[_type == "category" && slug.current == $slug][0] {
      title,
      description
    },
    "articles": *[_type == "newsItem" && references(*[_type == "category" && slug.current == $slug]._id)] | order(publishedAt desc) {
      _id,
      title,
      excerpt,
      "category": categories[0]->title,
      "author": author->name,
      publishedAt,
      readTime,
      mainImage,
      "slug": slug.current
    }
  }`

    return await client.fetch(query, { slug })
}

interface PageProps {
    params: Promise<{ slug: string }>
}

export default async function CategoryPage({ params }: PageProps) {
    const { slug } = await params
    const { category, articles } = await getCategoryData(slug)

    if (!category) {
        notFound()
    }

    const [featured, ...rest] = articles

    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1">
                <div className="bg-secondary/10 border-b border-border/40 py-12">
                    <div className="container mx-auto px-4">
                        <h1 className="text-4xl md:text-6xl font-serif font-black tracking-tighter uppercase mb-4">
                            {category.title}
                        </h1>
                        {category.description && (
                            <p className="text-lg text-muted-foreground font-serif max-w-2xl leading-relaxed">
                                {category.description}
                            </p>
                        )}
                    </div>
                </div>

                <section className="container mx-auto px-4 py-12">
                    {featured && (
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12 border-b border-border pb-12">
                            <div className="lg:col-span-8 group overflow-hidden">
                                <div className="relative aspect-video overflow-hidden mb-6">
                                    <img
                                        src={featured.mainImage ? urlFor(featured.mainImage).width(1200).height(675).url() : "/placeholder.svg"}
                                        alt={featured.title}
                                        className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-105"
                                    />
                                </div>
                                <div className="space-y-4">
                                    <h2 className="text-3xl md:text-5xl font-serif font-bold leading-tight group-hover:text-accent transition-colors">
                                        <a href={`/article/${featured.slug}`}>{featured.title}</a>
                                    </h2>
                                    <p className="text-lg text-muted-foreground font-serif line-clamp-3">
                                        {featured.excerpt}
                                    </p>
                                    <div className="flex items-center text-xs font-sans text-muted-foreground gap-4 pt-2">
                                        <span className="font-bold text-primary">By {featured.author}</span>
                                        <span>{new Date(featured.publishedAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</span>
                                        <span>{featured.readTime}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="lg:col-span-4 space-y-8">
                                <h3 className="font-sans font-black text-xs tracking-widest uppercase border-b border-primary pb-2">Latest in {category.title}</h3>
                                {rest.slice(0, 3).map((item: any) => (
                                    <div key={item._id} className="group border-b border-border pb-6 last:border-0 last:pb-0">
                                        <div className="space-y-2">
                                            <h4 className="text-xl font-serif font-bold leading-snug group-hover:underline decoration-1 underline-offset-4">
                                                <a href={`/article/${item.slug}`}>{item.title}</a>
                                            </h4>
                                            <p className="text-sm text-muted-foreground line-clamp-2">{item.excerpt}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
                        {rest.slice(3).map((item: any) => (
                            <div key={item._id} className="group flex flex-col">
                                <div className="relative aspect-video overflow-hidden mb-4">
                                    <img
                                        src={item.mainImage ? urlFor(item.mainImage).width(600).height(337).url() : "/placeholder.svg"}
                                        alt={item.title}
                                        className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                                    />
                                </div>
                                <div className="flex-1 space-y-3">
                                    <h3 className="text-xl font-serif font-bold leading-tight group-hover:text-accent transition-colors">
                                        <a href={`/article/${item.slug}`}>{item.title}</a>
                                    </h3>
                                    <p className="text-sm text-muted-foreground line-clamp-3 flex-1">{item.excerpt}</p>
                                    <div className="text-[10px] font-sans font-black text-muted-foreground uppercase tracking-widest pt-2 border-t border-border/40">
                                        {new Date(item.publishedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })} | By {item.author}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    )
}
