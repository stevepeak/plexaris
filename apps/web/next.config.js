import { resolve } from 'node:path'

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  turbopack: {
    root: resolve(__dirname, '../..'),
  },
}

export default nextConfig
