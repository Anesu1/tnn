/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  experimental: {
    // Writers upload a main photo (up to 10 MB) with their story
    serverActions: {
      bodySizeLimit: "12mb",
    },
  },
}

export default nextConfig
