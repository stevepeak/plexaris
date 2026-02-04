'use client'

import {
  LogOut,
  Mail,
  MapPin,
  Phone,
  Settings,
  ShoppingCart,
} from 'lucide-react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'

import { InviteMembers } from '@/components/invite-members'
import { OrgSwitcher, useActiveOrg } from '@/components/org-switcher'
import { PendingInvitations } from '@/components/pending-invitations'
import { ProductForm } from '@/components/product-form'
import { type Product, ProductList } from '@/components/product-list'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { authClient } from '@/lib/auth-client'
import { trpc } from '@/lib/trpc'

function getInitials(name: string | undefined): string {
  if (!name) {
    return '?'
  }
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

type OrgDetails = {
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

const statusConfig: Record<
  string,
  {
    label: string
    variant: 'default' | 'secondary' | 'outline' | 'destructive'
  }
> = {
  draft: { label: 'Draft', variant: 'secondary' },
  submitted: { label: 'Submitted', variant: 'default' },
  confirmed: { label: 'Confirmed', variant: 'outline' },
  delivered: { label: 'Delivered', variant: 'outline' },
  cancelled: { label: 'Cancelled', variant: 'destructive' },
}

function OrdersSection({ organizationId }: { organizationId: string }) {
  const { data: orders, isPending } = trpc.order.list.useQuery({
    organizationId,
  })

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Orders
            </CardTitle>
            <CardDescription>
              Place and manage orders from your suppliers
            </CardDescription>
          </div>
          <Button asChild>
            <Link href="/order/new">New Order</Link>
          </Button>
        </div>
      </CardHeader>
      <Separator />
      <CardContent className="p-0">
        {isPending ? (
          <div className="space-y-2 p-6">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : !orders?.length ? (
          <div className="flex items-center justify-center py-8">
            <p className="text-sm text-muted-foreground">
              No orders yet. Start a new order to browse products from your
              suppliers.
            </p>
          </div>
        ) : (
          <div className="divide-y">
            {orders.map((order) => {
              const config = statusConfig[order.status] ?? statusConfig.draft
              return (
                <Link
                  key={order.id}
                  href={`/order/${order.id}`}
                  className="flex items-center justify-between px-6 py-3 transition-colors hover:bg-muted/50"
                >
                  <div className="flex items-center gap-3">
                    <Badge variant={config.variant}>{config.label}</Badge>
                    <span className="text-sm">
                      {order.itemCount}{' '}
                      {order.itemCount === 1 ? 'item' : 'items'}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      by {order.createdByName}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(order.updatedAt).toLocaleDateString()}
                  </span>
                </Link>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default function OrgPage() {
  const router = useRouter()
  const { orgId } = useParams<{ orgId: string }>()
  const { data: session, isPending } = authClient.useSession()
  const [refreshKey, setRefreshKey] = useState(0)
  const {
    organizations,
    activeOrg,
    switchOrg,
    isPending: orgsPending,
  } = useActiveOrg(refreshKey)

  const [orgDetails, setOrgDetails] = useState<OrgDetails | null>(null)

  // Sync URL orgId with active org state
  useEffect(() => {
    if (orgsPending || !organizations.length) return
    const urlOrg = organizations.find((o) => o.id === orgId)
    if (urlOrg && activeOrg?.id !== orgId) {
      switchOrg(urlOrg)
    }
  }, [orgId, organizations, activeOrg?.id, switchOrg, orgsPending])

  // Fetch full org details
  useEffect(() => {
    setOrgDetails(null)
    if (!orgId) return
    void fetch(`/api/organizations/${orgId}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.organization) setOrgDetails(data.organization)
      })
  }, [orgId])

  const [products, setProducts] = useState<Product[]>([])
  const [archivedProducts, setArchivedProducts] = useState<Product[]>([])
  const [productsPending, setProductsPending] = useState(false)
  const [productView, setProductView] = useState<
    'list' | 'add' | { editing: Product }
  >('list')

  const refreshProducts = useCallback(() => {
    if (!activeOrg || activeOrg.type !== 'supplier') {
      setProducts([])
      setArchivedProducts([])
      return
    }
    setProductsPending(true)
    void Promise.all([
      fetch(`/api/products?organizationId=${activeOrg.id}`)
        .then((res) => (res.ok ? res.json() : { products: [] }))
        .then((data) => setProducts(data.products ?? [])),
      fetch(`/api/products?organizationId=${activeOrg.id}&archived=true`)
        .then((res) => (res.ok ? res.json() : { products: [] }))
        .then((data) => setArchivedProducts(data.products ?? [])),
    ]).finally(() => setProductsPending(false))
  }, [activeOrg])

  useEffect(() => {
    setProductView('list')
    refreshProducts()
  }, [refreshProducts])

  const handleCreateProduct = async (data: {
    name: string
    description: string
    price: string
    unit: string
    category: string
  }): Promise<{ error?: string }> => {
    if (!activeOrg) return { error: 'No organization selected' }
    const res = await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, organizationId: activeOrg.id }),
    })
    if (!res.ok) {
      const json = await res.json()
      return { error: json.error ?? 'Failed to create product' }
    }
    refreshProducts()
    setProductView('list')
    return {}
  }

  const handleUpdateProduct = async (
    productId: string,
    data: {
      name: string
      description: string
      price: string
      unit: string
      category: string
    },
  ): Promise<{ error?: string }> => {
    const res = await fetch(`/api/products/${productId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!res.ok) {
      const json = await res.json()
      return { error: json.error ?? 'Failed to update product' }
    }
    refreshProducts()
    setProductView('list')
    return {}
  }

  const handleArchiveRestore = async (product: Product) => {
    await fetch(`/api/products/${product.id}/archive`, { method: 'POST' })
    refreshProducts()
  }

  const handleInvitationAccepted = useCallback(() => {
    setRefreshKey((k) => k + 1)
  }, [])

  const handleSignOut = async () => {
    await authClient.signOut()
    router.push('/login')
  }

  const orgNotFound =
    !orgsPending &&
    organizations.length > 0 &&
    !organizations.find((o) => o.id === orgId)

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-lg font-semibold">
              Plexaris
            </Link>
            <Separator orientation="vertical" className="h-6" />
            <OrgSwitcher
              organizations={organizations}
              activeOrg={activeOrg}
              onSwitch={switchOrg}
              isPending={orgsPending}
            />
          </div>
          {isPending ? (
            <Skeleton className="h-8 w-8 rounded-full" />
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs">
                      {getInitials(session?.user.name)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col gap-1">
                    <p className="text-sm font-medium">{session?.user.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {session?.user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/settings/profile">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-4xl space-y-6 px-4 py-8">
        {orgNotFound ? (
          <p className="text-sm text-muted-foreground">
            Organization not found.
          </p>
        ) : (
          <>
            <PendingInvitations onAccepted={handleInvitationAccepted} />

            {activeOrg && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-start gap-4">
                      <Avatar className="h-12 w-12 rounded-lg">
                        {orgDetails?.logoUrl && (
                          <AvatarImage
                            src={orgDetails.logoUrl}
                            alt={`${activeOrg.name} logo`}
                            className="object-cover"
                          />
                        )}
                        <AvatarFallback className="rounded-lg text-sm font-medium">
                          {getInitials(activeOrg.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="grid gap-1">
                        <CardTitle>{activeOrg.name}</CardTitle>
                        <div className="flex gap-2">
                          <Badge variant="secondary" className="capitalize">
                            {activeOrg.type}
                          </Badge>
                          <Badge variant="outline" className="capitalize">
                            {activeOrg.role}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/orgs/${orgId}/settings`}>
                        <Settings className="mr-2 h-4 w-4" />
                        Settings
                      </Link>
                    </Button>
                  </div>
                </CardHeader>
                {orgDetails &&
                  (orgDetails.description ||
                    orgDetails.email ||
                    orgDetails.phone ||
                    orgDetails.address ||
                    orgDetails.deliveryAreas ||
                    orgDetails.deliveryAddress) && (
                    <CardContent className="grid gap-4">
                      {orgDetails.description && (
                        <p className="text-sm text-muted-foreground">
                          {orgDetails.description}
                        </p>
                      )}
                      {(orgDetails.email ||
                        orgDetails.phone ||
                        orgDetails.address) && (
                        <div className="grid gap-2 text-sm">
                          {orgDetails.email && (
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Mail className="h-4 w-4 shrink-0" />
                              <span>{orgDetails.email}</span>
                            </div>
                          )}
                          {orgDetails.phone && (
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Phone className="h-4 w-4 shrink-0" />
                              <span>{orgDetails.phone}</span>
                            </div>
                          )}
                          {orgDetails.address && (
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <MapPin className="h-4 w-4 shrink-0" />
                              <span>{orgDetails.address}</span>
                            </div>
                          )}
                        </div>
                      )}
                      {orgDetails.deliveryAreas && (
                        <div className="grid gap-1">
                          <h3 className="text-sm font-medium">
                            Delivery Areas
                          </h3>
                          <div className="flex items-start gap-2 text-sm text-muted-foreground">
                            <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                            <span>{orgDetails.deliveryAreas}</span>
                          </div>
                        </div>
                      )}
                      {orgDetails.deliveryAddress && (
                        <div className="grid gap-1">
                          <h3 className="text-sm font-medium">
                            Delivery Address
                          </h3>
                          <div className="flex items-start gap-2 text-sm text-muted-foreground">
                            <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                            <span>{orgDetails.deliveryAddress}</span>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  )}
              </Card>
            )}

            {activeOrg?.type === 'horeca' && (
              <OrdersSection organizationId={activeOrg.id} />
            )}

            {activeOrg && (
              <InviteMembers
                organizationId={activeOrg.id}
                isOwner={activeOrg.role === 'owner'}
              />
            )}

            {activeOrg?.type === 'supplier' &&
              (productView === 'add' ? (
                <ProductForm
                  onSubmit={handleCreateProduct}
                  onCancel={() => setProductView('list')}
                />
              ) : productView !== 'list' && 'editing' in productView ? (
                <ProductForm
                  product={productView.editing}
                  onSubmit={(data) =>
                    handleUpdateProduct(productView.editing.id, data)
                  }
                  onCancel={() => setProductView('list')}
                />
              ) : (
                <ProductList
                  products={products}
                  archivedProducts={archivedProducts}
                  isPending={productsPending}
                  isOwner={activeOrg.role === 'owner'}
                  onAddProduct={() => setProductView('add')}
                  onEditProduct={(p) => setProductView({ editing: p })}
                  onArchiveProduct={handleArchiveRestore}
                  onRestoreProduct={handleArchiveRestore}
                />
              ))}
          </>
        )}
      </main>
    </div>
  )
}
