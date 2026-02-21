import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { withSentryConfig } from '@sentry/nextjs'

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  turbopack: {
    root: resolve(dirname(fileURLToPath(import.meta.url)), '../..'),
  },
}

export default withSentryConfig(nextConfig, {
  silent: !process.env.CI,
  // Source maps are uploaded in CI via @sentry/cli
  sourcemaps: {
    disable: true,
  },
})
