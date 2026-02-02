import { Header } from "@/components/Header"
import { Footer } from "@/components/Footer"

interface PageShellProps {
  title: string
  description?: string
  children?: React.ReactNode
}

export function PageShell({ title, description, children }: PageShellProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <section className="container mx-auto px-4 pt-10 pb-6">
          <h1 className="text-4xl md:text-5xl font-serif font-bold">{title}</h1>
          {description && <p className="text-muted-foreground mt-2 max-w-2xl">{description}</p>}
        </section>
        <section className="container mx-auto px-4 pb-16">{children}</section>
      </main>
      <Footer />
    </div>
  )
}
