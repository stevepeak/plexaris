'use client'

import { Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'

import { ImageUpload } from '@/components/image-upload'
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

export function SettingsTab({ organizationId }: { organizationId: string }) {
  const [org, setOrg] = useState<OrgDetails | null>(null)
  const [canEdit, setCanEdit] = useState(false)
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

  useEffect(() => {
    void fetch(`/api/organizations/${organizationId}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.organization) {
          const o = data.organization as OrgDetails
          setOrg(o)
          const role = data.role as {
            isSystem: boolean
            permissions: string[]
          }
          setCanEdit(
            role.isSystem || role.permissions.includes('edit_org_details'),
          )
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
    if (!org) return { error: 'Organization not loaded' }

    let newLogoUrl: string | null = null
    if (file) {
      const { urls, error } = await uploadFiles([file], 'logos')
      if (error || !urls[0]) return { error: error ?? 'Upload failed' }
      newLogoUrl = urls[0]
    }

    const res = await fetch(`/api/organizations/${organizationId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: org.name,
        description: org.description,
        phone: org.phone,
        email: org.email,
        address: org.address,
        deliveryAddress: org.deliveryAddress,
        deliveryAreas: org.deliveryAreas,
        logoUrl: newLogoUrl,
      }),
    })

    if (!res.ok) {
      const json = await res.json()
      return { error: json.error ?? 'Failed to save logo' }
    }

    const json = await res.json()
    setOrg(json.organization)
    return {}
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
      <form onSubmit={handleSubmit} className="grid gap-8">
        {/* Public profile section */}
        <div>
          <h2 className="text-lg font-semibold">Public profile</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            This information is visible to customers in the ordering experience.
          </p>
          <Separator className="my-6" />

          <div className="grid gap-4">
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
                disabled={!canEdit}
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
                disabled={!canEdit}
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
                disabled={!canEdit}
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
                  disabled={!canEdit}
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
                  disabled={!canEdit}
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
                disabled={!canEdit}
              />
            </div>
          </div>
        </div>

        {/* Delivery section */}
        <div>
          <h2 className="text-lg font-semibold">Delivery</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            This information is shared with delivery companies.
          </p>
          <Separator className="my-6" />

          <div className="grid gap-4">
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
                  disabled={!canEdit}
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
                  disabled={!canEdit}
                />
              </div>
            )}
          </div>
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}
        {success && (
          <p className="text-sm text-green-600 dark:text-green-400">
            {success}
          </p>
        )}

        {canEdit && (
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
    </div>
  )
}
