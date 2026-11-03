import { WHATSAPP_URL } from "@/lib/site/config"
import { MainNav } from "./main-nav"
import { SocialLinks } from "./social-links"
import { Icon } from "./icons"

// Header, footer and shared bands of the public site, matching the reference markup.
// Plain <a> links (full page loads) are deliberate: /assets/site.js wires up each page on load.

export function Logo() {
  return (
    <svg
      className="logo"
      viewBox="304 388 592 301"
      role="img"
      aria-label="The Narrative Network"
      xmlns="http://www.w3.org/2000/svg"
    >
      <image href="/tnn-official-logo.png" width="1200" height="1200" />
    </svg>
  )
}

const SUB_NAV = [
  { href: "/region/zimbabwe", label: "Zimbabwe" },
  { href: "/region/africa", label: "Africa" },
  { href: "/region/world", label: "World" },
  { href: "/about", label: "About" },
  { href: "/partnerships", label: "Advertise & partner" },
  { href: "/contact", label: "Contact" },
]

const FOOTER_NAV = [
  { href: "/about", label: "About TNN" },
  { href: "/editorial-standards", label: "Editorial standards" },
  { href: "/corrections", label: "Corrections" },
  { href: "/contact", label: "Contact" },
  { href: "/partnerships", label: "Partnerships" },
  { href: "/media-kit", label: "Media kit" },
  { href: "/newsletter", label: "Newsletter" },
  { href: "/privacy", label: "Privacy" },
  { href: "/feed.xml", label: "RSS" },
]

export function SiteHeader() {
  return (
    <>
      <a className="skip" href="#content">
        Skip to content
      </a>
      <div className="utility">
        <div className="wrap">
          <span>ZIMBABWE · AFRICA · THE WORLD</span>
          <span>INDEPENDENT PERSPECTIVES. MEANINGFUL CONVERSATIONS.</span>
        </div>
      </div>
      <header className="wrap">
        <div className="mast">
          <a href="/" aria-label="The Narrative Network home">
            <Logo />
          </a>
          <span className="tagline">Shaping Africa’s Story, One Voice at a Time.</span>
          <a className="button" data-event="follow_whatsapp" href={WHATSAPP_URL} target="_blank" rel="noopener">
            Follow TNN
            <Icon name="arrow-up-right" />
          </a>
        </div>
        <MainNav />
        <nav className="subnav" aria-label="TNN information">
          {SUB_NAV.map((item) => (
            <a key={item.href} href={item.href}>
              {item.label}
            </a>
          ))}
        </nav>
      </header>
    </>
  )
}

export function SiteFooter() {
  return (
    <footer>
      <div className="wrap">
        <div className="footrow">
          <div>
            <a href="/" aria-label="The Narrative Network home">
              <Logo />
            </a>
            <p>
              Shaping Africa’s Story, One Voice at a Time.
              <br />
              Zimbabwe rooted. Africa focused.
            </p>
          </div>
          <nav className="footlinks" aria-label="Footer">
            {FOOTER_NAV.map((item) => (
              <a key={item.href} href={item.href}>
                {item.label}
              </a>
            ))}
          </nav>
        </div>
        <SocialLinks />
        <div className="copyright">
          © {new Date().getFullYear()} The Narrative Network ·{" "}
          <a href="/editorial-standards">Accuracy, context and accountability</a>
        </div>
      </div>
    </footer>
  )
}

export function FollowBand() {
  return (
    <section className="follow-band">
      <div>
        <h2>Stay with the story.</h2>
        <p>Follow TNN on WhatsApp for updates, or register your interest in our email briefing.</p>
      </div>
      <div className="actions">
        <a className="button" data-event="follow_whatsapp" href={WHATSAPP_URL} target="_blank" rel="noopener">
          Follow on WhatsApp
          <Icon name="arrow-up-right" />
        </a>
        <a className="button" href="/newsletter">
          <Icon name="mail" />
          Email briefing
        </a>
      </div>
    </section>
  )
}

export function PageTitle({ label, title, intro }: { label?: string; title: string; intro?: string }) {
  return (
    <div className="page-title">
      {label && <span className="label">{label}</span>}
      <h1>{title}</h1>
      {intro && <p className="intro">{intro}</p>}
    </div>
  )
}
