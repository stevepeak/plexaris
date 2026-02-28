'use client'

import posthog from 'posthog-js'
import { type ReactNode, useEffect, useRef } from 'react'

import { authClient } from '@/lib/auth-client'

type PostHogProviderProps = {
  children: ReactNode
}

export function PostHogProvider({ children }: PostHogProviderProps) {
  const { data: session } = authClient.useSession()
  const identifiedUserRef = useRef<string | null>(null)

  useEffect(() => {
    // Only initialize in production or when explicitly enabled
    // eslint-disable-next-line no-process-env
    if (process.env.NODE_ENV !== 'production') {
      return
    }

    // eslint-disable-next-line no-process-env
    const apiKey = process.env.NEXT_PUBLIC_POSTHOG_API_KEY
    const host =
      // eslint-disable-next-line no-process-env
      process.env.NEXT_PUBLIC_POSTHOG_HOST ?? 'https://us.i.posthog.com'

    if (!apiKey) {
      return
    }

    posthog.init(apiKey, {
      api_host: host,
      loaded: (posthog) => {
        // eslint-disable-next-line no-process-env
        if (process.env.NODE_ENV === 'development') {
          // eslint-disable-next-line no-console
          console.log('PostHog loaded', posthog)
        }
      },
    })
  }, [])

  useEffect(() => {
    if (!posthog.__loaded) {
      return
    }

    const user = session?.user
    if (user) {
      if (identifiedUserRef.current !== user.id) {
        posthog.identify(user.id, {
          email: user.email,
          name: user.name,
          avatar: user.image,
          $avatar: user.image,
        })
        identifiedUserRef.current = user.id
      }
    } else if (identifiedUserRef.current) {
      posthog.reset()
      identifiedUserRef.current = null
    }
  }, [session])

  return <>{children}</>
}
