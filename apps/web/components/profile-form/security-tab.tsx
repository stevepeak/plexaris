'use i18n'
import { Fingerprint, Loader2, Trash2 } from 'lucide-react'
import { useState } from 'react'

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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { getPasskeyDisplayName } from '@/lib/passkey-utils'

import { type PasskeyItem } from './types'

export function SecurityTab({
  onChangePassword,
  passkeys,
  passkeysLoading,
  onAddPasskey,
  onDeletePasskey,
}: {
  onChangePassword?: (
    currentPassword: string,
    newPassword: string,
  ) => Promise<{ error?: string }>
  passkeys?: PasskeyItem[]
  passkeysLoading?: boolean
  onAddPasskey?: () => void
  onDeletePasskey?: (id: string) => void
}) {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null)

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

  return (
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
            className="max-w-sm"
          />
        </div>
        <div className="grid max-w-lg gap-4 sm:grid-cols-2">
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
                        Added {new Date(pk.createdAt).toLocaleDateString()}
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
                        <AlertDialogTitle>Delete passkey?</AlertDialogTitle>
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
          <Button variant="outline" onClick={onAddPasskey} className="mt-4">
            <Fingerprint className="h-4 w-4" />
            Add passkey
          </Button>
        )}
      </div>
    </div>
  )
}
