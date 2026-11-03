/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
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
