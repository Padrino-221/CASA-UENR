import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["*.trycloudflare.com"],
  serverExternalPackages: [
    "@prisma/adapter-neon",
    "@prisma/adapter-pg",
    "@neondatabase/serverless",
    "ws",
  ],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      // Neon object storage (S3-compatible) public URLs.
      { protocol: "https", hostname: "**.neon.tech" },
    ],
  },
  experimental: {
    optimizePackageImports: ["@phosphor-icons/react"],
    turbopackFileSystemCacheForDev: false,
  },
};

export default nextConfig;
