const checkEnvVariables = require("./check-env-variables")

checkEnvVariables()

/**
 * Medusa Cloud-related environment variables
 */
const S3_HOSTNAME = process.env.MEDUSA_CLOUD_S3_HOSTNAME
const S3_PATHNAME = process.env.MEDUSA_CLOUD_S3_PATHNAME

// PostHog ingest reverse-proxy. We forward requests from
// `/ingest/<...>` to the configured PostHog host so ad-blockers
// don't kill client-side tracking. The host is set in
// NEXT_PUBLIC_POSTHOG_HOST (no trailing slash).
const POSTHOG_HOST = (process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://eu.i.posthog.com")
  .replace(/\/+$/, "")
  // Strip the /capture path PostHog exposes for ingest, since the
  // rewrite below forwards to <POSTHOG_HOST>/<path>.
  .replace(/\/capture$/, "")
  // eu-assets hosts the static assets and /array endpoints
const POSTHOG_ASSETS_HOST = (process.env.NEXT_PUBLIC_POSTHOG_ASSETS_HOST || "https://eu-assets.i.posthog.com")
  .replace(/\/+$/, "")

/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  reactStrictMode: true,
  skipTrailingSlashRedirect: true,
  async rewrites() {
    return [
      {
        source: "/ingest/static/:path*",
        destination: `${POSTHOG_ASSETS_HOST}/static/:path*`,
      },
      {
        source: "/ingest/array/:path*",
        destination: `${POSTHOG_ASSETS_HOST}/array/:path*`,
      },
      {
        source: "/ingest/:path*",
        destination: `${POSTHOG_HOST}/:path*`,
      },
    ]
  },
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
      },
      {
        protocol: "https",
        hostname: "*.s3.*.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "*.s3.amazonaws.com",
      },
      ...(S3_HOSTNAME && S3_PATHNAME
        ? [
            {
              protocol: "https",
              hostname: S3_HOSTNAME,
              pathname: S3_PATHNAME,
            },
          ]
        : []),
    ],
  },
}

module.exports = nextConfig
