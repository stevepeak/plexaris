'use client'

import {
  CheckCircle2,
  Fingerprint,
  KeyRound,
  Loader2,
  Trash2,
  TriangleAlert,
  User,
} from 'lucide-react'
import { useEffect, useState } from 'react'

import { ImageUpload } from '@/components/image-upload'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { getPasskeyDisplayName } from '@/lib/passkey-utils'
import { cn } from '@/lib/utils'

function getInitials(name: string | undefined): string {
  if (!name) return '?'
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export type PasskeyItem = {
  id: string
  name: string | null
  aaguid: string | null
  createdAt: string | null
}

export type OrgMembership = {
  id: string
  name: string
  role: 'owner' | 'member'
  soleOwner: boolean
}

export type ContactPreference = 'message' | 'call'

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

  const [deleteLoading, setDeleteLoading] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [leaveLoadingId, setLeaveLoadingId] = useState<string | null>(null)
  const [leaveError, setLeaveError] = useState<string | null>(null)
  const [archiveLoadingId, setArchiveLoadingId] = useState<string | null>(null)
  const [archiveError, setArchiveError] = useState<string | null>(null)

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null)

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

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!onChangePassword) {
      return
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match')
      return
    }

    if (newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters')
      return
    }

    setPasswordLoading(true)
    setPasswordError(null)
    setPasswordSuccess(null)

    const result = await onChangePassword(currentPassword, newPassword)
    if (result.error) {
      setPasswordError(result.error)
    } else {
      setPasswordSuccess('Password changed successfully')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    }
    setPasswordLoading(false)
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
          <div>
            <h2 className="text-lg font-semibold">Password</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Change your account password
            </p>
            <Separator className="my-6" />
            <form onSubmit={handleChangePassword} className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="currentPassword">Current password</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  autoComplete="current-password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="newPassword">New password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    placeholder="Min. 8 characters"
                    autoComplete="new-password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={8}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="confirmPassword">Confirm new password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={8}
                  />
                </div>
              </div>

              {passwordError && (
                <p className="text-sm text-destructive">{passwordError}</p>
              )}
              {passwordSuccess && (
                <p className="text-sm text-green-600 dark:text-green-400">
                  {passwordSuccess}
                </p>
              )}

              <Button
                type="submit"
                disabled={
                  passwordLoading ||
                  !currentPassword ||
                  !newPassword ||
                  !confirmPassword
                }
                className="w-fit"
              >
                {passwordLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Changing...
                  </>
                ) : (
                  'Change password'
                )}
              </Button>
            </form>

            <Separator className="my-8" />

            <div>
              <h2 className="text-lg font-semibold">Passkeys</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Sign in with your fingerprint, face, or device PIN
              </p>
              <div className="mt-4 grid gap-3">
                {passkeysLoading ? (
                  <div className="flex items-center gap-3 rounded-md border px-4 py-3">
                    <div className="h-4 w-32 animate-pulse rounded bg-muted" />
                  </div>
                ) : passkeys && passkeys.length > 0 ? (
                  passkeys.map((pk) => (
                    <div
                      key={pk.id}
                      className="flex items-center justify-between rounded-md border px-4 py-3"
                    >
                      <div className="flex items-center gap-3">
                        <Fingerprint className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">
                            {getPasskeyDisplayName(pk.aaguid, pk.name)}
                          </p>
                          {pk.createdAt && (
                            <p className="text-xs text-muted-foreground">
                              Added{' '}
                              {new Date(pk.createdAt).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                      {onDeletePasskey && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <Trash2 className="h-4 w-4 text-muted-foreground" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Delete passkey?
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                This passkey will be permanently removed. You
                                won&apos;t be able to use it to sign in anymore.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                onClick={() => onDeletePasskey(pk.id)}
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No passkeys registered yet.
                  </p>
                )}
              </div>
              {onAddPasskey && (
                <Button
                  variant="outline"
                  onClick={onAddPasskey}
                  className="mt-4"
                >
                  <Fingerprint className="h-4 w-4" />
                  Add passkey
                </Button>
              )}
            </div>
          </div>
        </TabsContent>
        {onDeleteAccount && (
          <TabsContent value="danger" className="mt-0">
            <div>
              <h2 className="text-lg font-semibold">Delete your account</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Follow these steps to permanently delete your account. This
                cannot be undone.
              </p>
              <Separator className="my-6" />

              {/* Step 1 — Resolve organizations */}
              <div className="mb-8">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center">
                    {!organizationsLoading &&
                    (!organizations || organizations.length === 0) ? (
                      <CheckCircle2 className="h-6 w-6 text-green-500" />
                    ) : (
                      <span className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-muted-foreground text-xs font-semibold text-muted-foreground">
                        1
                      </span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold">
                        Resolve your organizations
                      </h3>
                      {!organizationsLoading &&
                        organizations &&
                        organizations.length > 0 && (
                          <Badge variant="secondary">
                            {organizations.length} remaining
                          </Badge>
                        )}
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      You must leave or archive all organizations before you can
                      delete your account.
                    </p>
                    <div className="mt-3 grid gap-2">
                      {organizationsLoading ? (
                        <div className="flex items-center gap-3 rounded-md border px-4 py-3">
                          <div className="h-4 w-32 animate-pulse rounded bg-muted" />
                        </div>
                      ) : organizations && organizations.length > 0 ? (
                        organizations.map((org) => (
                          <div
                            key={org.id}
                            className="flex items-center justify-between rounded-md border px-4 py-3"
                          >
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-medium">
                                  {org.name}
                                </p>
                                <Badge
                                  variant="secondary"
                                  className="capitalize"
                                >
                                  {org.soleOwner ? 'sole owner' : org.role}
                                </Badge>
                              </div>
                              {org.soleOwner && (
                                <p className="mt-1 text-xs text-muted-foreground">
                                  You are the only owner. Archive this
                                  organization to proceed.
                                </p>
                              )}
                            </div>
                            {org.soleOwner ? (
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    disabled={archiveLoadingId === org.id}
                                  >
                                    {archiveLoadingId === org.id ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                      'Archive'
                                    )}
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>
                                      Archive {org.name}?
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This organization and all its data will be
                                      archived. Members will lose access. This
                                      action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>
                                      Cancel
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                      onClick={async () => {
                                        if (!onArchiveOrg) return
                                        setArchiveLoadingId(org.id)
                                        setArchiveError(null)
                                        const result = await onArchiveOrg(
                                          org.id,
                                        )
                                        if (result.error) {
                                          setArchiveError(result.error)
                                        }
                                        setArchiveLoadingId(null)
                                      }}
                                    >
                                      Archive organization
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            ) : (
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={leaveLoadingId === org.id}
                                  >
                                    {leaveLoadingId === org.id ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                      'Leave'
                                    )}
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>
                                      Leave {org.name}?
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                      You will lose access to this organization.
                                      You can rejoin later if invited.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>
                                      Cancel
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={async () => {
                                        if (!onLeaveOrg) return
                                        setLeaveLoadingId(org.id)
                                        setLeaveError(null)
                                        const result = await onLeaveOrg(org.id)
                                        if (result.error) {
                                          setLeaveError(result.error)
                                        }
                                        setLeaveLoadingId(null)
                                      }}
                                    >
                                      Leave organization
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="flex items-center gap-2 rounded-md border px-4 py-3 text-sm text-muted-foreground">
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                          No organization memberships remaining.
                        </div>
                      )}
                      {leaveError && (
                        <p className="text-sm text-destructive">{leaveError}</p>
                      )}
                      {archiveError && (
                        <p className="text-sm text-destructive">
                          {archiveError}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 2 — Delete account */}
              {(() => {
                const step1Complete =
                  !organizationsLoading &&
                  (!organizations || organizations.length === 0)
                return (
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center">
                      <span
                        className={cn(
                          'flex h-6 w-6 items-center justify-center rounded-full border-2 text-xs font-semibold',
                          step1Complete
                            ? 'border-destructive text-destructive'
                            : 'border-muted text-muted',
                        )}
                      >
                        2
                      </span>
                    </div>
                    <div
                      className={cn(
                        'min-w-0 flex-1',
                        !step1Complete && 'opacity-50',
                      )}
                    >
                      <h3 className="text-sm font-semibold">
                        Delete your account
                      </h3>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {step1Complete
                          ? 'Permanently delete your account and all personal data.'
                          : 'Complete Step 1 before you can delete your account.'}
                      </p>
                      <div className="mt-3 grid gap-2">
                        {deleteError && (
                          <p className="text-sm text-destructive">
                            {deleteError}
                          </p>
                        )}
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="destructive"
                              className="w-fit"
                              disabled={deleteLoading || !step1Complete}
                            >
                              {deleteLoading ? (
                                <>
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                  Deleting...
                                </>
                              ) : (
                                'Delete my account'
                              )}
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Delete your account?
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                Your account and personal data will be
                                permanently deleted. You will be signed out and
                                will not be able to sign in again.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                disabled={deleteLoading}
                                onClick={async () => {
                                  setDeleteLoading(true)
                                  setDeleteError(null)
                                  const result = await onDeleteAccount()
                                  if (result.error) {
                                    setDeleteError(result.error)
                                  }
                                  setDeleteLoading(false)
                                }}
                              >
                                {deleteLoading ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  'Delete my account'
                                )}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </div>
                )
              })()}
            </div>
          </TabsContent>
        )}
      </div>
    </Tabs>
  )
}
