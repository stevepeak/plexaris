'use client'

import { Building2, LogOut, Mail, Settings, User } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'

import { InviteMembers } from '@/components/invite-members'
import { OrgSwitcher, useActiveOrg } from '@/components/org-switcher'
import { PendingInvitations } from '@/components/pending-invitations'
import { ProductList } from '@/components/product-list'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { authClient } from '@/lib/auth-client'

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

export default function DashboardPage() {
  const router = useRouter()
  const { data: session, isPending } = authClient.useSession()
  const [refreshKey, setRefreshKey] = useState(0)
  const {
    organizations,
    activeOrg,
    switchOrg,
    isPending: orgsPending,
  } = useActiveOrg(refreshKey)

  const [products, setProducts] = useState<
    {
      id: string
      name: string
      description: string | null
      price: string | null
      unit: string | null
      category: string | null
      status: string
      images: string[]
      createdAt: string
      updatedAt: string
      archivedAt: string | null
    }[]
  >([])
  const [productsPending, setProductsPending] = useState(false)

  useEffect(() => {
    if (!activeOrg || activeOrg.type !== 'supplier') {
      setProducts([])
      return
    }
    setProductsPending(true)
    void fetch(`/api/products?organizationId=${activeOrg.id}`)
      .then((res) => (res.ok ? res.json() : { products: [] }))
      .then((data) => setProducts(data.products ?? []))
      .finally(() => setProductsPending(false))
  }, [activeOrg])

  const handleInvitationAccepted = useCallback(() => {
    setRefreshKey((k) => k + 1)
  }, [])

  const handleSignOut = async () => {
    await authClient.signOut()
    router.push('/login')
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <span className="text-lg font-semibold">Plexaris</span>
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
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">
                {session?.user.name}
              </span>
              <Button variant="ghost" size="icon" asChild>
                <Link href="/settings/profile">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs">
                      {getInitials(session?.user.name)}
                    </AvatarFallback>
                  </Avatar>
                </Link>
              </Button>
            </div>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-4xl space-y-6 px-4 py-8">
        <PendingInvitations onAccepted={handleInvitationAccepted} />

        {isPending ? (
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent className="grid gap-4">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-4 w-56" />
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="text-lg">
                    {getInitials(session?.user.name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-xl">
                    {session?.user.name}
                  </CardTitle>
                  <CardDescription>Welcome to your dashboard</CardDescription>
                </div>
              </div>
            </CardHeader>
            <Separator />
            <CardContent className="grid gap-4 pt-6">
              <div className="flex items-center gap-3 text-sm">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Name:</span>
                <span>{session?.user.name}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Email:</span>
                <span>{session?.user.email}</span>
              </div>
              <Separator />
              <div className="flex gap-3">
                <Button variant="outline" asChild className="w-fit">
                  <Link href="/settings/profile">
                    <Settings className="h-4 w-4" />
                    Profile settings
                  </Link>
                </Button>
                <Button variant="outline" asChild className="w-fit">
                  <Link href="/settings/organization">
                    <Building2 className="h-4 w-4" />
                    Organization settings
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  onClick={handleSignOut}
                  className="w-fit"
                >
                  <LogOut className="h-4 w-4" />
                  Sign out
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {activeOrg && (
          <InviteMembers
            organizationId={activeOrg.id}
            isOwner={activeOrg.role === 'owner'}
          />
        )}

        {activeOrg?.type === 'supplier' && (
          <ProductList
            products={products}
            isPending={productsPending}
            isOwner={activeOrg.role === 'owner'}
          />
        )}
      </main>
    </div>
  )
}
