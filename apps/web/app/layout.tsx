import { isDev } from '@app/config'
import { type Metadata } from 'next'
import Script from 'next/script'
import { type ReactNode } from 'react'

import { Toaster } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'

import './globals.css'
import { PostHogProvider } from './providers/posthog-provider'
import { ThemeProvider } from './providers/theme-provider'
import { TRPCProvider } from './providers/trpc-provider'

export const metadata: Metadata = {
  title: {
    template: '%s | Plexaris',
    default: 'Plexaris',
  },
  description: 'A modern Next.js application template',
  icons: {
    icon: '/icon.svg',
  },
  openGraph: {
    title: 'Plexaris',
    description: 'A modern Next.js application template',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Bruno+Ace+SC&display=swap"
          rel="stylesheet"
        />
        {isDev() && (
          <>
            <Script
              src="//unpkg.com/react-grab/dist/index.global.js"
              crossOrigin="anonymous"
              strategy="beforeInteractive"
            />
            <Script
              src="//unpkg.com/@react-grab/cursor/dist/client.global.js"
              crossOrigin="anonymous"
              strategy="lazyOnload"
            />
          </>
        )}
      </head>
      <body>
        <ThemeProvider>
          <TRPCProvider>
            <PostHogProvider>
              <TooltipProvider>{children}</TooltipProvider>
            </PostHogProvider>
          </TRPCProvider>
        </ThemeProvider>
        <Toaster />
      </body>
    </html>
  )
}
