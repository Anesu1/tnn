import { notFound } from "next/navigation"
import { PortableText, PortableTextComponents } from "@portabletext/react"

import { client } from "@/sanity/lib/client"
import { urlFor } from "@/sanity/lib/image"
import { HeroSection } from "@/components/ui/hero-section"
import { ShareSection } from "@/components/news/share-section"
import { Header } from "@/components/Header"
import { Footer } from "@/components/Footer"


// Fetch news item from Sanity
async function getNewsItem(slug: string) {
  try {
    if (!slug) {
      console.error("Slug is undefined or null.")
      return null
    }

    console.log("Fetching news item with slug:", slug)

    const data = await client.fetch(
      `*[_type == "newsItem" && slug.current == $slug][0]{
        title,
        slug,
        publishedAt,
        readTime,
        mainImage,
        excerpt,
        content,
        "author": author->name
      }`,
      { slug }
    )

    return data
  } catch (error) {
    console.error("Error fetching news item:", error)
    return null
  }
}

interface PageProps {
  params: Promise<{ slug: string }>
}

// Define custom serializers for PortableText
const portableTextComponents: PortableTextComponents = {
  types: {
    image: ({ value }) => {
      if (!value?.asset?._ref) {
        return null
      }
      return (
        <div className="my-4">
          <img
            src={urlFor(value).url()}
            alt={value.alt || "Image"}
            className="rounded-lg mx-auto"
          />
        </div>
      )
    },
  },
}

export default async function NewsItemPage({ params }: PageProps) {
  // ✅ unwrap params
  const { slug } = await params

  console.log("Resolved slug:", slug)

  const newsItem = await getNewsItem(slug)

  if (!newsItem) {
    notFound()
  }

  const formattedDate = newsItem.publishedAt
    ? new Date(newsItem.publishedAt).toLocaleDateString("en-US", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : ""

  const mainImageUrl = newsItem.mainImage
    ? urlFor(newsItem.mainImage).url()
    : "/images/testing12.webp"

  return (
    <>
    <main>
      <Header />
      <HeroSection
        backgroundImage={mainImageUrl}
        backgroundAlt={newsItem.mainImage?.alt || "Filmmakers silhouette at sunset"}
        heading={newsItem.title}
        subheading={newsItem.excerpt || "This is a detailed view of the news item."}
        textPosition="bottom-left"
        height="h-[60vh] md:h-[70vh] lg:h-[100vh]"
      />

      <div className="prose mx-auto px-4 py-[5%] sm:px-6 md:px-[5%] space-y-5 lg:px-[15%]">
        <PortableText
          value={newsItem.content}
          components={portableTextComponents}
        />
      </div>

      <ShareSection />
    </main>
     <Footer />
    </>
    
  )
}
