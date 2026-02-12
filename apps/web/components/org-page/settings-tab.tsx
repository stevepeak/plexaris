'use client'

import { Loader2, TriangleAlert } from 'lucide-react'
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
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { uploadFiles } from '@/lib/upload'

type OrgDetails = {
  id: string
  name: string
  type: 'supplier' | 'horeca'
  description: string | null
  logoUrl: string | null
  phone: string | null
  email: string | null
  address: string | null
  deliveryAddress: string | null
  deliveryAreas: string | null
}

export function SettingsTab({
  organizationId,
  onOrgLeft,
  onOrgArchived,
}: {
  organizationId: string
  onOrgLeft?: () => void
  onOrgArchived?: () => void
}) {
  const [org, setOrg] = useState<OrgDetails | null>(null)
  const [isOwner, setIsOwner] = useState(false)
  const [isPending, setIsPending] = useState(true)

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [address, setAddress] = useState('')
  const [deliveryAddress, setDeliveryAddress] = useState('')
  const [deliveryAreas, setDeliveryAreas] = useState('')

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [dangerLoading, setDangerLoading] = useState(false)
  const [dangerError, setDangerError] = useState<string | null>(null)

  useEffect(() => {
    void fetch(`/api/organizations/${organizationId}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.organization) {
          const o = data.organization as OrgDetails
          setOrg(o)
          setIsOwner(data.role === 'owner')
          setName(o.name)
          setDescription(o.description ?? '')
          setPhone(o.phone ?? '')
          setEmail(o.email ?? '')
          setAddress(o.address ?? '')
          setDeliveryAddress(o.deliveryAddress ?? '')
          setDeliveryAreas(o.deliveryAreas ?? '')
        }
      })
      .finally(() => setIsPending(false))
  }, [organizationId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setSuccess(null)

    const res = await fetch(`/api/organizations/${organizationId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        description,
        logoUrl: org?.logoUrl ?? null,
        phone,
        email,
        address,
        deliveryAddress,
        deliveryAreas,
      }),
    })

    if (!res.ok) {
      const json = await res.json()
      setError(json.error ?? 'Failed to update organization')
    } else {
      const json = await res.json()
      setOrg(json.organization)
      setSuccess('Organization details updated')
    }
    setIsLoading(false)
  }

  const handleUpdateImage = async (
    file: File | null,
  ): Promise<{ error?: string }> => {
    if (!file) return {}
    const { urls, error } = await uploadFiles([file], 'logos')
    if (error || !urls[0]) return { error: error ?? 'Upload failed' }
    setOrg((prev) => (prev ? { ...prev, logoUrl: urls[0] } : prev))
    return {}
  }

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
        <div className="h-9 animate-pulse rounded bg-muted" />
        <div className="h-9 animate-pulse rounded bg-muted" />
        <div className="h-9 animate-pulse rounded bg-muted" />
      </div>
    )
  }

  if (!org) return null

  return (
    <div>
      <div className="flex items-center gap-3">
        <h2 className="text-lg font-semibold">Organization details</h2>
        <Badge variant="secondary" className="capitalize">
          {org.type}
        </Badge>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        {isOwner
          ? 'Update your organization information'
          : 'View your organization information'}
      </p>
      <Separator className="my-6" />

      <form onSubmit={handleSubmit} className="grid gap-4">
        <div className="grid gap-2">
          <Label>Logo</Label>
          <ImageUpload
            value={org.logoUrl}
            fallback={org.name
              .split(' ')
              .map((part) => part[0])
              .join('')
              .toUpperCase()
              .slice(0, 2)}
            variant="square"
            alt={`${org.name} logo`}
            disabled={!isOwner}
            onUpload={handleUpdateImage}
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="org-name">Business name</Label>
          <Input
            id="org-name"
            type="text"
            autoComplete="organization"
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
            autoComplete="off"
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
              autoComplete="off"
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
              autoComplete="off"
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
            autoComplete="off"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            disabled={!isOwner}
          />
        </div>

        {org.type === 'supplier' && (
          <div className="grid gap-2">
            <Label htmlFor="org-delivery-areas">Delivery areas</Label>
            <Textarea
              id="org-delivery-areas"
              autoComplete="off"
              placeholder="e.g. Amsterdam, Rotterdam, The Hague"
              value={deliveryAreas}
              onChange={(e) => setDeliveryAreas(e.target.value)}
              rows={2}
              disabled={!isOwner}
            />
          </div>
        )}

        {org.type === 'horeca' && (
          <div className="grid gap-2">
            <Label htmlFor="org-delivery-address">Delivery address</Label>
            <Input
              id="org-delivery-address"
              type="text"
              autoComplete="off"
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

        {isOwner && (
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

      {/* Danger zone */}
      <Separator className="my-8" />
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

          {!isOwner && (
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
                      You will lose access to {org.name}. You will need a new
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

          {isOwner && (
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
                      {org.name} will be permanently archived. All members will
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
    </div>
  )
}
