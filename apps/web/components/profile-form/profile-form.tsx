'use i18n'
'use client'

import { Cable, KeyRound, Loader2, TriangleAlert, User } from 'lucide-react'
import { useEffect, useState } from 'react'

import { ImageUpload } from '@/components/image-upload'
import { McpTab } from '@/components/org-page/mcp-tab'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import { DangerZoneTab } from './danger-zone-tab'
import { SecurityTab } from './security-tab'
import {
  type ContactPreference,
  type OrgMembership,
  type PasskeyItem,
} from './types'

export type { ContactPreference, OrgMembership, PasskeyItem } from './types'

function getInitials(name: string | undefined): string {
  if (!name) return '?'
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function ProfileFormFields({
  name: initialName,
  email,
  image,
  phone: initialPhone,
  contactPreference: initialContactPreference,
  isPending,
  onUpdateName,
  onUpdateImage,
  onUpdatePhone,
  onChangePassword,
  onDeleteAccount,
  organizations,
  organizationsLoading,
  onLeaveOrg,
  onArchiveOrg,
  passkeys,
  passkeysLoading,
  onAddPasskey,
  onDeletePasskey,
}: {
  name: string
  email: string
  image?: string | null
  phone?: string | null
  contactPreference?: ContactPreference | null
  isPending: boolean
  onUpdateName?: (name: string) => Promise<{ error?: string }>
  onUpdateImage?: (file: File | null) => Promise<{ error?: string }>
  onUpdatePhone?: (
    phone: string,
    contactPreference: ContactPreference,
  ) => Promise<{ error?: string }>
  onChangePassword?: (
    currentPassword: string,
    newPassword: string,
  ) => Promise<{ error?: string }>
  onDeleteAccount?: () => Promise<{ error?: string }>
  organizations?: OrgMembership[]
  organizationsLoading?: boolean
  onLeaveOrg?: (id: string) => Promise<{ error?: string }>
  onArchiveOrg?: (id: string) => Promise<{ error?: string }>
  passkeys?: PasskeyItem[]
  passkeysLoading?: boolean
  onAddPasskey?: () => void
  onDeletePasskey?: (id: string) => void
}) {
  const [name, setName] = useState(initialName)
  useEffect(() => {
    setName(initialName)
  }, [initialName])

  const [phone, setPhone] = useState(initialPhone ?? '')
  const [contactPreference, setContactPreference] = useState<ContactPreference>(
    initialContactPreference ?? 'message',
  )
  useEffect(() => {
    setPhone(initialPhone ?? '')
  }, [initialPhone])
  useEffect(() => {
    setContactPreference(initialContactPreference ?? 'message')
  }, [initialContactPreference])

  const [profileLoading, setProfileLoading] = useState(false)
  const [profileError, setProfileError] = useState<string | null>(null)
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null)

  const nameChanged = name !== initialName
  const phoneChanged =
    phone !== (initialPhone ?? '') ||
    contactPreference !== (initialContactPreference ?? 'message')
  const profileDirty = nameChanged || phoneChanged

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setProfileLoading(true)
    setProfileError(null)
    setProfileSuccess(null)

    const errors: string[] = []

    if (nameChanged && onUpdateName) {
      const result = await onUpdateName(name)
      if (result.error) errors.push(result.error)
    }

    if (phoneChanged && phone && onUpdatePhone) {
      const result = await onUpdatePhone(phone, contactPreference)
      if (result.error) errors.push(result.error)
    }

    if (errors.length > 0) {
      setProfileError(errors.join('. '))
    } else {
      setProfileSuccess('Profile updated successfully')
    }
    setProfileLoading(false)
  }

  if (isPending) {
    return (
      <Tabs
        defaultValue="profile"
        orientation="vertical"
        className="flex items-start gap-8"
      >
        <TabsList className="h-auto w-48 shrink-0 flex-col items-stretch gap-1 bg-transparent p-0">
          <TabsTrigger
            value="profile"
            className="justify-start gap-2 data-[state=active]:bg-muted data-[state=active]:shadow-none"
          >
            <User className="h-4 w-4 text-blue-500" />
            Profile
          </TabsTrigger>
          <TabsTrigger
            value="password"
            className="justify-start gap-2 data-[state=active]:bg-muted data-[state=active]:shadow-none"
          >
            <KeyRound className="h-4 w-4 text-amber-500" />
            Security
          </TabsTrigger>
          <TabsTrigger
            value="mcp"
            className="justify-start gap-2 data-[state=active]:bg-muted data-[state=active]:shadow-none"
          >
            <Cable className="h-4 w-4 text-violet-500" />
            MCP
          </TabsTrigger>
        </TabsList>
        <div className="min-w-0 flex-1">
          <TabsContent value="profile" className="mt-0">
            <div className="space-y-4">
              <div className="h-5 w-32 animate-pulse rounded bg-muted" />
              <div className="h-4 w-48 animate-pulse rounded bg-muted" />
              <div className="h-9 animate-pulse rounded bg-muted" />
              <div className="h-9 animate-pulse rounded bg-muted" />
            </div>
          </TabsContent>
          <TabsContent value="password" className="mt-0">
            <div className="space-y-4">
              <div className="h-5 w-32 animate-pulse rounded bg-muted" />
              <div className="h-4 w-48 animate-pulse rounded bg-muted" />
              <div className="h-9 animate-pulse rounded bg-muted" />
              <div className="h-9 animate-pulse rounded bg-muted" />
            </div>
          </TabsContent>
          <TabsContent value="mcp" className="mt-0">
            <McpTab />
          </TabsContent>
        </div>
      </Tabs>
    )
  }

  return (
    <Tabs
      defaultValue="profile"
      orientation="vertical"
      className="flex items-start gap-8"
    >
      <TabsList className="h-auto w-48 shrink-0 flex-col items-stretch gap-1 bg-transparent p-0">
        <TabsTrigger
          value="profile"
          className="justify-start gap-2 data-[state=active]:bg-muted data-[state=active]:shadow-none"
        >
          <User className="h-4 w-4 text-blue-500" />
          Profile
        </TabsTrigger>
        <TabsTrigger
          value="password"
          className="justify-start gap-2 data-[state=active]:bg-muted data-[state=active]:shadow-none"
        >
          <KeyRound className="h-4 w-4 text-amber-500" />
          Security
        </TabsTrigger>
        <TabsTrigger
          value="mcp"
          className="justify-start gap-2 data-[state=active]:bg-muted data-[state=active]:shadow-none"
        >
          <Cable className="h-4 w-4 text-violet-500" />
          MCP
        </TabsTrigger>
        {onDeleteAccount && (
          <>
            <Separator className="my-2" />
            <TabsTrigger
              value="danger"
              className="justify-start gap-2 data-[state=active]:bg-muted data-[state=active]:shadow-none"
            >
              <TriangleAlert className="h-4 w-4 text-rose-500" />
              Delete account
            </TabsTrigger>
          </>
        )}
      </TabsList>
      <div className="min-w-0 flex-1">
        <TabsContent value="profile" className="mt-0">
          <div>
            <h2 className="text-lg font-semibold">Profile</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Update your personal information
            </p>
            <Separator className="my-6" />
            <div className="mb-6">
              <ImageUpload
                value={image}
                fallback={getInitials(name || initialName)}
                variant="circle"
                alt={name}
                disabled={!onUpdateImage}
                onUpload={onUpdateImage}
              />
            </div>

            <form onSubmit={handleUpdateProfile} className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  type="text"
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="max-w-sm"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  disabled
                  className="max-w-sm"
                />
                <p className="text-xs text-muted-foreground">
                  Email cannot be changed
                </p>
              </div>

              <Separator className="my-4" />

              <div>
                <h3 className="text-sm font-semibold">Contact information</h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  How your team can reach you
                </p>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="phone">Phone number</Label>
                <Input
                  id="phone"
                  type="tel"
                  autoComplete="tel"
                  placeholder="+1 (555) 000-0000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={!onUpdatePhone}
                  className="max-w-xs"
                />
              </div>
              <div className="grid gap-2">
                <Label>Contact preference</Label>
                <RadioGroup
                  value={contactPreference}
                  onValueChange={(v) =>
                    setContactPreference(v as ContactPreference)
                  }
                  disabled={!onUpdatePhone}
                  className="flex gap-4"
                >
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="message" id="pref-message" />
                    <Label htmlFor="pref-message" className="font-normal">
                      Message
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="call" id="pref-call" />
                    <Label htmlFor="pref-call" className="font-normal">
                      Call
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {profileError && (
                <p className="text-sm text-destructive">{profileError}</p>
              )}
              {profileSuccess && (
                <p className="text-sm text-green-600 dark:text-green-400">
                  {profileSuccess}
                </p>
              )}

              <Button
                type="submit"
                disabled={profileLoading || !profileDirty}
                className="w-fit"
              >
                {profileLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save changes'
                )}
              </Button>
            </form>
          </div>
        </TabsContent>
        <TabsContent value="password" className="mt-0">
          <SecurityTab
            onChangePassword={onChangePassword}
            passkeys={passkeys}
            passkeysLoading={passkeysLoading}
            onAddPasskey={onAddPasskey}
            onDeletePasskey={onDeletePasskey}
          />
        </TabsContent>
        <TabsContent value="mcp" className="mt-0">
          <McpTab />
        </TabsContent>
        {onDeleteAccount && (
          <TabsContent value="danger" className="mt-0">
            <DangerZoneTab
              organizations={organizations}
              organizationsLoading={organizationsLoading}
              onLeaveOrg={onLeaveOrg}
              onArchiveOrg={onArchiveOrg}
              onDeleteAccount={onDeleteAccount}
            />
          </TabsContent>
        )}
      </div>
    </Tabs>
  )
}
