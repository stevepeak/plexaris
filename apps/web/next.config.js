import { withSentryConfig } from '@sentry/nextjs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const securityHeaders = [
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
]

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  turbopack: {
    root: resolve(dirname(fileURLToPath(import.meta.url)), '../..'),
  },
  async headers() {
    return [{ source: '/(.*)', headers: securityHeaders }]
  },
}

export default withSentryConfig(nextConfig, {
  // eslint-disable-next-line no-process-env
  silent: !process.env.CI,
  // Source maps are uploaded in CI via @sentry/cli
  sourcemaps: {
    disable: true,
  },
})
