/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  // Load the Desk's database driver from node_modules as-is instead of bundling it
  serverExternalPackages: ["pg"],
  images: {
    unoptimized: true,
  },
  // The Editorial Desk is private: never indexed, cached, framed or sent as a referrer
  async headers() {
    return [
      {
        source: "/desk/:path*",
        headers: [
          { key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" },
          { key: "Cache-Control", value: "private, no-store" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "same-origin" },
          { key: "X-Content-Type-Options", value: "nosniff" },
        ],
      },
      { source: "/desk", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" }, { key: "Cache-Control", value: "private, no-store" }, { key: "X-Frame-Options", value: "DENY" }] },
    ]
  },
  // Addresses from the previous site design. 301 rather than 308: Bing asks for 301 on permanent moves.
  async redirects() {
    return [
      { source: "/article/:slug", destination: "/news/:slug", statusCode: 301 },
      { source: "/news", destination: "/latest", statusCode: 301 },
      { source: "/categories", destination: "/latest", statusCode: 301 },
      { source: "/categories/:slug", destination: "/category/:slug", statusCode: 301 },
      { source: "/category", destination: "/latest", statusCode: 301 },
      { source: "/business", destination: "/category/business", statusCode: 301 },
      { source: "/tech", destination: "/latest", statusCode: 301 },
      { source: "/advertise", destination: "/partnerships", statusCode: 301 },
      { source: "/privacy-policy", destination: "/privacy", statusCode: 301 },
      { source: "/login", destination: "/write/login", statusCode: 301 },
      // Earlier section addresses, one hop straight to the current section page. Breaking news is
      // now a label on stories, not a section.
      { source: "/category/politics-governance", destination: "/category/politics", statusCode: 301 },
      { source: "/category/politics-and-governance", destination: "/category/politics", statusCode: 301 },
      { source: "/category/business-economy", destination: "/category/business", statusCode: 301 },
      { source: "/category/business-and-economy", destination: "/category/business", statusCode: 301 },
      { source: "/category/health-and-education", destination: "/category/health-education", statusCode: 301 },
      { source: "/category/community-society", destination: "/category/community", statusCode: 301 },
      { source: "/category/community-and-society", destination: "/category/community", statusCode: 301 },
      { source: "/category/social-community-affairs", destination: "/category/community", statusCode: 301 },
      { source: "/category/social-and-community-affairs", destination: "/category/community", statusCode: 301 },
      { source: "/category/sports-culture", destination: "/category/sport-culture", statusCode: 301 },
      { source: "/category/sports-and-culture", destination: "/category/sport-culture", statusCode: 301 },
      { source: "/category/sports-entertainment", destination: "/category/sport-culture", statusCode: 301 },
      { source: "/category/sports-and-entertainment", destination: "/category/sport-culture", statusCode: 301 },
      { source: "/category/entertainment-lifestyle", destination: "/category/entertainment", statusCode: 301 },
      { source: "/category/entertainment-and-lifestyle", destination: "/category/entertainment", statusCode: 301 },
      { source: "/category/creative-cultural-industries", destination: "/category/entertainment", statusCode: 301 },
      { source: "/category/creative-and-cultural-industries", destination: "/category/entertainment", statusCode: 301 },
      { source: "/category/breaking-news", destination: "/latest", statusCode: 301 },
    ]
  },
  experimental: {
    // Writers upload a main photo (up to 10 MB) with their story
    serverActions: {
      bodySizeLimit: "12mb",
    },
  },
}

export default nextConfig
