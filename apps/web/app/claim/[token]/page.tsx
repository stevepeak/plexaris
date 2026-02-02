'use client'

import { useParams, useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'

import {
  ClaimCard,
  type ClaimCardState,
  type ClaimPreviewData,
} from '@/components/claim-card'
import { authClient } from '@/lib/auth-client'

export default function ClaimPage() {
  const { token } = useParams<{ token: string }>()
  const router = useRouter()
  const { data: session, isPending: sessionPending } = authClient.useSession()

  const [state, setState] = useState<ClaimCardState>({ status: 'loading' })

  const fetchPreview = useCallback(async () => {
    const res = await fetch(`/api/claim/${token}`)
    if (!res.ok) {
      const body = await res.json()
      setState({
        status: 'error',
        code: res.status,
        message: body.error ?? 'Something went wrong',
      })
      return
    }
    const data: ClaimPreviewData = await res.json()
    setState({ status: 'preview', data })
  }, [token])

  useEffect(() => {
    void fetchPreview()
  }, [fetchPreview])

  const handleClaim = async () => {
    if (state.status !== 'preview') return
    setState({ status: 'claiming', data: state.data })
    const res = await fetch(`/api/claim/${token}`, { method: 'POST' })
    if (!res.ok) {
      const body = await res.json()
      setState({
        status: 'error',
        code: res.status,
        message: body.error ?? 'Failed to claim organization',
      })
      return
    }
    const data = await res.json()
    setState({ status: 'claimed', orgName: data.organization.name })
  }

  const isAuthenticated = !!session && !sessionPending

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <ClaimCard
        state={state}
        isAuthenticated={isAuthenticated}
        onClaim={handleClaim}
        onSignUp={() => router.push(`/signup?redirect=/claim/${token}`)}
        onGoHome={() => router.push('/')}
        onGoToDashboard={() => router.push('/dashboard')}
        signUpHref={`/signup?redirect=/claim/${token}`}
        loginHref={`/login?redirect=/claim/${token}`}
      />
    </div>
  )
}
