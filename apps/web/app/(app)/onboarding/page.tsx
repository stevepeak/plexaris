'use client'

import { Building2, Store, UtensilsCrossed } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

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
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

type OrgType = 'supplier' | 'horeca'

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState<'type' | 'details'>('type')
  const [orgType, setOrgType] = useState<OrgType | null>(null)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [address, setAddress] = useState('')
  const [deliveryAddress, setDeliveryAddress] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleTypeSelect = (type: OrgType) => {
    setOrgType(type)
    setStep('details')
  }

  const handleBack = () => {
    setStep('type')
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!orgType) return

    setIsLoading(true)
    setError(null)

    const response = await fetch('/api/organizations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        type: orgType,
        description: description || undefined,
        phone: phone || undefined,
        email: email || undefined,
        address: address || undefined,
        deliveryAddress: deliveryAddress || undefined,
      }),
    })

    if (!response.ok) {
      const data = await response.json()
      setError(data.error ?? 'Failed to create organization')
      setIsLoading(false)
      return
    }

    router.push('/dashboard')
  }

  if (step === 'type') {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-lg">
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-semibold">Create your organization</h1>
            <p className="mt-2 text-muted-foreground">
              What type of business are you?
            </p>
          </div>
          <div className="grid gap-4">
            <button
              type="button"
              onClick={() => handleTypeSelect('supplier')}
              className={cn(
                'flex items-start gap-4 rounded-lg border p-4 text-left transition-colors hover:border-primary hover:bg-accent',
              )}
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <Store className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="font-medium">Supplier</div>
                <div className="mt-1 text-sm text-muted-foreground">
                  I sell food products to restaurants, hotels, and catering
                  businesses
                </div>
              </div>
            </button>
            <button
              type="button"
              onClick={() => handleTypeSelect('horeca')}
              className={cn(
                'flex items-start gap-4 rounded-lg border p-4 text-left transition-colors hover:border-primary hover:bg-accent',
              )}
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <UtensilsCrossed className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="font-medium">Horeca</div>
                <div className="mt-1 text-sm text-muted-foreground">
                  I run a restaurant, hotel, or catering business and buy from
                  suppliers
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              {orgType === 'supplier' ? (
                <Store className="h-5 w-5 text-primary" />
              ) : (
                <UtensilsCrossed className="h-5 w-5 text-primary" />
              )}
            </div>
            <div>
              <CardTitle>
                {orgType === 'supplier' ? 'Supplier' : 'Horeca'} details
              </CardTitle>
              <CardDescription>
                Tell us about your{' '}
                {orgType === 'supplier'
                  ? 'supply business'
                  : 'restaurant or hotel'}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Business name</Label>
              <Input
                id="name"
                type="text"
                placeholder={
                  orgType === 'supplier'
                    ? 'e.g. Fresh Foods BV'
                    : 'e.g. Restaurant De Kas'
                }
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">
                Description{' '}
                <span className="text-muted-foreground">(optional)</span>
              </Label>
              <Textarea
                id="description"
                placeholder="A short description of your business"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="phone">
                  Phone{' '}
                  <span className="text-muted-foreground">(optional)</span>
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+31 6 1234 5678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">
                  Contact email{' '}
                  <span className="text-muted-foreground">(optional)</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="info@business.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="address">
                Business address{' '}
                <span className="text-muted-foreground">(optional)</span>
              </Label>
              <Input
                id="address"
                type="text"
                placeholder="Keizersgracht 123, Amsterdam"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>
            {orgType === 'horeca' && (
              <div className="grid gap-2">
                <Label htmlFor="deliveryAddress">
                  Delivery address{' '}
                  <span className="text-muted-foreground">(optional)</span>
                </Label>
                <Input
                  id="deliveryAddress"
                  type="text"
                  placeholder="Same as business address or enter a different one"
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                />
              </div>
            )}

            {error && <p className="text-sm text-destructive">{error}</p>}

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                disabled={isLoading}
              >
                Back
              </Button>
              <Button type="submit" disabled={isLoading} className="flex-1">
                {isLoading ? (
                  <>
                    <Building2 className="h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create organization'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
