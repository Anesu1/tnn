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
  // Addresses from the previous site design
  async redirects() {
    return [
      { source: "/article/:slug", destination: "/news/:slug", permanent: true },
      { source: "/news", destination: "/latest", permanent: true },
      { source: "/categories", destination: "/latest", permanent: true },
      { source: "/categories/:slug", destination: "/category/:slug", permanent: true },
      { source: "/category", destination: "/latest", permanent: true },
      { source: "/business", destination: "/category/business", permanent: true },
      { source: "/tech", destination: "/latest", permanent: true },
      { source: "/advertise", destination: "/partnerships", permanent: true },
      { source: "/privacy-policy", destination: "/privacy", permanent: true },
      { source: "/terms-of-service", destination: "/privacy", permanent: true },
      { source: "/login", destination: "/write/login", permanent: true },
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
