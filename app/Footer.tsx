import Link from "next/link"
import { Facebook, Twitter, Youtube, Instagram } from "lucide-react"
import { FaWhatsapp } from "react-icons/fa"

export default function Footer() {
  const categories = [
    { name: "Breaking News", slug: "breaking-news" },
    { name: "Politics & Governance", slug: "politics-governance" },
    { name: "Business & Economy", slug: "business-economy" },
    { name: "Social & Community Affairs", slug: "social-community-affairs" },
    { name: "Creative & Cultural Industries", slug: "creative-cultural-industries" },
    { name: "Sports & Entertainment", slug: "sports-entertainment" },
  ]

  const year = new Date().getFullYear();

  return (
    <footer className="bg-card border-t mt-12">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 mb-12">
          <div className="space-y-6">
            <Link href="/" className="inline-block">
              <h2 className="text-3xl font-serif  font-black tracking-tighter leading-none text-foreground ">
                The Narrative Network
              </h2>
              <p>Redefining Africa's Narrative</p>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
              Delivering accurate, timely, and independent news coverage from around the globe. Redefining how you experience the world's most important stories.
            </p>
            <div className="flex gap-4">
              <Link href="https://www.facebook.com/thenarrativenetwork" className="h-9 w-9 flex items-center justify-center rounded-none border border-border hover:bg-accent hover:text-white transition-all"><Facebook className="h-4 w-4" /></Link>
              {/* <Link href="#" className="h-9 w-9 flex items-center justify-center rounded-none border border-border hover:bg-accent hover:text-white transition-all"><Twitter className="h-4 w-4" /></Link> */}
              <Link href="https://www.youtube.com/@TheNarrativeNetwork-t9c" className="h-9 w-9 flex items-center justify-center rounded-none border border-border hover:bg-accent hover:text-white transition-all"><Youtube className="h-4 w-4" /></Link>
              <Link href="https://www.instagram.com/the.narrative.network/" className="h-9 w-9 flex items-center justify-center rounded-none border border-border hover:bg-accent hover:text-white transition-all"><Instagram className="h-4 w-4" /></Link>
              <Link href="https://whatsapp.com/channel/0029VbCHiM5EquiT4lGKOy2L" className="h-9 w-9 flex items-center justify-center rounded-none border border-border hover:bg-accent hover:text-white transition-all"><FaWhatsapp className="h-4 w-4" /></Link>
              
            </div>
          </div>

          <div>
            <h4 className="font-sans font-black text-xs tracking-[0.2em] uppercase mb-8 text-foreground pb-2 border-b border-border">Sections</h4>
            <ul className="grid grid-cols-1 lg:grid-cols-2 gap-y-3 gap-x-4 text-xs font-bold tracking-tight">
              <li>
                <Link href="/category" className="text-muted-foreground hover:text-accent transition-colors uppercase">
                  All Categories
                </Link>
              </li>
              {categories.map((cat) => (
                <li key={cat.slug}>
                  <Link href={`/category/${cat.slug}`} className="text-muted-foreground hover:text-accent transition-colors uppercase">
                    {cat.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/contact" className="text-muted-foreground hover:text-accent transition-colors uppercase">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* <div>
            <h4 className="font-sans font-black text-xs tracking-[0.2em] uppercase mb-8 text-foreground pb-2 border-b border-border">Company</h4>
            <ul className="space-y-4 text-xs font-bold tracking-tight uppercase">
              <li><Link href="/about" className="text-muted-foreground hover:text-accent transition-colors">About Us</Link></li>
              <li><Link href="/contact" className="text-muted-foreground hover:text-accent transition-colors">Contact</Link></li>
              <li><Link href="/careers" className="text-muted-foreground hover:text-accent transition-colors">Careers</Link></li>
              <li><Link href="/advertise" className="text-muted-foreground hover:text-accent transition-colors">Advertise</Link></li>
            </ul>
          </div> */}

          <div>
            <h4 className="font-sans font-black text-xs tracking-[0.2em] uppercase mb-8 text-foreground pb-2 border-b border-border">Newsletter</h4>
            <p className="text-xs text-muted-foreground mb-6 leading-relaxed font-medium">
              Join 50,000+ subscribers for the morning brief.
            </p>
            <div className="flex flex-col space-y-2">
              <input
                className="bg-secondary/20 border border-border px-3 py-2.5 text-xs w-full focus:outline-none focus:ring-1 focus:ring-accent rounded-none transition-all"
                placeholder="EMAIL ADDRESS"
              />
              <button className="bg-primary text-primary-foreground px-4 py-2.5 text-[10px] font-black tracking-[0.2em] hover:bg-primary/90 transition-all uppercase">SUBSCRIBE</button>
            </div>
          </div>
        </div>

        <div className="pt-10 border-t border-border/40 flex flex-col md:flex-row justify-between items-center gap-6 text-[10px] font-sans font-black text-muted-foreground uppercase tracking-[0.2em]">
          <p>&copy; {year} The Narrative Network. All rights reserved.</p>
          <div className="flex gap-8">
            <Link href="/privacy-policy" className="hover:text-foreground transition-colors">Privacy Policy</Link>
            <Link href="/terms-of-service" className="hover:text-foreground transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
