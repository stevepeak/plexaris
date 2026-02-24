'use i18n'
'use client'

import { isGhostUser } from '@app/utils'
import { Building2, Check, Ghost, Loader2, X } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

type PendingInvitation = {
  id: string
  email: string
  roleName: string
  token: string
  createdAt: string
  expiresAt: string
  organizationName: string
  organizationType: string
  invitedByName: string
}

export function PendingInvitationsList({
  invitations,
  onAccept,
  onReject,
}: {
  invitations: PendingInvitation[]
  onAccept?: (id: string) => void
  onReject?: (id: string) => void
}) {
  const [actioning, setActioning] = useState<string | null>(null)

  if (invitations.length === 0) return null

  const handleAccept = async (id: string) => {
    setActioning(id)
    onAccept?.(id)
  }

  const handleReject = async (id: string) => {
    setActioning(id)
    onReject?.(id)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Pending Invitations</CardTitle>
        <CardDescription>
          You&apos;ve been invited to join the following organizations
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3">
        {invitations.map((inv) => (
          <div
            key={inv.id}
            className="flex items-center justify-between rounded-md border px-4 py-3"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                <Building2 className="h-4 w-4 text-primary" />
              </div>
              <div>
                <div className="text-sm font-medium">
                  {inv.organizationName}
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="capitalize">{inv.organizationType}</span>
                  <span>&middot;</span>
                  <span>
                    Invited by{' '}
                    {isGhostUser(inv.invitedByName) ? (
                      <span className="inline-flex items-center gap-1">
                        <Ghost className="h-3 w-3" />
                        Ghost
                      </span>
                    ) : (
                      inv.invitedByName
                    )}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="capitalize">
                {inv.roleName}
              </Badge>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleReject(inv.id)}
                disabled={actioning === inv.id}
              >
                {actioning === inv.id ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <X className="h-3.5 w-3.5" />
                )}
                Reject
              </Button>
              <Button
                size="sm"
                onClick={() => handleAccept(inv.id)}
                disabled={actioning === inv.id}
              >
                {actioning === inv.id ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Check className="h-3.5 w-3.5" />
                )}
                Accept
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

export function PendingInvitations({
  onAccepted,
}: {
  onAccepted?: () => void
}) {
  const [invitations, setInvitations] = useState<PendingInvitation[]>([])
  const [isPending, setIsPending] = useState(true)

  const fetchInvitations = useCallback(async () => {
    try {
      const res = await fetch('/api/invitations/pending')
      if (!res.ok) return
      const data = await res.json()
      setInvitations(data.invitations ?? [])
    } finally {
      setIsPending(false)
    }
  }, [])

  useEffect(() => {
    void fetchInvitations()
  }, [fetchInvitations])

  const handleAccept = async (id: string) => {
    const res = await fetch(`/api/invitations/${id}/accept`, {
      method: 'POST',
    })
    if (res.ok) {
      setInvitations((prev) => prev.filter((inv) => inv.id !== id))
      onAccepted?.()
    }
  }

  const handleReject = async (id: string) => {
    const res = await fetch(`/api/invitations/${id}/reject`, {
      method: 'POST',
    })
    if (res.ok) {
      setInvitations((prev) => prev.filter((inv) => inv.id !== id))
    }
  }

  if (isPending) return null
  if (invitations.length === 0) return null

  return (
    <PendingInvitationsList
      invitations={invitations}
      onAccept={handleAccept}
      onReject={handleReject}
    />
  )
}
