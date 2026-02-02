'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

import { authClient } from '@/lib/auth-client'

export default function HomePage() {
  const router = useRouter()
  const { data: session, isPending } = authClient.useSession()

  useEffect(() => {
    if (isPending) return
    if (session) {
      router.replace('/dashboard')
    } else {
      router.replace('/login')
    }
  }, [session, isPending, router])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-muted-foreground">Redirecting...</p>
    </div>
  )
}
