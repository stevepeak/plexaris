'use client'

import {
  BarChart3,
  Bell,
  FlaskConical,
  LayoutDashboard,
  Lightbulb,
  LogOut,
  Package,
  Settings,
  Shield,
  ShoppingCart,
  Users,
  Zap,
} from 'lucide-react'
import Link from 'next/link'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'

import { AgentsTab } from '@/components/org-page/agents-tab'
import { AlignTab } from '@/components/org-page/align-tab'
import { DashboardTab } from '@/components/org-page/dashboard-tab'
import { InsightsTab } from '@/components/org-page/insights-tab'
import { MembersTab } from '@/components/org-page/members-tab'
import { NotificationsTab } from '@/components/org-page/notifications-tab'
import { OrdersTab } from '@/components/org-page/orders-tab'
import { ProductsTab } from '@/components/org-page/products-tab'
import { RolesTab } from '@/components/org-page/roles-tab'
import { SettingsTab } from '@/components/org-page/settings-tab'
import { SuggestionsTab } from '@/components/org-page/suggestions-tab'
import { OrgSwitcher, useActiveOrg } from '@/components/org-switcher'
import { ThemeSubmenu } from '@/components/theme-toggle'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
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
import { hasPermission } from '@/lib/permissions-client'
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
  {
    value: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    iconColor: 'text-blue-500',
  },
  { value: 'sep-1' as const, label: '', icon: null, iconColor: '' },
  {
    value: 'orders',
    label: 'Orders',
    icon: ShoppingCart,
    iconColor: 'text-emerald-500',
  },
  {
    value: 'products',
    label: 'Products',
    icon: Package,
    iconColor: 'text-amber-500',
    orgType: 'supplier' as const,
  },
  { value: 'sep-2' as const, label: '', icon: null, iconColor: '' },
  {
    value: 'insights',
    label: 'Insights',
    icon: BarChart3,
    iconColor: 'text-indigo-500',
  },
  {
    value: 'suggestions',
    label: 'Suggestions',
    icon: Lightbulb,
    iconColor: 'text-yellow-500',
  },
  {
    value: 'align',
    label: 'Align',
    icon: FlaskConical,
    iconColor: 'text-orange-500',
  },
  { value: 'sep-3' as const, label: '', icon: null, iconColor: '' },
  {
    value: 'agents',
    label: 'Agents',
    icon: Zap,
    iconColor: 'text-violet-500',
  },
  {
    value: 'roles',
    label: 'Roles',
    icon: Shield,
    iconColor: 'text-orange-500',
  },
  {
    value: 'members',
    label: 'Team',
    icon: Users,
    iconColor: 'text-cyan-500',
  },
  {
    value: 'notifications',
    label: 'Notifications',
    icon: Bell,
    iconColor: 'text-rose-500',
  },
  {
    value: 'settings',
    label: 'Settings',
    icon: Settings,
    iconColor: 'text-gray-500',
  },
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
    ? TAB_CONFIG.filter((tab) => {
        if ('orgType' in tab && tab.orgType !== activeOrg.type) return false
        if (
          tab.value === 'roles' &&
          !activeOrg.isAdmin &&
          !hasPermission(activeOrg.permissions, 'manage_roles')
        ) {
          return false
        }
        return true
      })
    : []

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="flex h-14 items-center justify-between px-4">
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
                    <AvatarImage
                      src={session?.user.image ?? undefined}
                      alt={session?.user.name ?? ''}
                    />
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
                <ThemeSubmenu />
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

      <main className="px-4 py-8">
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
                      'justify-start gap-2 rounded-md transition-colors hover:bg-muted/50 data-[state=active]:bg-muted data-[state=active]:shadow-none',
                    )}
                  >
                    <Icon className={cn('h-4 w-4', tab.iconColor)} />
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
                  key={activeOrg.id}
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
                    permissions={activeOrg.permissions}
                    initialProductId={initialProductId}
                  />
                </TabsContent>
              )}

              <TabsContent value="roles" className="mt-0">
                <RolesTab
                  organizationId={activeOrg.id}
                  permissions={activeOrg.permissions}
                  isAdmin={activeOrg.isAdmin}
                />
              </TabsContent>

              <TabsContent value="members" className="mt-0">
                <MembersTab
                  organizationId={activeOrg.id}
                  permissions={activeOrg.permissions}
                  isAdmin={activeOrg.isAdmin}
                />
              </TabsContent>

              <TabsContent value="settings" className="mt-0">
                <SettingsTab
                  organizationId={activeOrg.id}
                  onOrgLeft={handleOrgLeft}
                  onOrgArchived={handleOrgArchived}
                />
              </TabsContent>

              <TabsContent value="insights" className="mt-0">
                <InsightsTab organizationId={activeOrg.id} />
              </TabsContent>

              <TabsContent value="align" className="mt-0">
                <AlignTab organizationId={activeOrg.id} />
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
