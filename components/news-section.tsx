import Link from "next/link"
import { Globe, Briefcase, Cpu, Landmark } from "lucide-react"

export function NewsSection() {
  return (
    <section className="bg-card py-12">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl font-extrabold text-center mb-8">Latest News</h2>
        <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 text-sm">
          <li className="flex flex-col items-center text-center">
            <div className="bg-primary text-primary-foreground p-4 rounded-full mb-4">
              <Globe className="h-6 w-6" />
            </div>
            <Link href="/world" className="font-medium text-foreground hover:text-primary transition-colors">
              World
            </Link>
          </li>
          <li className="flex flex-col items-center text-center">
            <div className="bg-primary text-primary-foreground p-4 rounded-full mb-4">
              <Landmark className="h-6 w-6" />
            </div>
            <Link href="/politics" className="font-medium text-foreground hover:text-primary transition-colors">
              Politics
            </Link>
          </li>
          <li className="flex flex-col items-center text-center">
            <div className="bg-primary text-primary-foreground p-4 rounded-full mb-4">
              <Briefcase className="h-6 w-6" />
            </div>
            <Link href="/business" className="font-medium text-foreground hover:text-primary transition-colors">
              Business
            </Link>
          </li>
          <li className="flex flex-col items-center text-center">
            <div className="bg-primary text-primary-foreground p-4 rounded-full mb-4">
              <Cpu className="h-6 w-6" />
            </div>
            <Link href="/technology" className="font-medium text-foreground hover:text-primary transition-colors">
              Technology
            </Link>
          </li>
        </ul>
      </div>
    </section>
  )
}