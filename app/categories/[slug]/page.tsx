import { notFound } from "next/navigation";
import { client } from "@/sanity/lib/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

async function getCategoryNews(categorySlug: string) {
  try {
    console.log("Category slug received from params:", categorySlug);

    if (!categorySlug) {
      console.error("Category slug is missing or undefined.");
      return null;
    }

    const data = await client.fetch(
      `*[_type == "newsItem" &&
        references(*[_type == "category" && slug.current == $categorySlug]._id)
      ] | order(publishedAt desc) {
        _id,
        title,
        excerpt,
        "category": categories[0]->title,
        "author": author->name,
        publishedAt,
        readTime,
        "image": mainImage.asset->url,
        "slug": slug.current
      }`,
      { categorySlug }
    );

    console.log("Fetched data for category:", data);

    return data;
  } catch (error) {
    console.error("Error fetching category news:", error);
    return null;
  }
}

export default async function CategoryPage({ params }: { params: { slug: string } }) {
  const { slug } = params;

  const articles = await getCategoryNews(slug);

  if (!articles || articles.length === 0) {
    notFound();
  }

  return (
    <main className="py-12 md:py-16">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">Category: {slug}</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article) => (
            <Link key={article._id} href={`/news/${article.slug}`} passHref>
              <Card className="group overflow-hidden cursor-pointer hover:shadow-lg transition-shadow">
                <div className="relative aspect-video overflow-hidden">
                  <Image
                    src={article.image || "/placeholder.svg"}
                    alt={article.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <Badge className="absolute top-3 left-3 bg-accent text-accent-foreground">
                    {article.category}
                  </Badge>
                </div>
                <div className="p-4">
                  <h3 className="font-medium text-lg mb-2 group-hover:text-accent transition-colors">
                    {article.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-2">{article.excerpt}</p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>{article.readTime}</span>
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}