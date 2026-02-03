'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCallback } from 'react'

import { OrgSwitcher, useActiveOrg } from '@/components/org-switcher'
import { ProfileFormFields } from '@/components/profile-form'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { authClient } from '@/lib/auth-client'

function getInitials(name: string | undefined): string {
  if (!name) return '?'
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export default function ProfileSettingsPage() {
  const router = useRouter()
  const { data: session, isPending } = authClient.useSession()
  const {
    organizations,
    activeOrg,
    switchOrg,
    isPending: orgsPending,
  } = useActiveOrg()

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
        <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-lg font-semibold">
              Plexaris
            </Link>
            <Separator orientation="vertical" className="h-6" />
            <OrgSwitcher
              organizations={organizations}
              activeOrg={activeOrg}
              onSwitch={switchOrg}
              isPending={orgsPending}
            />
          </div>
          {isPending ? (
            <Skeleton className="h-8 w-8 rounded-full" />
          ) : (
            <Avatar className="h-8 w-8">
              <AvatarFallback className="text-xs">
                {getInitials(session?.user.name)}
              </AvatarFallback>
            </Avatar>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8">
        <h1 className="mb-6 text-lg font-semibold">Profile settings</h1>
        <ProfileFormFields
          name={session?.user.name ?? ''}
          email={session?.user.email ?? ''}
          image={session?.user.image}
          isPending={isPending}
          onUpdateName={handleUpdateName}
          onChangePassword={handleChangePassword}
          onArchiveAccount={handleArchiveAccount}
        />
      </main>
    </div>
  )
}
