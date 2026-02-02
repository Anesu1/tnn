
import { Footer } from "@/components/Footer"
import { Header } from "@/components/Header"
import { Skeleton } from "@/components/ui/skeleton"

export default function CategoryLoading() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <section className="container mx-auto px-4 pt-10 pb-6">
          <Skeleton className="h-12 w-48" />
          <Skeleton className="mt-3 h-5 w-96 max-w-full" />
        </section>

        <section className="container mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 border-b border-border pb-12">
          <div className="lg:col-span-8 space-y-4">
            <Skeleton className="aspect-video w-full" />
            <Skeleton className="h-8 w-2/3" />
            <Skeleton className="h-5 w-3/4" />
          </div>
          <div className="lg:col-span-4 space-y-6 lg:border-l lg:border-border lg:pl-8">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        </section>

        <section className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="space-y-3">
                <Skeleton className="aspect-video w-full" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
