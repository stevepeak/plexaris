import { withLingo } from '@lingo.dev/compiler/next'
import { withSentryConfig } from '@sentry/nextjs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const cspDirectives = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' blob: data:",
  "font-src 'self' data:",
  "connect-src 'self' *.sentry.io *.ingest.sentry.io",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
]

const securityHeaders = [
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  {
    key: 'Content-Security-Policy-Report-Only',
    value: cspDirectives.join('; '),
  },
]

const __dirname = dirname(fileURLToPath(import.meta.url))

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  turbopack: {
    root: resolve(__dirname, '../..'),
  },
  async headers() {
    return [{ source: '/(.*)', headers: securityHeaders }]
  },
}

export default async function config() {
  // eslint-disable-next-line no-process-env
  const isDev = process.env.NODE_ENV !== 'production'
  // eslint-disable-next-line no-process-env
  const useLingoCache = process.env.LINGO_CACHE === 'true'

  const baseConfig = await withLingo(nextConfig, {
    sourceRoot: './app',
    sourceLocale: 'en',
    targetLocales: ['nl'],
    models: { '*:*': 'openrouter:anthropic/claude-sonnet-4-6' },
    localePersistence: 'cookie',
    useDirective: true,
    buildMode: useLingoCache || !isDev ? 'cache-only' : 'translate',
  })

  return withSentryConfig(baseConfig, {
    // eslint-disable-next-line no-process-env
    silent: !process.env.CI,
    sourcemaps: {
      deleteSourcemapsAfterUpload: true,
    },
    widenClientFileUpload: true,
  })
}
