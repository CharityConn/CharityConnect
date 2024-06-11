import mdx from "@next/mdx"

import "./lib/env.mjs"

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
    mdxRs: true,
  },
  webpack: (config) => {
    config.resolve.fallback = { fs: false, net: false, tls: false }
    config.externals.push("pino-pretty", "lokijs", "encoding")
    return config
  },
  rewrites: async () => {
    return [
      {
        source: "/SmartCat",
        destination: "/smartcat",
      },
    ]
  },
}

const withMDX = mdx()
export default withMDX(nextConfig)
