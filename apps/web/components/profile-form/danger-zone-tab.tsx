'use i18n'
import { CheckCircle2, Loader2 } from 'lucide-react'
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
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

import { type OrgMembership } from './types'

export function DangerZoneTab({
  organizations,
  organizationsLoading,
  onLeaveOrg,
  onArchiveOrg,
  onDeleteAccount,
}: {
  organizations?: OrgMembership[]
  organizationsLoading?: boolean
  onLeaveOrg?: (id: string) => Promise<{ error?: string }>
  onArchiveOrg?: (id: string) => Promise<{ error?: string }>
  onDeleteAccount: () => Promise<{ error?: string }>
}) {
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [leaveLoadingId, setLeaveLoadingId] = useState<string | null>(null)
  const [leaveError, setLeaveError] = useState<string | null>(null)
  const [archiveLoadingId, setArchiveLoadingId] = useState<string | null>(null)
  const [archiveError, setArchiveError] = useState<string | null>(null)

  const step1Complete =
    !organizationsLoading && (!organizations || organizations.length === 0)

  return (
    <div>
      <h2 className="text-lg font-semibold">Delete your account</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Follow these steps to permanently delete your account. This cannot be
        undone.
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
              You must leave or archive all organizations before you can delete
              your account.
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
                        <p className="text-sm font-medium">{org.name}</p>
                        <Badge variant="secondary" className="capitalize">
                          {org.soleAdmin ? 'sole admin' : org.roleName}
                        </Badge>
                      </div>
                      {org.soleAdmin && (
                        <p className="mt-1 text-xs text-muted-foreground">
                          You are the only admin. Archive this organization to
                          proceed.
                        </p>
                      )}
                    </div>
                    {org.soleAdmin ? (
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
                              archived. Members will lose access. This action
                              cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              onClick={async () => {
                                if (!onArchiveOrg) return
                                setArchiveLoadingId(org.id)
                                setArchiveError(null)
                                const result = await onArchiveOrg(org.id)
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
                              You will lose access to this organization. You can
                              rejoin later if invited.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
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
                <p className="text-sm text-destructive">{archiveError}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Step 2 — Delete account */}
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
        <div className={cn('min-w-0 flex-1', !step1Complete && 'opacity-50')}>
          <h3 className="text-sm font-semibold">Delete your account</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            {step1Complete
              ? 'Permanently delete your account and all personal data.'
              : 'Complete Step 1 before you can delete your account.'}
          </p>
          <div className="mt-3 grid gap-2">
            {deleteError && (
              <p className="text-sm text-destructive">{deleteError}</p>
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
                  <AlertDialogTitle>Delete your account?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Your account and personal data will be permanently deleted.
                    You will be signed out and will not be able to sign in
                    again.
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
    </div>
  )
}
