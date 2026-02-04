'use client'

import { KeyRound, Loader2, TriangleAlert, User } from 'lucide-react'
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
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

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
  isPending,
  onUpdateName,
  onUpdateImage,
  onChangePassword,
  onArchiveAccount,
}: {
  name: string
  email: string
  image?: string | null
  isPending: boolean
  onUpdateName?: (name: string) => Promise<{ error?: string }>
  onUpdateImage?: (file: File | null) => Promise<{ error?: string }>
  onChangePassword?: (
    currentPassword: string,
    newPassword: string,
  ) => Promise<{ error?: string }>
  onArchiveAccount?: () => Promise<{ error?: string }>
}) {
  const [name, setName] = useState(initialName)
  useEffect(() => {
    setName(initialName)
  }, [initialName])
  const [nameLoading, setNameLoading] = useState(false)
  const [nameError, setNameError] = useState<string | null>(null)
  const [nameSuccess, setNameSuccess] = useState<string | null>(null)

  const [archiveLoading, setArchiveLoading] = useState(false)
  const [archiveError, setArchiveError] = useState<string | null>(null)

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null)

  const handleUpdateName = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!onUpdateName) {
      return
    }
    setNameLoading(true)
    setNameError(null)
    setNameSuccess(null)

    const result = await onUpdateName(name)
    if (result.error) {
      setNameError(result.error)
    } else {
      setNameSuccess('Name updated successfully')
    }
    setNameLoading(false)
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
            <User className="h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger
            value="password"
            className="justify-start gap-2 data-[state=active]:bg-muted data-[state=active]:shadow-none"
          >
            <KeyRound className="h-4 w-4" />
            Password
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
          <User className="h-4 w-4" />
          Profile
        </TabsTrigger>
        <TabsTrigger
          value="password"
          className="justify-start gap-2 data-[state=active]:bg-muted data-[state=active]:shadow-none"
        >
          <KeyRound className="h-4 w-4" />
          Password
        </TabsTrigger>
        {onArchiveAccount && (
          <TabsTrigger
            value="danger"
            className="justify-start gap-2 text-destructive data-[state=active]:bg-destructive/10 data-[state=active]:shadow-none"
          >
            <TriangleAlert className="h-4 w-4" />
            Danger zone
          </TabsTrigger>
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

            <form onSubmit={handleUpdateName} className="grid gap-4">
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

              {nameError && (
                <p className="text-sm text-destructive">{nameError}</p>
              )}
              {nameSuccess && (
                <p className="text-sm text-green-600 dark:text-green-400">
                  {nameSuccess}
                </p>
              )}

              <Button
                type="submit"
                disabled={nameLoading || name === initialName}
                className="w-fit"
              >
                {nameLoading ? (
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
          </div>
        </TabsContent>
        {onArchiveAccount && (
          <TabsContent value="danger" className="mt-0">
            <div>
              <h2 className="text-lg font-semibold text-destructive">
                Danger zone
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                This action is irreversible. Please be certain.
              </p>
              <Separator className="my-6" />
              <div className="grid gap-4">
                {archiveError && (
                  <p className="text-sm text-destructive">{archiveError}</p>
                )}
                <div className="flex items-center justify-between rounded-md border px-4 py-3">
                  <div>
                    <p className="text-sm font-medium">Archive account</p>
                    <p className="text-xs text-muted-foreground">
                      Permanently archive your account and remove all org
                      memberships
                    </p>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm">
                        Archive
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Archive your account?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          Your account will be permanently archived. You will be
                          signed out and will not be able to sign in again. You
                          must archive any organizations you own first.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          disabled={archiveLoading}
                          onClick={async () => {
                            setArchiveLoading(true)
                            setArchiveError(null)
                            const result = await onArchiveAccount()
                            if (result.error) {
                              setArchiveError(result.error)
                            }
                            setArchiveLoading(false)
                          }}
                        >
                          {archiveLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            'Archive my account'
                          )}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </div>
          </TabsContent>
        )}
      </div>
    </Tabs>
  )
}
