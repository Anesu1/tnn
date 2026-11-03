import { FaFacebook, FaInstagram, FaLinkedin, FaWhatsapp, FaYoutube } from "react-icons/fa6"

import { WHATSAPP_URL, YOUTUBE_URL } from "@/lib/site/config"
import { Icon } from "./icons"

// Official brand marks (Font Awesome brands, CC BY 4.0) in each platform's brand colour,
// inside the reference design's white .social-icon tiles
const SOCIAL = [
  { label: "YouTube", href: YOUTUBE_URL, Mark: FaYoutube, color: "#ff0033" },
  { label: "Facebook", href: "https://www.facebook.com/thenarrativenetwork", Mark: FaFacebook, color: "#0866ff" },
  { label: "Instagram", href: "https://www.instagram.com/the.narrative.network/", Mark: FaInstagram, color: "#e1306c" },
  { label: "LinkedIn", href: "https://www.linkedin.com/company/135218065/", Mark: FaLinkedin, color: "#0a66c2" },
  { label: "WhatsApp", href: WHATSAPP_URL, Mark: FaWhatsapp, color: "#25d366" },
]

export function SocialLinks() {
  return (
    <nav aria-label="TNN social media" className="social-links">
      {SOCIAL.map(({ label, href, Mark, color }) => (
        <a key={label} href={href} target="_blank" rel="noopener noreferrer">
          <span className="social-icon">
            <Mark aria-hidden="true" focusable="false" size={20} color={color} />
          </span>
          <span>{label}</span>
          <Icon name="arrow-up-right" />
        </a>
      ))}
    </nav>
  )
}
