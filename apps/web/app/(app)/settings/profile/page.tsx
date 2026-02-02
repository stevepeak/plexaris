'use client'

import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCallback } from 'react'

import { ProfileFormFields } from '@/components/profile-form'
import { Button } from '@/components/ui/button'
import { authClient } from '@/lib/auth-client'

export default function ProfileSettingsPage() {
  const router = useRouter()
  const { data: session, isPending } = authClient.useSession()

  const handleUpdateName = useCallback(
    async (name: string): Promise<{ error?: string }> => {
      const { error } = await authClient.updateUser({ name })
      if (error) {
        return { error: error.message ?? 'Failed to update name' }
      }
      return {}
    },
    [],
  )

  const handleChangePassword = useCallback(
    async (
      currentPassword: string,
      newPassword: string,
    ): Promise<{ error?: string }> => {
      const { error } = await authClient.changePassword({
        currentPassword,
        newPassword,
        revokeOtherSessions: false,
      })
      if (error) {
        return { error: error.message ?? 'Failed to change password' }
      }
      return {}
    },
    [],
  )

  const handleArchiveAccount = useCallback(async (): Promise<{
    error?: string
  }> => {
    const res = await fetch('/api/account/archive', { method: 'POST' })
    if (!res.ok) {
      const json = await res.json()
      return { error: json.error ?? 'Failed to archive account' }
    }
    router.push('/login')
    return {}
  }, [router])

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="mx-auto flex h-14 max-w-4xl items-center gap-4 px-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <span className="text-lg font-semibold">Profile settings</span>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8">
        <ProfileFormFields
          name={session?.user.name ?? ''}
          email={session?.user.email ?? ''}
          isPending={isPending}
          onUpdateName={handleUpdateName}
          onChangePassword={handleChangePassword}
          onArchiveAccount={handleArchiveAccount}
        />
      </main>
    </div>
  )
}
