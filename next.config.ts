import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["*.trycloudflare.com"],
  serverExternalPackages: [
    "@prisma/adapter-neon",
    "@prisma/adapter-pg",
    "@neondatabase/serverless",
    "ws",
  ],
  async headers() {
    return [
      { source: '/sw.js', headers: [{ key: 'Cache-Control', value: 'no-store' }] },
      { source: '/reset-local-cache.html', headers: [{ key: 'Cache-Control', value: 'no-store' }] },
    ];
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      // Neon object storage (S3-compatible) public URLs.
      { protocol: "https", hostname: "**.neon.tech" },
    ],
  },
  experimental: {
    proxyClientMaxBodySize: '101mb',
    optimizePackageImports: ["@phosphor-icons/react"],
    turbopackFileSystemCacheForDev: false,
  },
};

export default nextConfig;
