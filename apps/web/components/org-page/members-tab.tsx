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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { hasPermission } from '@/lib/permissions-client'

type Member = {
  id: string
  userId: string
  roleId: string
  roleName: string
  isSystemRole: boolean
  createdAt: string
  userName: string
  userEmail: string
  userImage: string | null
  lastLoginAt: string | null
}

type Invitation = {
  id: string
  email: string
  roleName: string
  createdAt: string
  invitedByName: string
}

type Role = {
  id: string
  name: string
  isSystem: boolean
  permissions: string[]
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
  permissions,
  isAdmin,
}: {
  organizationId: string
  permissions: string[]
  isAdmin: boolean
}) {
  const [members, setMembers] = useState<Member[]>([])
  const [invitations, setInvitations] = useState<Invitation[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const [isPending, setIsPending] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [selectedRoleId, setSelectedRoleId] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [roleChangeError, setRoleChangeError] = useState<string | null>(null)

  const canInvite = isAdmin || hasPermission(permissions, 'invite_members')
  const canManageRoles = isAdmin || hasPermission(permissions, 'manage_roles')

  const fetchData = useCallback(async () => {
    try {
      const [membersRes, rolesRes] = await Promise.all([
        fetch(`/api/organizations/${organizationId}/members`),
        fetch(`/api/organizations/${organizationId}/roles`),
      ])
      if (membersRes.ok) {
        const data = await membersRes.json()
        setMembers(data.members ?? [])
        setInvitations(data.invitations ?? [])
      }
      if (rolesRes.ok) {
        const data = await rolesRes.json()
        setRoles(data.roles ?? [])
        // Default invite role to Member role
        const memberRole = (data.roles ?? []).find(
          (r: Role) => r.name === 'Member',
        )
        if (memberRole && !selectedRoleId) {
          setSelectedRoleId(memberRole.id)
        }
      }
    } finally {
      setIsPending(false)
    }
  }, [organizationId, selectedRoleId])

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
      body: JSON.stringify({
        email,
        organizationId,
        roleId: selectedRoleId,
      }),
    })

    if (!res.ok) {
      const text = await res.text()
      try {
        const data = JSON.parse(text)
        setError(data.error ?? 'Failed to send invitation')
      } catch {
        setError('Failed to send invitation')
      }
      setIsSending(false)
      return
    }

    setEmail('')
    setIsSending(false)
    setDialogOpen(false)
    void fetchData()
  }

  const handleRoleChange = async (membershipId: string, roleId: string) => {
    setRoleChangeError(null)
    const res = await fetch(
      `/api/organizations/${organizationId}/members/${membershipId}/role`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roleId }),
      },
    )

    if (!res.ok) {
      const data = await res.json()
      setRoleChangeError(data.error ?? 'Failed to change role')
      return
    }

    void fetchData()
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Team</h2>
        {canInvite && (
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
                <div className="grid gap-2">
                  <Label htmlFor="invite-role">Role</Label>
                  <Select
                    value={selectedRoleId}
                    onValueChange={setSelectedRoleId}
                  >
                    <SelectTrigger id="invite-role">
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map((role) => (
                        <SelectItem key={role.id} value={role.id}>
                          {role.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {error && <p className="text-sm text-destructive">{error}</p>}
                <Button type="submit" disabled={isSending || !selectedRoleId}>
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

      {roleChangeError && (
        <p className="mb-4 text-sm text-destructive">{roleChangeError}</p>
      )}

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
                <div className="flex items-center gap-2">
                  {canManageRoles ? (
                    <Select
                      value={member.roleId}
                      onValueChange={(value) =>
                        handleRoleChange(member.id, value)
                      }
                    >
                      <SelectTrigger className="h-7 w-auto gap-1.5 border-none px-2 text-xs shadow-none">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {roles.map((role) => (
                          <SelectItem key={role.id} value={role.id}>
                            {role.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Badge
                      variant={member.isSystemRole ? 'default' : 'secondary'}
                    >
                      {member.isSystemRole && (
                        <Crown className="mr-1 h-3 w-3" />
                      )}
                      {member.roleName}
                    </Badge>
                  )}
                </div>
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
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{inv.roleName}</Badge>
                  <Badge variant="outline">Invited</Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
