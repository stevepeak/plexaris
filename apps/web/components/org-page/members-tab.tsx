'use client'

import { Crown, Mail, User } from 'lucide-react'
import { useEffect, useState } from 'react'

import { InviteMembers } from '@/components/invite-members'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

type Member = {
  id: string
  userId: string
  role: string
  createdAt: string
  userName: string
  userEmail: string
}

export function MembersTab({
  organizationId,
  isOwner,
}: {
  organizationId: string
  isOwner: boolean
}) {
  const [members, setMembers] = useState<Member[]>([])
  const [isPending, setIsPending] = useState(true)

  useEffect(() => {
    void fetch(`/api/organizations/${organizationId}/members`)
      .then((res) => (res.ok ? res.json() : { members: [] }))
      .then((data) => setMembers(data.members ?? []))
      .finally(() => setIsPending(false))
  }, [organizationId])

  return (
    <div>
      <h2 className="text-lg font-semibold">Members</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        People in this organization
      </p>
      <Separator className="my-6" />

      {isPending ? (
        <div className="space-y-3">
          <div className="h-12 animate-pulse rounded bg-muted" />
          <div className="h-12 animate-pulse rounded bg-muted" />
        </div>
      ) : members.length === 0 ? (
        <p className="py-4 text-sm text-muted-foreground">No members yet.</p>
      ) : (
        <div className="grid gap-3">
          {members.map((member) => (
            <div
              key={member.id}
              className="flex items-center justify-between rounded-md border px-3 py-2"
            >
              <div className="flex items-center gap-3">
                <User className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="text-sm font-medium">{member.userName}</div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Mail className="h-3 w-3" />
                    {member.userEmail}
                  </div>
                </div>
              </div>
              <Badge
                variant={member.role === 'owner' ? 'default' : 'secondary'}
                className="capitalize"
              >
                {member.role === 'owner' && <Crown className="mr-1 h-3 w-3" />}
                {member.role}
              </Badge>
            </div>
          ))}
        </div>
      )}

      <Separator className="my-6" />
      <InviteMembers organizationId={organizationId} isOwner={isOwner} />
    </div>
  )
}
