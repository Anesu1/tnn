import type { MetadataRoute } from "next"

import { SITE_URL } from "@/lib/site/config"

// Keep the Studio, writer portal and internal routes out of search engines
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/studio", "/write", "/desk", "/graphic/", "/__forms.html"] },
    sitemap: [`${SITE_URL}/sitemap.xml`, `${SITE_URL}/news-sitemap.xml`],
  }
}
