"use client"
import { Header } from "@/components/Header"
import { Footer } from "@/components/Footer"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Clock } from "lucide-react"
import Image from "next/image"
import { createClient, type SanityDocument } from "@sanity/client";
import imageUrlBuilder from "@sanity/image-url";
import { useEffect, useState } from "react";

const client = createClient({
  projectId: "m0ua7htu",
  dataset: "production",
  apiVersion: "2023-10-01",
  useCdn: true,
});

const builder = imageUrlBuilder(client);

function urlFor(source: any) {
  return builder.image(source);
}

interface NewsArticle {
  _id: string;
  title: string;
  excerpt: string;
  category: string;
  author: string;
  publishedAt: string;
  readTime: string;
  image: string;
  trending?: boolean;
}

export default function NewsPage() {
  const [newsArticles, setNewsArticles] = useState<NewsArticle[]>([]);
  const [visibleArticles, setVisibleArticles] = useState(6);
  const [selectedCategory, setSelectedCategory] = useState("all");

  useEffect(() => {
    async function fetchNews() {
      const query = `*[_type == "newsItem" ${selectedCategory !== "all" ? "&& references(*[_type == \"category\" && title == $selectedCategory]._id)" : ""}] | order(publishedAt desc) {
        _id,
        title,
        excerpt,
        "category": categories[0]->title,
        "author": author->name,
        publishedAt,
        readTime,
        "image": mainImage.asset->url,
        trending
      }`;

      const articles = await client.fetch(query, { selectedCategory });
      setNewsArticles(articles);
    }

    fetchNews();
  }, [selectedCategory]);

  const featuredArticle = newsArticles.find((article) => article.trending);
  const regularArticles = newsArticles.filter((article) => article._id !== featuredArticle?._id);

  const loadMoreArticles = () => {
    setVisibleArticles((prev) => prev + 6);
  };

  const handleCategoryChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCategory(event.target.value);
    setVisibleArticles(6); // Reset visible articles when category changes
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <section className="container mx-auto px-4 py-8 md:py-12">
          <div className="flex justify-between">
            <h1 className="text-3xl md:text-5xl font-bold mb-8">All News</h1>

            <div className="mb-6">
              <label htmlFor="category-filter" className="block text-sm font-medium text-gray-700">
                Filter by Category
              </label>
              <select
                id="category-filter"
                value={selectedCategory}
                onChange={handleCategoryChange}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              >
                <option value="all">All Categories</option>
                {/* Add more categories dynamically */}
                {[...new Set(newsArticles.map((article) => article.category))].map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {featuredArticle && (
            <Card className="group overflow-hidden cursor-pointer hover:shadow-lg transition-shadow mb-12">
              <div className="grid md:grid-cols-2 gap-0">
                <div className="relative aspect-video md:aspect-auto overflow-hidden">
                  <Image
                    src={featuredArticle.image ? urlFor(featuredArticle.image).url() : "/placeholder.svg"}
                    alt={featuredArticle.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-8 flex flex-col justify-center">
                  <Badge variant="secondary" className="w-fit mb-4">
                    {featuredArticle.category}
                  </Badge>
                  <h2 className="text-2xl md:text-3xl font-bold mb-4 group-hover:text-primary transition-colors leading-tight">
                    {featuredArticle.title}
                  </h2>
                  <p className="text-muted-foreground mb-6 leading-relaxed">{featuredArticle.excerpt}</p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {new Date(featuredArticle.publishedAt).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {featuredArticle.readTime}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {regularArticles.slice(0, visibleArticles).map((article) => (
              <Card
                key={article._id}
                className="group overflow-hidden cursor-pointer hover:shadow-lg transition-shadow flex flex-col"
              >
                <div className="relative aspect-video overflow-hidden">
                  <Image
                    src={article.image ? urlFor(article.image).url() : "/placeholder.svg"}
                    alt={article.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-5 flex flex-col flex-1">
                  <Badge variant="secondary" className="w-fit mb-3">
                    {article.category}
                  </Badge>
                  <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors leading-tight line-clamp-2">
                    {article.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4 leading-relaxed line-clamp-3 flex-1">
                    {article.excerpt}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground pt-4 border-t">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(article.publishedAt).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {article.readTime}
                    </span>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <div className="mt-10 text-center">
            {visibleArticles < regularArticles.length && (
              <Button size="lg" onClick={loadMoreArticles}>
                Load More News
              </Button>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
