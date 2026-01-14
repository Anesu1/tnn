import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card } from "@/components/ui/card"
import { Globe, Briefcase, Cpu, Heart, Lightbulb, TrendingUp, Users, Newspaper } from "lucide-react"
import Link from "next/link"

const categories = [
  {
    id: "world",
    name: "World",
    description: "International news and global affairs",
    icon: Globe,
    articleCount: 234,
    color: "text-blue-500",
  },
  {
    id: "business",
    name: "Business",
    description: "Markets, finance, and economy",
    icon: Briefcase,
    articleCount: 189,
    color: "text-green-500",
  },
  {
    id: "technology",
    name: "Technology",
    description: "Tech innovations and digital trends",
    icon: Cpu,
    articleCount: 312,
    color: "text-purple-500",
  },
  {
    id: "health",
    name: "Health",
    description: "Medical news and wellness",
    icon: Heart,
    articleCount: 156,
    color: "text-red-500",
  },
  {
    id: "science",
    name: "Science",
    description: "Research, discoveries, and innovation",
    icon: Lightbulb,
    articleCount: 198,
    color: "text-yellow-500",
  },
  {
    id: "politics",
    name: "Politics",
    description: "Government and policy news",
    icon: Users,
    articleCount: 267,
    color: "text-indigo-500",
  },
  {
    id: "entertainment",
    name: "Entertainment",
    description: "Movies, music, and celebrity news",
    icon: TrendingUp,
    articleCount: 421,
    color: "text-pink-500",
  },
  {
    id: "sports",
    name: "Sports",
    description: "Athletic events and competitions",
    icon: Newspaper,
    articleCount: 345,
    color: "text-orange-500",
  },
]

export default function CategoriesPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <section className="container mx-auto px-4 py-8 md:py-12">
          <div className="mb-12">
            <h1 className="text-3xl md:text-5xl font-bold mb-4">Browse by Category</h1>
            <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">
              Explore news and content organized by topic. Select a category to see the latest articles and videos.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category) => {
              const IconComponent = category.icon
              return (
                <Link key={category.id} href={`/categories/${category.id}`}>
                  <Card className="group h-full p-6 cursor-pointer hover:shadow-lg transition-all hover:border-primary">
                    <div className="flex flex-col items-center text-center">
                      <div
                        className={`h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4 group-hover:scale-110 transition-transform ${category.color}`}
                      >
                        <IconComponent className="h-8 w-8" />
                      </div>
                      <h3 className="font-bold text-xl mb-2 group-hover:text-primary transition-colors">
                        {category.name}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-3 leading-relaxed">{category.description}</p>
                      <p className="text-xs text-muted-foreground font-medium">{category.articleCount} articles</p>
                    </div>
                  </Card>
                </Link>
              )
            })}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
