'use i18n'
import { isDev } from '@app/config'
import { type Metadata } from 'next'
import Script from 'next/script'
import { type ReactNode } from 'react'

import { Toaster } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'

import './globals.css'
import { LingoProvider } from './providers/lingo-provider'
import { PostHogProvider } from './providers/posthog-provider'
import { ThemeProvider } from './providers/theme-provider'
import { TRPCProvider } from './providers/trpc-provider'

export const metadata: Metadata = {
  title: {
    template: '%s | Plexaris',
    default: 'Plexaris — AI-Powered Ordering for Food Service',
  },
  description:
    'Plexaris connects HoReCa buyers with food suppliers through AI-powered voice and text ordering. Free for restaurants, transparent pricing for suppliers.',
  icons: {
    icon: '/icon.svg',
  },
  openGraph: {
    title: 'Plexaris — AI-Powered Ordering for Food Service',
    description:
      'Plexaris connects HoReCa buyers with food suppliers through AI-powered voice and text ordering. Free for restaurants, transparent pricing for suppliers.',
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
          href="https://fonts.googleapis.com/css2?family=Bruno+Ace+SC&family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600;700&display=swap"
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
        <LingoProvider>
          <ThemeProvider>
            <TRPCProvider>
              <PostHogProvider>
                <TooltipProvider>{children}</TooltipProvider>
              </PostHogProvider>
            </TRPCProvider>
          </ThemeProvider>
          <Toaster />
        </LingoProvider>
      </body>
    </html>
  )
}
