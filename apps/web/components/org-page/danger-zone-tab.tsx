'use client'

import { Loader2, TriangleAlert } from 'lucide-react'
import { useEffect, useState } from 'react'

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
import { Separator } from '@/components/ui/separator'

export function DangerZoneTab({
  organizationId,
  onOrgLeft,
  onOrgArchived,
}: {
  organizationId: string
  onOrgLeft?: () => void
  onOrgArchived?: () => void
}) {
  const [orgName, setOrgName] = useState('')
  const [isOrgAdmin, setIsOrgAdmin] = useState(false)
  const [isPending, setIsPending] = useState(true)
  const [dangerLoading, setDangerLoading] = useState(false)
  const [dangerError, setDangerError] = useState<string | null>(null)

  useEffect(() => {
    void fetch(`/api/organizations/${organizationId}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.organization) {
          setOrgName(data.organization.name)
          const role = data.role as {
            isSystem: boolean
            permissions: string[]
          }
          setIsOrgAdmin(role.isSystem)
        }
      })
      .finally(() => setIsPending(false))
  }, [organizationId])

  const handleLeaveOrg = async () => {
    setDangerLoading(true)
    setDangerError(null)
    const res = await fetch(`/api/organizations/${organizationId}/leave`, {
      method: 'POST',
    })
    if (!res.ok) {
      const json = await res.json()
      setDangerError(json.error ?? 'Failed to leave organization')
    } else {
      onOrgLeft?.()
    }
    setDangerLoading(false)
  }

  const handleArchiveOrg = async () => {
    setDangerLoading(true)
    setDangerError(null)
    const res = await fetch(`/api/organizations/${organizationId}/archive`, {
      method: 'POST',
    })
    if (!res.ok) {
      const json = await res.json()
      setDangerError(json.error ?? 'Failed to archive organization')
    } else {
      onOrgArchived?.()
    }
    setDangerLoading(false)
  }

  if (isPending) {
    return (
      <div className="space-y-4">
        <div className="h-5 w-40 animate-pulse rounded bg-muted" />
        <div className="h-4 w-56 animate-pulse rounded bg-muted" />
        <div className="h-12 animate-pulse rounded bg-muted" />
      </div>
    )
  }

  return (
    <div>
      <h2 className="flex items-center gap-2 text-lg font-semibold text-destructive">
        <TriangleAlert className="h-5 w-5" />
        Danger zone
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        These actions are irreversible. Please be certain.
      </p>
      <Separator className="my-6" />
      <div className="grid gap-4">
        {dangerError && (
          <p className="text-sm text-destructive">{dangerError}</p>
        )}

        {!isOrgAdmin && (
          <div className="flex items-center justify-between rounded-md border px-4 py-3">
            <div>
              <p className="text-sm font-medium">Leave organization</p>
              <p className="text-xs text-muted-foreground">
                Remove yourself from this organization
              </p>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  Leave
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Leave organization?</AlertDialogTitle>
                  <AlertDialogDescription>
                    You will lose access to {orgName}. You will need a new
                    invitation to rejoin.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    disabled={dangerLoading}
                    onClick={handleLeaveOrg}
                  >
                    {dangerLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      'Leave organization'
                    )}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}

        {isOrgAdmin && (
          <div className="flex items-center justify-between rounded-md border px-4 py-3">
            <div>
              <p className="text-sm font-medium">Archive organization</p>
              <p className="text-xs text-muted-foreground">
                Permanently archive this organization and all its data
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
                  <AlertDialogTitle>Archive organization?</AlertDialogTitle>
                  <AlertDialogDescription>
                    {orgName} will be permanently archived. All members will
                    lose access. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    disabled={dangerLoading}
                    onClick={handleArchiveOrg}
                  >
                    {dangerLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      'Archive organization'
                    )}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
      </div>
    </div>
  )
}
