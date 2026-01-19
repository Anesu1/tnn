import { Footer } from "@/components/footer"
import { Header } from "@/components/header"
import { NewsGrid } from "@/components/news/news-grid"
import { client } from "@/sanity/lib/client"

// Fetch all news items from Sanity
async function getNewsItems() {
  return await client.fetch(
    `*[_type == "newsItem"] | order(publishedAt desc) {
      title,
      "slug": slug.current,
      publishedAt,
      readTime,
      "imageUrl": mainImage.asset->url,
      excerpt,
      variant
    }`,
  )
}

export default async function NewsPage() {
  const newsItems = await getNewsItems()

  return (
    <>
      <Header />
      <main className="bg-[#333333] min-h-screen">
      <section className="p-[5%] h-[50vh] flex items-end">
        <h1 className="text-white text-[50px] lg:text-[80px] font-bold mb-8">News</h1>
      </section>

      {newsItems && newsItems.length > 0 ? (
        <NewsGrid items={newsItems} />
      ) : (
        <div className="flex justify-center items-center py-20">
          <div className="text-center p-8 bg-[#444444] rounded-lg max-w-md">
            <h2 className="text-white text-2xl font-semibold mb-4">No News Available</h2>
            <p className="text-gray-300">
              There are currently no news items to display. Please check back later for updates.
            </p>
          </div>
        </div>
      )}
    </main>
       <Footer />
    </>
    
  )
}
