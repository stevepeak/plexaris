'use client'

import { isGhostUser } from '@app/utils'
import { Crown, Ghost, Loader2, Mail, Send, UserPlus } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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

type Member = {
  id: string
  userId: string
  role: string
  createdAt: string
  userName: string
  userEmail: string
  userImage: string | null
  lastLoginAt: string | null
}

type Invitation = {
  id: string
  email: string
  role: string
  createdAt: string
  invitedByName: string
}

function timeAgo(date: string): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d ago`
  const months = Math.floor(days / 30)
  return `${months}mo ago`
}

export function MembersTab({
  organizationId,
  isOwner,
}: {
  organizationId: string
  isOwner: boolean
}) {
  const [members, setMembers] = useState<Member[]>([])
  const [invitations, setInvitations] = useState<Invitation[]>([])
  const [isPending, setIsPending] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch(`/api/organizations/${organizationId}/members`)
      if (!res.ok) return
      const data = await res.json()
      setMembers(data.members ?? [])
      setInvitations(data.invitations ?? [])
    } finally {
      setIsPending(false)
    }
  }, [organizationId])

  useEffect(() => {
    void fetchData()
  }, [fetchData])

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSending(true)
    setError(null)

    const res = await fetch('/api/invitations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, organizationId, role: 'member' }),
    })

    if (!res.ok) {
      const data = await res.json()
      setError(data.error ?? 'Failed to send invitation')
      setIsSending(false)
      return
    }

    setEmail('')
    setIsSending(false)
    setDialogOpen(false)
    void fetchData()
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Team</h2>
        {isOwner && (
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
                  Send an invitation by email. They&apos;ll be able to accept or
                  reject it from their dashboard.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleInvite} className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="invite-email">Email address</Label>
                  <Input
                    id="invite-email"
                    type="email"
                    placeholder="colleague@company.com"
                    autoComplete="off"
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

      <Separator className="my-6" />

      <div>
        {isPending ? (
          <div className="space-y-3">
            <div className="h-12 animate-pulse rounded bg-muted" />
            <div className="h-12 animate-pulse rounded bg-muted" />
          </div>
        ) : members.length === 0 && invitations.length === 0 ? (
          <p className="py-4 text-sm text-muted-foreground">
            No team members yet.
          </p>
        ) : (
          <div className="grid gap-3">
            {members.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between rounded-md border px-3 py-2"
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    {!isGhostUser(member.userName) && member.userImage && (
                      <AvatarImage
                        src={member.userImage}
                        alt={member.userName}
                      />
                    )}
                    <AvatarFallback className="text-xs">
                      {isGhostUser(member.userName) ? (
                        <Ghost className="h-4 w-4" />
                      ) : (
                        member.userName
                          .split(' ')
                          .map((n) => n[0])
                          .join('')
                          .toUpperCase()
                          .slice(0, 2)
                      )}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div
                      className={`text-sm font-medium ${isGhostUser(member.userName) ? 'text-muted-foreground' : ''}`}
                    >
                      {member.userName}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      {!isGhostUser(member.userName) && (
                        <>
                          <Mail className="h-3 w-3" />
                          {member.userEmail}
                        </>
                      )}
                      {member.lastLoginAt && (
                        <>
                          {!isGhostUser(member.userName) && (
                            <span className="text-muted-foreground/50">
                              &middot;
                            </span>
                          )}
                          Last login {timeAgo(member.lastLoginAt)}
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <Badge
                  variant={member.role === 'owner' ? 'default' : 'secondary'}
                  className="capitalize"
                >
                  {member.role === 'owner' && (
                    <Crown className="mr-1 h-3 w-3" />
                  )}
                  {member.role}
                </Badge>
              </div>
            ))}
            {invitations.map((inv) => (
              <div
                key={inv.id}
                className="flex items-center justify-between rounded-md border border-dashed px-3 py-2"
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs">
                      <Mail className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="text-sm font-medium">{inv.email}</div>
                    <div className="text-xs text-muted-foreground">
                      Invited by {inv.invitedByName}
                    </div>
                  </div>
                </div>
                <Badge variant="outline">Invited</Badge>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
