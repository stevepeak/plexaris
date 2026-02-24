'use client'

import { LogOut, Settings } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

import { OrgSwitcher, useActiveOrg } from '@/components/org-switcher'
import { ThemeSubmenu } from '@/components/theme-toggle'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  Card,
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
  const {
    organizations,
    activeOrg,
    switchOrg,
    isPending: orgsPending,
    superAdmin,
  } = useActiveOrg()

  useEffect(() => {
    if (!orgsPending && organizations.length === 1) {
      router.replace(`/orgs/${organizations[0].id}`)
    }
  }, [orgsPending, organizations, router])

  const handleSignOut = async () => {
    await authClient.signOut()
    router.push('/login')
  }

  // Don't render while redirecting single-org users
  if (!orgsPending && organizations.length === 1) {
    return null
  }

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
              activeOrg={activeOrg}
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

      <main className="relative flex min-h-[calc(100vh-3.5rem)] flex-col items-center justify-start overflow-hidden pt-8 md:justify-center md:pt-0">
        {/* Background pattern with edge fade */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            maskImage:
              'radial-gradient(ellipse at center, black 40%, transparent 80%)',
            WebkitMaskImage:
              'radial-gradient(ellipse at center, black 40%, transparent 80%)',
          }}
        >
          {/* Gradient base */}
          <div className="absolute inset-0 bg-gradient-to-br from-violet-500/15 via-transparent to-cyan-500/15" />
          {/* Grid pattern */}
          <div
            className="absolute inset-0 opacity-[0.08]"
            style={{
              backgroundImage:
                'linear-gradient(rgba(128,128,128,1) 1px, transparent 1px), linear-gradient(90deg, rgba(128,128,128,1) 1px, transparent 1px)',
              backgroundSize: '48px 48px',
            }}
          />
          {/* Animated glowing orbs */}
          <div className="absolute left-1/4 top-1/4 h-64 w-64 animate-pulse rounded-full bg-violet-500/20 blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 h-64 w-64 animate-pulse rounded-full bg-cyan-500/20 blur-3xl [animation-delay:1s]" />
          {/* Connection lines */}
          <svg className="absolute inset-0 h-full w-full opacity-[0.1]">
            <line
              x1="10%"
              y1="20%"
              x2="90%"
              y2="80%"
              stroke="currentColor"
              strokeWidth="1"
              strokeDasharray="8 8"
            />
            <line
              x1="90%"
              y1="20%"
              x2="10%"
              y2="80%"
              stroke="currentColor"
              strokeWidth="1"
              strokeDasharray="8 8"
            />
            <line
              x1="50%"
              y1="0%"
              x2="50%"
              y2="100%"
              stroke="currentColor"
              strokeWidth="1"
              strokeDasharray="8 8"
            />
          </svg>
        </div>

        <div className="relative z-10 w-full max-w-2xl px-4">
          <h2 className="mb-6 text-center text-xl font-semibold">
            Organizations
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {orgsPending
              ? Array.from({ length: 4 }).map((_, i) => (
                  <Card key={i}>
                    <CardHeader className="flex flex-row items-center gap-4">
                      <Skeleton className="h-12 w-12 rounded-lg" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                    </CardHeader>
                  </Card>
                ))
              : organizations.map((org) => (
                  <Link key={org.id} href={`/orgs/${org.id}`}>
                    <Card className="transition-colors hover:bg-accent">
                      <CardHeader className="flex flex-row items-center gap-4">
                        <Avatar className="h-12 w-12 rounded-lg text-lg">
                          {org.logoUrl && (
                            <AvatarImage src={org.logoUrl} alt={org.name} />
                          )}
                          <AvatarFallback className="rounded-lg">
                            {getInitials(org.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <CardTitle className="text-base">
                            {org.name}
                          </CardTitle>
                          <CardDescription className="capitalize">
                            {org.type}
                          </CardDescription>
                        </div>
                      </CardHeader>
                    </Card>
                  </Link>
                ))}
          </div>
        </div>
      </main>
    </div>
  )
}
