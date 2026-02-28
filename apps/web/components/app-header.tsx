'use i18n'
'use client'

import { LogOut, Settings } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { LanguageSubmenu } from '@/components/language-switcher'
import { type Organization, OrgSwitcher } from '@/components/org-switcher'
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

interface AppHeaderProps {
  organizations: Organization[]
  activeOrg: Organization | null
  onSwitchOrg: (org: Organization) => void
  orgsPending: boolean
  superAdmin?: boolean
}

export function AppHeader({
  organizations,
  activeOrg,
  onSwitchOrg,
  orgsPending,
  superAdmin,
}: AppHeaderProps) {
  const router = useRouter()
  const { data: session, isPending } = authClient.useSession()

  const handleSignOut = async () => {
    await authClient.signOut()
    router.push('/login')
  }

  return (
    <header className="border-b">
      <div className="flex h-14 items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard"
            className="font-bruno text-lg"
            data-lingo-override={{ nl: 'Plexaris' }}
          >
            Plexaris
          </Link>
          <Separator orientation="vertical" className="h-6" />
          <OrgSwitcher
            organizations={organizations}
            activeOrg={activeOrg}
            onSwitch={onSwitchOrg}
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
              <LanguageSubmenu />
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
  )
}
