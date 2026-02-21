'use client'

import { LogOut, Settings } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'

import { OrgSwitcher, useActiveOrg } from '@/components/org-switcher'
import {
  type ContactPreference,
  type OrgMembership,
  type PasskeyItem,
  ProfileFormFields,
} from '@/components/profile-form'
import { ThemeSubmenu } from '@/components/theme-toggle'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { authClient } from '@/lib/auth-client'
import { uploadFiles } from '@/lib/upload'

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

  const handleSignOut = async () => {
    await authClient.signOut()
    router.push('/login')
  }

  const [passkeys, setPasskeys] = useState<PasskeyItem[]>([])
  const [passkeysLoading, setPasskeysLoading] = useState(true)

  const fetchPasskeys = useCallback(async () => {
    setPasskeysLoading(true)
    const { data } = await authClient.passkey.listUserPasskeys({})
    setPasskeys(
      (data ?? []).map((pk) => ({
        id: pk.id,
        name: pk.name ?? null,
        aaguid: (pk as Record<string, unknown>).aaguid as string | null,
        createdAt: pk.createdAt ? String(pk.createdAt) : null,
      })),
    )
    setPasskeysLoading(false)
  }, [])

  useEffect(() => {
    void fetchPasskeys()
  }, [fetchPasskeys])

  const handleAddPasskey = useCallback(async () => {
    await authClient.passkey.addPasskey({
      name: session?.user.email ?? 'Passkey',
    })
    void fetchPasskeys()
  }, [fetchPasskeys, session?.user.email])

  const handleDeletePasskey = useCallback(
    async (id: string) => {
      await authClient.passkey.deletePasskey({ id })
      void fetchPasskeys()
    },
    [fetchPasskeys],
  )

  const [userOrgs, setUserOrgs] = useState<OrgMembership[]>([])
  const [userOrgsLoading, setUserOrgsLoading] = useState(true)

  const fetchUserOrgs = useCallback(async () => {
    setUserOrgsLoading(true)
    const res = await fetch('/api/organizations/mine')
    if (res.ok) {
      const json = await res.json()
      setUserOrgs(
        (json.organizations ?? []).map(
          (o: {
            id: string
            name: string
            roleName: string
            isAdmin: boolean
            soleAdmin: boolean
          }) => ({
            id: o.id,
            name: o.name,
            roleName: o.roleName,
            isAdmin: o.isAdmin,
            soleAdmin: o.soleAdmin,
          }),
        ),
      )
    }
    setUserOrgsLoading(false)
  }, [])

  useEffect(() => {
    void fetchUserOrgs()
  }, [fetchUserOrgs])

  const handleLeaveOrg = useCallback(
    async (orgId: string): Promise<{ error?: string }> => {
      const res = await fetch(`/api/organizations/${orgId}/leave`, {
        method: 'POST',
      })
      if (!res.ok) {
        const json = await res.json()
        return { error: json.error ?? 'Failed to leave organization' }
      }
      void fetchUserOrgs()
      return {}
    },
    [fetchUserOrgs],
  )

  const handleArchiveOrg = useCallback(
    async (orgId: string): Promise<{ error?: string }> => {
      const res = await fetch(`/api/organizations/${orgId}/archive`, {
        method: 'POST',
      })
      if (!res.ok) {
        const json = await res.json()
        return { error: json.error ?? 'Failed to archive organization' }
      }
      void fetchUserOrgs()
      return {}
    },
    [fetchUserOrgs],
  )

  const handleUpdateImage = useCallback(
    async (file: File | null): Promise<{ error?: string }> => {
      if (!file) return {}
      const { urls, error: uploadError } = await uploadFiles([file], 'avatars')
      if (uploadError || !urls[0]) {
        return { error: uploadError ?? 'Upload failed' }
      }
      const { error } = await authClient.updateUser({ image: urls[0] })
      if (error) return { error: error.message ?? 'Failed to update avatar' }
      return {}
    },
    [],
  )

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

  const handleUpdatePhone = useCallback(
    async (
      phone: string,
      contactPreference: ContactPreference,
    ): Promise<{ error?: string }> => {
      const { error } = await authClient.updateUser({
        phone,
        contactPreference,
      })
      if (error) {
        return { error: error.message ?? 'Failed to update contact info' }
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

  const handleDeleteAccount = useCallback(async (): Promise<{
    error?: string
  }> => {
    const res = await fetch('/api/account/archive', { method: 'POST' })
    if (!res.ok) {
      const json = await res.json()
      return { error: json.error ?? 'Failed to delete account' }
    }
    router.push('/login')
    return {}
  }, [router])

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="font-bruno text-lg">
              Plexaris
            </Link>
            <Separator orientation="vertical" className="h-6" />
            <OrgSwitcher
              organizations={organizations}
              activeOrg={null}
              onSwitch={switchOrg}
              isPending={orgsPending}
            />
          </div>
          {isPending ? (
            <Skeleton className="h-8 w-8 rounded-full" />
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={session?.user.image ?? undefined}
                      alt={session?.user.name ?? ''}
                    />
                    <AvatarFallback className="text-xs">
                      {getInitials(session?.user.name)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col gap-1">
                    <p className="text-sm font-medium">{session?.user.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {session?.user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/settings/profile">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <ThemeSubmenu />
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </header>

      <main className="px-4 py-8">
        <ProfileFormFields
          name={session?.user.name ?? ''}
          email={session?.user.email ?? ''}
          image={session?.user.image}
          phone={session?.user.phone}
          contactPreference={
            session?.user.contactPreference as ContactPreference | null
          }
          isPending={isPending}
          onUpdateName={handleUpdateName}
          onUpdateImage={handleUpdateImage}
          onUpdatePhone={handleUpdatePhone}
          onChangePassword={handleChangePassword}
          onDeleteAccount={handleDeleteAccount}
          organizations={userOrgs}
          organizationsLoading={userOrgsLoading}
          onLeaveOrg={handleLeaveOrg}
          onArchiveOrg={handleArchiveOrg}
          passkeys={passkeys}
          passkeysLoading={passkeysLoading}
          onAddPasskey={handleAddPasskey}
          onDeletePasskey={handleDeletePasskey}
        />
      </main>
    </div>
  )
}
