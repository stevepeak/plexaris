'use client'

import { Building2, Mail, MapPin, Phone } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

interface SupplierProfile {
  id: string
  name: string
  type: string
  status: string
  description: string | null
  logoUrl: string | null
  phone: string | null
  email: string | null
  address: string | null
}

export type SupplierProfileCardState =
  | { status: 'loading' }
  | { status: 'loaded'; supplier: SupplierProfile }
  | { status: 'error'; message: string }

interface SupplierProfileCardProps {
  state: SupplierProfileCardState
}

export function SupplierProfileCard({ state }: SupplierProfileCardProps) {
  if (state.status === 'loading') {
    return (
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="flex items-start gap-4">
            <Skeleton className="h-16 w-16 rounded-lg" />
            <div className="grid gap-2">
              <Skeleton className="h-7 w-48" />
              <Skeleton className="h-5 w-20" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <div className="grid gap-2">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-4 w-56" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (state.status === 'error') {
    return (
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <Building2 className="h-6 w-6 text-muted-foreground" />
          </div>
          <CardTitle className="text-xl">Supplier not found</CardTitle>
          <p className="text-sm text-muted-foreground">{state.message}</p>
        </CardHeader>
      </Card>
    )
  }

  const { supplier } = state
  const hasContactInfo = supplier.email || supplier.phone || supplier.address

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <div className="flex items-start gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-muted">
            <Building2 className="h-8 w-8 text-muted-foreground" />
          </div>
          <div className="grid gap-1">
            <CardTitle className="text-2xl">{supplier.name}</CardTitle>
            <div className="flex gap-2">
              <Badge variant="secondary">{supplier.type}</Badge>
              {supplier.status === 'unclaimed' && (
                <Badge variant="outline">Unclaimed</Badge>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="grid gap-6">
        {supplier.description && (
          <p className="text-muted-foreground">{supplier.description}</p>
        )}

        {hasContactInfo && (
          <div className="grid gap-3">
            <h3 className="text-sm font-medium">Contact Information</h3>
            <div className="grid gap-2 text-sm">
              {supplier.email && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-4 w-4 shrink-0" />
                  <span>{supplier.email}</span>
                </div>
              )}
              {supplier.phone && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="h-4 w-4 shrink-0" />
                  <span>{supplier.phone}</span>
                </div>
              )}
              {supplier.address && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4 shrink-0" />
                  <span>{supplier.address}</span>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="grid gap-3">
          <h3 className="text-sm font-medium">Products</h3>
          <p className="text-sm text-muted-foreground">
            No products listed yet.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
