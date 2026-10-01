import type { NextConfig } from "next";

// STATIC_EXPORT=1 builds a plain static site in ./out (used by the GitHub Pages workflow).
// NEXT_PUBLIC_BASE_PATH is the sub-path the site is served from, e.g. "/portfolio".
const isExport = !!process.env.STATIC_EXPORT;
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

const nextConfig: NextConfig = {
  ...(isExport ? { output: "export" as const, trailingSlash: true } : {}),
  basePath: basePath || undefined,
  images: {
    unoptimized: isExport,
    remotePatterns: [
      { protocol: "https", hostname: "img.youtube.com" },
      { protocol: "https", hostname: "i.ytimg.com" },
      { protocol: "https", hostname: "cdn.sanity.io" },
    ],
  },
  transpilePackages: ["three"],
};

export default nextConfig;
