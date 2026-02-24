'use i18n'
'use client'

import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'

import { AppHeader } from '@/components/app-header'
import { useActiveOrg } from '@/components/org-switcher'
import {
  type ContactPreference,
  type OrgMembership,
  type PasskeyItem,
  ProfileFormFields,
} from '@/components/profile-form/profile-form'
import { authClient } from '@/lib/auth-client'
import { uploadFiles } from '@/lib/upload'

export default function ProfileSettingsPage() {
  const router = useRouter()
  const { data: session, isPending } = authClient.useSession()
  const {
    organizations,
    activeOrg,
    switchOrg,
    isPending: orgsPending,
  } = useActiveOrg()

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
      <AppHeader
        organizations={organizations}
        activeOrg={null}
        onSwitchOrg={switchOrg}
        orgsPending={orgsPending}
      />

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
