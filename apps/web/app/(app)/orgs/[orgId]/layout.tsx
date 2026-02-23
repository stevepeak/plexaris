'use client'

import { LogOut, Settings } from 'lucide-react'
import Link from 'next/link'
import { notFound, useParams, useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'

import { OrgProvider } from '@/components/org-context'
import { OrgSidebar } from '@/components/org-sidebar'
import {
  type Organization,
  OrgSwitcher,
  useActiveOrg,
} from '@/components/org-switcher'
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
import { authClient } from '@/lib/auth-client'

function getInitials(name: string | undefined): string {
  if (!name) return '?'
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export default function OrgLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { orgId } = useParams<{ orgId: string }>()
  const { data: session, isPending } = authClient.useSession()
  const [refreshKey, setRefreshKey] = useState(0)
  const {
    organizations,
    activeOrg,
    switchOrg,
    isPending: orgsPending,
    superAdmin,
  } = useActiveOrg(refreshKey)

  const [superAdminOrg, setSuperAdminOrg] = useState<Organization | null>(null)

  const refreshOrg = useCallback(() => {
    setRefreshKey((k) => k + 1)
    setSuperAdminOrg(null)
  }, [])

  // Sync URL orgId with active org state
  useEffect(() => {
    if (orgsPending) return
    const urlOrg = organizations.find((o) => o.id === orgId)
    if (urlOrg) {
      if (activeOrg?.id !== orgId) switchOrg(urlOrg)
      setSuperAdminOrg(null)
    } else if (superAdmin) {
      // Super-admin viewing an org they're not a member of
      void fetch(`/api/organizations/${orgId}`)
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (!data?.organization) return
          const org = data.organization
          setSuperAdminOrg({
            id: org.id,
            name: org.name,
            type: org.type,
            claimed: org.claimed,
            logoUrl: org.logoUrl,
            roleId: 'super-admin',
            roleName: 'Super Admin',
            isAdmin: true,
            permissions: data.role?.permissions ?? [],
          })
        })
    }
  }, [orgId, organizations, activeOrg?.id, switchOrg, orgsPending, superAdmin])

  const handleSignOut = async () => {
    await authClient.signOut()
    router.push('/login')
  }

  const effectiveOrg = superAdminOrg ?? activeOrg
  const orgNotFound =
    !orgsPending && !effectiveOrg && !superAdmin && organizations.length > 0

  if (orgNotFound) notFound()

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="font-bruno text-lg">
              Plexaris
            </Link>
            <Separator orientation="vertical" className="h-6" />
            <OrgSwitcher
              organizations={organizations}
              activeOrg={effectiveOrg}
              onSwitch={switchOrg}
              isPending={orgsPending}
              superAdmin={superAdmin}
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
        {!effectiveOrg ? (
          <div className="space-y-4">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-64 w-full" />
          </div>
        ) : (
          <OrgProvider org={effectiveOrg} refreshOrg={refreshOrg}>
            <div className="flex items-start gap-8">
              <OrgSidebar />
              <div className="min-w-0 flex-1">{children}</div>
            </div>
          </OrgProvider>
        )}
      </main>
    </div>
  )
}
