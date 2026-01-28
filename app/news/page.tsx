"use client"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Clock } from "lucide-react"
import Image from "next/image"
import { createClient } from "@sanity/client";
import imageUrlBuilder from "@sanity/image-url";
import { useEffect, useState } from "react";

const client = createClient({
  projectId: "m0ua7htu",
  dataset: "production",
  apiVersion: "2023-10-01",
  useCdn: true,
});

const builder = imageUrlBuilder(client);

function urlFor(source) {
  return builder.image(source);
}

const newsArticles = [
  {
    id: 1,
    title: "Breaking: International Summit Addresses Global Security Concerns",
    excerpt:
      "World leaders convene to discuss pressing security challenges and forge new international cooperation frameworks...",
    category: "Politics",
    author: "Michael Torres",
    date: "Jan 12, 2026",
    readTime: "6 min read",
    image: "/international-summit.jpg",
    featured: true,
  },
  {
    id: 2,
    title: "New Study Reveals Impact of Social Media on Mental Health",
    excerpt:
      "Comprehensive research spanning five years provides insights into the psychological effects of digital connectivity...",
    category: "Health",
    author: "Dr. Amanda Chen",
    date: "Jan 12, 2026",
    readTime: "8 min read",
    image: "/mental-health-research.png",
  },
  {
    id: 3,
    title: "Cities Worldwide Embrace Smart Infrastructure",
    excerpt:
      "Urban centers implement cutting-edge technology to improve efficiency and sustainability for growing populations...",
    category: "Technology",
    author: "Robert Kim",
    date: "Jan 11, 2026",
    readTime: "5 min read",
    image: "/smart-city-technology.png",
  },
  {
    id: 4,
    title: "Olympic Committee Announces New Sporting Events for 2028",
    excerpt: "Exciting additions to the Olympic program reflect changing global interests in competitive athletics...",
    category: "Sports",
    author: "Jessica Martin",
    date: "Jan 11, 2026",
    readTime: "4 min read",
    image: "/olympic-sports.jpg",
  },
  {
    id: 5,
    title: "Breakthrough in Sustainable Agriculture Technology",
    excerpt:
      "Innovative farming methods promise to revolutionize food production while reducing environmental impact...",
    category: "Science",
    author: "Daniel Green",
    date: "Jan 10, 2026",
    readTime: "7 min read",
    image: "/agriculture-technology.png",
  },
  {
    id: 6,
    title: "Film Industry Embraces Virtual Production Techniques",
    excerpt: "Major studios adopt new technology that transforms how movies and TV shows are created and produced...",
    category: "Entertainment",
    author: "Sophie Anderson",
    date: "Jan 10, 2026",
    readTime: "5 min read",
    image: "/film-production-set.png",
  },
  {
    id: 7,
    title: "Economic Forecast Predicts Strong Growth in Emerging Markets",
    excerpt:
      "Financial analysts project significant expansion as developing nations capitalize on technological advances...",
    category: "Business",
    author: "William Chang",
    date: "Jan 9, 2026",
    readTime: "6 min read",
    image: "/business-growth-chart.png",
  },
  {
    id: 8,
    title: "Conservation Efforts Show Positive Results for Endangered Species",
    excerpt:
      "Wildlife protection programs demonstrate measurable success in preserving biodiversity across multiple regions...",
    category: "Environment",
    author: "Emily Parker",
    date: "Jan 9, 2026",
    readTime: "5 min read",
    image: "/wildlife-conservation-mosaic.png",
  },
]

export default function NewsPage() {
  const [newsArticles, setNewsArticles] = useState([]);
  const [visibleArticles, setVisibleArticles] = useState(6);

  useEffect(() => {
    async function fetchNews() {
      const query = `*[_type == "newsItem"] | order(publishedAt desc) {
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

      const articles = await client.fetch(query);
      setNewsArticles(articles);
    }

    fetchNews();
  }, []);

  const featuredArticle = newsArticles.find((article) => article.trending);
  const regularArticles = newsArticles

  const loadMoreArticles = () => {
    setVisibleArticles((prev) => prev + 6);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <section className="container mx-auto px-4 py-8 md:py-12">
          <h1 className="text-3xl md:text-5xl font-bold mb-8">All News</h1>

          {featuredArticle && (
            <Card className="group overflow-hidden cursor-pointer hover:shadow-lg transition-shadow mb-12">
              <div className="grid md:grid-cols-2 gap-0">
                <div className="relative aspect-video md:aspect-auto overflow-hidden">
                  <Image
                    src={urlFor(featuredArticle.image).url() || "/placeholder.svg"}
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
                    src={urlFor(article.image).url() || "/placeholder.svg"}
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
            {visibleArticles < regularArticles.length ? (
              <Button size="lg" onClick={loadMoreArticles}>
                Load More News
              </Button>
            ) : (
              <Button size="lg" disabled>
                All News Loaded
              </Button>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
