'use client'

import { LogOut, Plus, Settings } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

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
  } = useActiveOrg()

  const handleSignOut = async () => {
    await authClient.signOut()
    router.push('/login')
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
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

      <main className="mx-auto max-w-6xl px-4 py-8">
        <h2 className="text-xl font-semibold">Organizations</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {orgsPending
            ? Array.from({ length: 3 }).map((_, i) => (
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
                        <CardTitle className="text-base">{org.name}</CardTitle>
                        <CardDescription className="capitalize">
                          {org.type}
                        </CardDescription>
                      </div>
                    </CardHeader>
                  </Card>
                </Link>
              ))}
          <Link href="/onboarding">
            <Card className="flex h-full items-center justify-center transition-colors hover:bg-accent">
              <CardHeader className="flex flex-row items-center gap-2 text-muted-foreground">
                <Plus className="h-5 w-5" />
                <CardTitle className="text-base font-normal">
                  Create organization
                </CardTitle>
              </CardHeader>
            </Card>
          </Link>
        </div>
      </main>
    </div>
  )
}
