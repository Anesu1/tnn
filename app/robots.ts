import type { MetadataRoute } from "next"

import { SITE_URL } from "@/lib/site/config"

// Keep the Studio, writer portal, Desk and internal routes out of search engines. /graphic/ stays
// crawlable: it serves the share images for stories without a photo.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/studio", "/write", "/desk", "/api/", "/__forms.html"] },
    sitemap: [`${SITE_URL}/sitemap.xml`, `${SITE_URL}/news-sitemap.xml`],
  }
}
