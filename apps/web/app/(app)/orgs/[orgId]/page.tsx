'use client'

import {
  Bell,
  LayoutDashboard,
  Lightbulb,
  LogOut,
  Package,
  Settings,
  ShoppingCart,
  Users,
  Zap,
} from 'lucide-react'
import Link from 'next/link'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'

import { AgentsTab } from '@/components/org-page/agents-tab'
import { DashboardTab } from '@/components/org-page/dashboard-tab'
import { MembersTab } from '@/components/org-page/members-tab'
import { NotificationsTab } from '@/components/org-page/notifications-tab'
import { OrdersTab } from '@/components/org-page/orders-tab'
import { ProductsTab } from '@/components/org-page/products-tab'
import { SettingsTab } from '@/components/org-page/settings-tab'
import { SuggestionsTab } from '@/components/org-page/suggestions-tab'
import { OrgSwitcher, useActiveOrg } from '@/components/org-switcher'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { authClient } from '@/lib/auth-client'
import { trpc } from '@/lib/trpc'
import { cn } from '@/lib/utils'

function getInitials(name: string | undefined): string {
  if (!name) return '?'
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

const TAB_CONFIG = [
  { value: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { value: 'orders', label: 'Orders', icon: ShoppingCart },
  {
    value: 'products',
    label: 'Products',
    icon: Package,
    orgType: 'supplier' as const,
  },
  { value: 'sep-1' as const, label: '', icon: null },
  { value: 'suggestions', label: 'Suggestions', icon: Lightbulb },
  { value: 'agents', label: 'Agents', icon: Zap },
  { value: 'sep-2' as const, label: '', icon: null },
  { value: 'notifications', label: 'Notifications', icon: Bell },
  { value: 'sep-3' as const, label: '', icon: null },
  { value: 'members', label: 'Members', icon: Users },
  { value: 'settings', label: 'Settings', icon: Settings },
] as const

export default function OrgPage() {
  const router = useRouter()
  const { orgId } = useParams<{ orgId: string }>()
  const searchParams = useSearchParams()
  const { data: session, isPending } = authClient.useSession()
  const [refreshKey, setRefreshKey] = useState(0)
  const {
    organizations,
    activeOrg,
    switchOrg,
    isPending: orgsPending,
  } = useActiveOrg(refreshKey)

  const { data: pendingCount } = trpc.suggestion.pendingCount.useQuery(
    { organizationId: orgId },
    { enabled: !!activeOrg, refetchInterval: 10000 },
  )

  const activeTab = searchParams.get('tab') ?? 'dashboard'

  const initialProductId = searchParams.get('productId')

  const setActiveTab = useCallback(
    (tab: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (tab === 'dashboard') {
        params.delete('tab')
      } else {
        params.set('tab', tab)
      }
      params.delete('productId')
      const qs = params.toString()
      router.replace(`/orgs/${orgId}${qs ? `?${qs}` : ''}`)
    },
    [router, orgId, searchParams],
  )

  // Sync URL orgId with active org state
  useEffect(() => {
    if (orgsPending || !organizations.length) return
    const urlOrg = organizations.find((o) => o.id === orgId)
    if (urlOrg && activeOrg?.id !== orgId) {
      switchOrg(urlOrg)
    }
  }, [orgId, organizations, activeOrg?.id, switchOrg, orgsPending])

  const handleInvitationAccepted = useCallback(() => {
    setRefreshKey((k) => k + 1)
  }, [])

  const handleOrgLeft = useCallback(() => {
    localStorage.removeItem('plexaris:activeOrgId')
    router.push('/dashboard')
  }, [router])

  const handleOrgArchived = useCallback(() => {
    localStorage.removeItem('plexaris:activeOrgId')
    router.push('/dashboard')
  }, [router])

  const handleSignOut = async () => {
    await authClient.signOut()
    router.push('/login')
  }

  const orgNotFound =
    !orgsPending &&
    organizations.length > 0 &&
    !organizations.find((o) => o.id === orgId)

  const visibleTabs = activeOrg
    ? TAB_CONFIG.filter(
        (tab) => !('orgType' in tab) || tab.orgType === activeOrg.type,
      )
    : []

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
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

      <main className="mx-auto max-w-5xl px-4 py-8">
        {orgNotFound ? (
          <p className="text-sm text-muted-foreground">
            Organization not found.
          </p>
        ) : !activeOrg ? (
          <div className="space-y-4">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-64 w-full" />
          </div>
        ) : (
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            orientation="vertical"
            className="flex items-start gap-8"
          >
            <TabsList className="h-auto w-48 shrink-0 flex-col items-stretch gap-1 bg-transparent p-0">
              {visibleTabs.map((tab) => {
                if (tab.value.startsWith('sep-')) {
                  return <Separator key={tab.value} className="my-2" />
                }
                const Icon = tab.icon!
                return (
                  <TabsTrigger
                    key={tab.value}
                    value={tab.value}
                    className={cn(
                      'justify-start gap-2 data-[state=active]:bg-muted data-[state=active]:shadow-none',
                      tab.value === 'settings' &&
                        'data-[state=active]:bg-muted',
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {tab.label}
                    {tab.value === 'suggestions' &&
                      pendingCount &&
                      pendingCount.count > 0 && (
                        <span className="ml-auto rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-medium leading-none text-primary-foreground">
                          {pendingCount.count}
                        </span>
                      )}
                  </TabsTrigger>
                )
              })}
            </TabsList>

            <div className="min-w-0 flex-1">
              <TabsContent value="dashboard" className="mt-0">
                <DashboardTab
                  organizationId={activeOrg.id}
                  orgName={activeOrg.name}
                  orgType={activeOrg.type}
                  onInvitationAccepted={handleInvitationAccepted}
                />
              </TabsContent>

              <TabsContent value="agents" className="mt-0">
                <AgentsTab organizationId={activeOrg.id} />
              </TabsContent>

              <TabsContent value="suggestions" className="mt-0">
                <SuggestionsTab organizationId={activeOrg.id} />
              </TabsContent>

              <TabsContent value="orders" className="mt-0">
                <OrdersTab
                  organizationId={activeOrg.id}
                  orgType={activeOrg.type}
                />
              </TabsContent>

              {activeOrg.type === 'supplier' && (
                <TabsContent value="products" className="mt-0">
                  <ProductsTab
                    organizationId={activeOrg.id}
                    isOwner={activeOrg.role === 'owner'}
                    initialProductId={initialProductId}
                  />
                </TabsContent>
              )}

              <TabsContent value="members" className="mt-0">
                <MembersTab
                  organizationId={activeOrg.id}
                  isOwner={activeOrg.role === 'owner'}
                />
              </TabsContent>

              <TabsContent value="settings" className="mt-0">
                <SettingsTab
                  organizationId={activeOrg.id}
                  onOrgLeft={handleOrgLeft}
                  onOrgArchived={handleOrgArchived}
                />
              </TabsContent>

              <TabsContent value="notifications" className="mt-0">
                <NotificationsTab organizationId={activeOrg.id} />
              </TabsContent>
            </div>
          </Tabs>
        )}
      </main>
    </div>
  )
}
