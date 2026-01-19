import { notFound } from "next/navigation"
import { HeroSection } from "@/components/ui/hero-section"
import NewsInfo from "@/components/news/news-info"
import NewsInfoTwo from "@/components/news/news-info-two"
import NewsInfoThree from "@/components/news/news-three"
import NewsInfoFour from "@/components/news/news-info-four"
import NewsLast from "@/components/news/news-last"
import { ShareSection } from "@/components/news/share-section"
import { client } from "@/sanity/lib/client"
import { urlFor } from "@/sanity/lib/image"

// Fetch news item from Sanity
async function getNewsItem(slug: string) {
  return await client.fetch(
    `*[_type == "newsItem" && slug.current == $slug][0]{
      title,
      slug,
      publishedAt,
      readTime,
      mainImage,
      excerpt,
      content,
      "author": author->name,
      sectionOne {
        text,
        images
      },
      sectionTwo {
        heading,
        text,
        images
      },
      sectionThree {
        heading,
        text,
        images
      },
      sectionFour {
        heading,
        text,
        images
      },
      conclusion {
        heading,
        text
      },
      conclusionImage
    }`,
    { slug },
  )
}

export default async function NewsItemPage({ params }: { params: { slug: string } }) {
  const newsItem = await getNewsItem(params.slug)

  if (!newsItem) {
    notFound()
  }

  // Format the date
  const formattedDate = newsItem.publishedAt
    ? new Date(newsItem.publishedAt).toLocaleDateString("en-US", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : ""

  const mainImageUrl = newsItem.mainImage ? urlFor(newsItem.mainImage).url() : "/images/testing12.webp"

  // Process section images
  const sectionOneImages =
    newsItem.sectionOne?.images?.map((img) => ({
      src: urlFor(img).url(),
      alt: img.alt || "News image",
    })) || []

  const sectionTwoImages =
    newsItem.sectionTwo?.images?.map((img) => ({
      src: urlFor(img).url(),
      alt: img.alt || "News image",
    })) || []

  const sectionThreeImages =
    newsItem.sectionThree?.images?.map((img) => ({
      src: urlFor(img).url(),
      alt: img.alt || "News image",
    })) || []

  const sectionFourImages =
    newsItem.sectionFour?.images?.map((img) => ({
      src: urlFor(img).url(),
      alt: img.alt || "News image",
    })) || []

  const conclusionImage = newsItem.conclusionImage ? urlFor(newsItem.conclusionImage).url() : ""
    
  return (
    <main>
      <HeroSection
        backgroundImage={mainImageUrl}
        backgroundAlt={newsItem.mainImage?.alt || "Filmmakers silhouette at sunset"}
        heading={newsItem.title}
        subheading={newsItem.excerpt || "This is a detailed view of the news item."}
        textPosition="bottom-left"
        height="h-[60vh] md:h-[70vh] lg:h-[100vh]"
      />
      <NewsInfo
        content={newsItem.sectionOne?.text}
        images={sectionOneImages}
      />
     
        <NewsInfoTwo
          heading={newsItem.sectionTwo.heading}
          content={newsItem.sectionTwo.text}
          images={sectionTwoImages}
        />
     
        <NewsInfoThree
          heading={newsItem.sectionThree.heading}
          content={newsItem.sectionThree.text}
          images={sectionThreeImages}
        />
      
      
        <NewsInfoFour
          heading={newsItem.sectionFour.heading}
          content={newsItem.sectionFour.text}
          images={sectionFourImages}
        />
     
    
        <NewsLast 
        heading={newsItem.conclusion.heading}
         content={newsItem.conclusion.text}
         imageAlt={newsItem.conclusionImage.alt}
          imageUrl={conclusionImage} />
     
      <ShareSection />
    </main>
  )
}
