import Link from "next/link"
import { Facebook, Twitter, Youtube, Instagram } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-card border-t">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
             <Link href="/" className="flex flex-col items-start gap-1">
            <span className="text-2xl font-bold text-primary">The Narrative Network</span>
            <span className="text-sm text-muted-foreground">Redefining Africa's Narrative</span>
          </Link>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Your trusted source for live news streaming and in-depth reporting on global events.
            </p>
          </div>

          <div>
            <h4 className="font-bold mb-4">Company</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/about" className="text-muted-foreground hover:text-foreground transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-muted-foreground hover:text-foreground transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/newsletter" className="text-muted-foreground hover:text-foreground transition-colors">
                  Newsletter
                </Link>
              </li>
              <li>
                <Link href="/careers" className="text-muted-foreground hover:text-foreground transition-colors">
                  Careers
                </Link>
              </li>
              <li>
                <Link href="/advertise" className="text-muted-foreground hover:text-foreground transition-colors">
                  Advertise
                </Link>
              </li>
              <li>
                <Link href="/topics" className="text-muted-foreground hover:text-foreground transition-colors">
                  Topics
                </Link>
              </li>
              <li>
                <Link href="/authors" className="text-muted-foreground hover:text-foreground transition-colors">
                  Authors
                </Link>
              </li>
              <li>
                <Link href="/rss" className="text-muted-foreground hover:text-foreground transition-colors">
                  RSS
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4">Follow Us</h4>
            <div className="flex gap-3">
              <Link
                href="#"
                className="h-9 w-9 flex items-center justify-center rounded-md border hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                <Facebook className="h-4 w-4" />
              </Link>
              <Link
                href="#"
                className="h-9 w-9 flex items-center justify-center rounded-md border hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                <Twitter className="h-4 w-4" />
              </Link>
              <Link
                href="#"
                className="h-9 w-9 flex items-center justify-center rounded-md border hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                <Youtube className="h-4 w-4" />
              </Link>
              <Link
                href="#"
                className="h-9 w-9 flex items-center justify-center rounded-md border hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                <Instagram className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t text-center text-sm text-muted-foreground">
          <p>&copy; 2026 NewsStream. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
