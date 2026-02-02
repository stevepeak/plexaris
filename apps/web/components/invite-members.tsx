'use client'

import { Clock, Loader2, Mail, Send, UserPlus, X } from 'lucide-react'
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'

export type Invitation = {
  id: string
  email: string
  role: string
  createdAt: string
  expiresAt: string
  acceptedAt: string | null
  rejectedAt: string | null
  invitedByName: string
}

function getStatus(
  inv: Invitation,
): 'pending' | 'accepted' | 'rejected' | 'expired' {
  if (inv.acceptedAt) return 'accepted'
  if (inv.rejectedAt) return 'rejected'
  if (new Date(inv.expiresAt) < new Date()) return 'expired'
  return 'pending'
}

function StatusBadge({ status }: { status: ReturnType<typeof getStatus> }) {
  const variants: Record<
    typeof status,
    'default' | 'secondary' | 'destructive' | 'outline'
  > = {
    pending: 'outline',
    accepted: 'default',
    rejected: 'destructive',
    expired: 'secondary',
  }
  return (
    <Badge variant={variants[status]} className="capitalize">
      {status}
    </Badge>
  )
}

export function InviteMembersList({
  invitations,
  isOwner,
  isPending,
  onInvite,
}: {
  invitations: Invitation[]
  isOwner: boolean
  isPending: boolean
  onInvite?: (email: string) => Promise<{ error?: string }>
}) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!onInvite) return
    setIsSending(true)
    setError(null)
    setSuccess(null)

    const result = await onInvite(email)
    if (result.error) {
      setError(result.error)
      setIsSending(false)
      return
    }

    setSuccess(`Invitation sent to ${email}`)
    setEmail('')
    setIsSending(false)
    setDialogOpen(false)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Invitations</CardTitle>
            <CardDescription>
              Manage team invitations for this organization
            </CardDescription>
          </div>
          {isOwner && onInvite && (
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <UserPlus className="h-4 w-4" />
                  Invite member
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Invite a team member</DialogTitle>
                  <DialogDescription>
                    Send an invitation by email. They&apos;ll be able to accept
                    or reject it from their dashboard.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSend} className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="invite-email">Email address</Label>
                    <Input
                      id="invite-email"
                      type="email"
                      placeholder="colleague@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  {error && <p className="text-sm text-destructive">{error}</p>}
                  <Button type="submit" disabled={isSending}>
                    {isSending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        Send invitation
                      </>
                    )}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardHeader>
      {success && (
        <div className="mx-6 mb-4 flex items-center justify-between rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700 dark:border-green-800 dark:bg-green-950 dark:text-green-300">
          <span>{success}</span>
          <button
            type="button"
            onClick={() => setSuccess(null)}
            className="ml-2 text-green-500 hover:text-green-700"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
      <Separator />
      <CardContent className="pt-4">
        {isPending ? (
          <div className="flex items-center gap-2 py-4 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading invitations...
          </div>
        ) : invitations.length === 0 ? (
          <p className="py-4 text-sm text-muted-foreground">
            No invitations yet.{' '}
            {isOwner && 'Invite team members to collaborate.'}
          </p>
        ) : (
          <div className="grid gap-3">
            {invitations.map((inv) => {
              const status = getStatus(inv)
              return (
                <div
                  key={inv.id}
                  className="flex items-center justify-between rounded-md border px-3 py-2"
                >
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="text-sm font-medium">{inv.email}</div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        Invited by {inv.invitedByName}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="capitalize">
                      {inv.role}
                    </Badge>
                    <StatusBadge status={status} />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export function InviteMembers({
  organizationId,
  isOwner,
}: {
  organizationId: string
  isOwner: boolean
}) {
  const [invitations, setInvitations] = useState<Invitation[]>([])
  const [isPending, setIsPending] = useState(true)

  const fetchInvitations = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/invitations?organizationId=${organizationId}`,
      )
      if (!res.ok) return
      const data = await res.json()
      setInvitations(data.invitations ?? [])
    } finally {
      setIsPending(false)
    }
  }, [organizationId])

  useEffect(() => {
    void fetchInvitations()
  }, [fetchInvitations])

  const handleInvite = async (email: string): Promise<{ error?: string }> => {
    const res = await fetch('/api/invitations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, organizationId, role: 'member' }),
    })

    if (!res.ok) {
      const data = await res.json()
      return { error: data.error ?? 'Failed to send invitation' }
    }

    void fetchInvitations()
    return {}
  }

  return (
    <InviteMembersList
      invitations={invitations}
      isOwner={isOwner}
      isPending={isPending}
      onInvite={handleInvite}
    />
  )
}
