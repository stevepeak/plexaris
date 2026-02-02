'use client'

import { Building2, Crown, Loader2, Mail, Phone, User } from 'lucide-react'
import { useEffect, useState } from 'react'

import { Badge } from '@/components/ui/badge'
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
import { Textarea } from '@/components/ui/textarea'

export type OrgDetails = {
  id: string
  name: string
  type: 'supplier' | 'horeca'
  description: string | null
  phone: string | null
  email: string | null
  address: string | null
  deliveryAddress: string | null
}

export type Member = {
  id: string
  userId: string
  role: string
  createdAt: string
  userName: string
  userEmail: string
}

export function OrgSettingsFormFields({
  org,
  members,
  isOwner,
  isPending,
  onUpdateOrg,
}: {
  org: OrgDetails | null
  members: Member[]
  isOwner: boolean
  isPending: boolean
  onUpdateOrg?: (
    data: Omit<OrgDetails, 'id' | 'type'>,
  ) => Promise<{ error?: string }>
}) {
  const [name, setName] = useState(org?.name ?? '')
  const [description, setDescription] = useState(org?.description ?? '')
  const [phone, setPhone] = useState(org?.phone ?? '')
  const [email, setEmail] = useState(org?.email ?? '')
  const [address, setAddress] = useState(org?.address ?? '')
  const [deliveryAddress, setDeliveryAddress] = useState(
    org?.deliveryAddress ?? '',
  )

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    if (org) {
      setName(org.name)
      setDescription(org.description ?? '')
      setPhone(org.phone ?? '')
      setEmail(org.email ?? '')
      setAddress(org.address ?? '')
      setDeliveryAddress(org.deliveryAddress ?? '')
    }
  }, [org])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!onUpdateOrg) return
    setIsLoading(true)
    setError(null)
    setSuccess(null)

    const result = await onUpdateOrg({
      name,
      description,
      phone,
      email,
      address,
      deliveryAddress,
    })

    if (result.error) {
      setError(result.error)
    } else {
      setSuccess('Organization details updated')
    }
    setIsLoading(false)
  }

  if (isPending) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="h-5 w-40 animate-pulse rounded bg-muted" />
            <div className="h-4 w-56 animate-pulse rounded bg-muted" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="h-9 animate-pulse rounded bg-muted" />
            <div className="h-9 animate-pulse rounded bg-muted" />
            <div className="h-9 animate-pulse rounded bg-muted" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <div className="h-5 w-32 animate-pulse rounded bg-muted" />
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="h-12 animate-pulse rounded bg-muted" />
            <div className="h-12 animate-pulse rounded bg-muted" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!org) return null

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <CardTitle>Organization details</CardTitle>
            <Badge variant="secondary" className="capitalize">
              {org.type}
            </Badge>
          </div>
          <CardDescription>
            {isOwner
              ? 'Update your organization information'
              : 'View your organization information'}
          </CardDescription>
        </CardHeader>
        <Separator />
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="org-name">Business name</Label>
              <Input
                id="org-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={!isOwner}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="org-description">Description</Label>
              <Textarea
                id="org-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                disabled={!isOwner}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="org-phone">Phone</Label>
                <Input
                  id="org-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={!isOwner}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="org-email">Contact email</Label>
                <Input
                  id="org-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={!isOwner}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="org-address">Business address</Label>
              <Input
                id="org-address"
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                disabled={!isOwner}
              />
            </div>

            {org.type === 'horeca' && (
              <div className="grid gap-2">
                <Label htmlFor="org-delivery-address">Delivery address</Label>
                <Input
                  id="org-delivery-address"
                  type="text"
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  disabled={!isOwner}
                />
              </div>
            )}

            {error && <p className="text-sm text-destructive">{error}</p>}
            {success && (
              <p className="text-sm text-green-600 dark:text-green-400">
                {success}
              </p>
            )}

            {isOwner && onUpdateOrg && (
              <Button type="submit" disabled={isLoading} className="w-fit">
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save changes'
                )}
              </Button>
            )}
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Members</CardTitle>
          <CardDescription>People in this organization</CardDescription>
        </CardHeader>
        <Separator />
        <CardContent className="pt-4">
          {members.length === 0 ? (
            <p className="py-4 text-sm text-muted-foreground">
              No members yet.
            </p>
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
                      <div className="text-sm font-medium">
                        {member.userName}
                      </div>
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
                    {member.role === 'owner' && (
                      <Crown className="mr-1 h-3 w-3" />
                    )}
                    {member.role}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export function OrgSettings({ organizationId }: { organizationId: string }) {
  const [org, setOrg] = useState<OrgDetails | null>(null)
  const [members, setMembers] = useState<Member[]>([])
  const [isOwner, setIsOwner] = useState(false)
  const [isPending, setIsPending] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const [orgRes, membersRes] = await Promise.all([
          fetch(`/api/organizations/${organizationId}`),
          fetch(`/api/organizations/${organizationId}/members`),
        ])

        if (orgRes.ok) {
          const orgData = await orgRes.json()
          setOrg(orgData.organization)
          setIsOwner(orgData.role === 'owner')
        }

        if (membersRes.ok) {
          const membersData = await membersRes.json()
          setMembers(membersData.members)
        }
      } finally {
        setIsPending(false)
      }
    }

    void fetchData()
  }, [organizationId])

  const handleUpdateOrg = async (
    data: Omit<OrgDetails, 'id' | 'type'>,
  ): Promise<{ error?: string }> => {
    const res = await fetch(`/api/organizations/${organizationId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    if (!res.ok) {
      const json = await res.json()
      return { error: json.error ?? 'Failed to update organization' }
    }

    const json = await res.json()
    setOrg(json.organization)
    return {}
  }

  return (
    <OrgSettingsFormFields
      org={org}
      members={members}
      isOwner={isOwner}
      isPending={isPending}
      onUpdateOrg={isOwner ? handleUpdateOrg : undefined}
    />
  )
}
