
import Link from "next/link"
import { client } from "@/sanity/lib/client"
import Image from "next/image"
import { urlFor } from "@/sanity/lib/image"
import { Header } from "@/components/Header"
import { Footer } from "@/components/Footer"

export const revalidate = 300

interface AuthorItem {
  _id: string
  name: string
  slug?: string
  role?: string
  photo?: any
}

async function getAuthors() {
  const query = `*[_type == "author"] | order(name asc) {
    _id,
    name,
    role,
    photo,
    "slug": slug.current
  }`
  return client.fetch<AuthorItem[]>(query)
}

export default async function AuthorsPage() {
  const authors = await getAuthors()

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <section className="container mx-auto px-4 pt-10 pb-6">
          <h1 className="text-4xl md:text-5xl font-serif font-bold">Authors</h1>
          <p className="text-muted-foreground mt-2 max-w-2xl">
            Meet the journalists and contributors behind the coverage.
          </p>
        </section>
        <section className="container mx-auto px-4 pb-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {authors.map((author) => (
              <Link
                key={author._id}
                href={author.slug ? `/authors/${author.slug}` : "/authors"}
                className="flex items-center gap-4 border border-border rounded-lg p-4 hover:border-accent transition-colors"
              >
                <div className="relative h-14 w-14 rounded-full overflow-hidden bg-muted">
                  {author.photo && (
                    <Image
                      src={urlFor(author.photo).width(160).height(160).url()}
                      alt={author.name}
                      fill
                      className="object-cover"
                    />
                  )}
                </div>
                <div>
                  <div className="font-semibold">{author.name}</div>
                  {author.role && <div className="text-sm text-muted-foreground">{author.role}</div>}
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
