'use i18n'
'use client'

import { Check, ChevronsUpDown, Plus, Shield } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useMemo, useState } from 'react'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Skeleton } from '@/components/ui/skeleton'
import { trpc } from '@/lib/trpc'

export type Organization = {
  id: string
  name: string
  type: 'supplier' | 'horeca'
  claimed: boolean
  logoUrl: string | null
  roleId: string
  roleName: string
  isAdmin: boolean
  permissions: string[]
}

function getOrgInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

const ACTIVE_ORG_KEY = 'plexaris:activeOrgId'

function getStoredOrgId(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(ACTIVE_ORG_KEY)
}

function storeOrgId(id: string) {
  localStorage.setItem(ACTIVE_ORG_KEY, id)
}

export function useActiveOrg() {
  const { data, isPending } = trpc.organization.mine.useQuery(undefined, {
    staleTime: 30_000,
  })

  const organizations = useMemo<Organization[]>(
    () => data?.organizations ?? [],
    [data?.organizations],
  )
  const superAdmin = data?.superAdmin ?? false

  useEffect(() => {
    if (data) {
      document.cookie = `has_orgs=${data.organizations.length > 0 ? '1' : '0'}; path=/; max-age=86400; SameSite=Lax`
    }
  }, [data])

  const [activeOrgId, setActiveOrgId] = useState<string | null>(getStoredOrgId)

  const activeOrg = useMemo(() => {
    if (organizations.length === 0) return null
    const stored = organizations.find((o) => o.id === activeOrgId)
    const active = stored ?? organizations[0] ?? null
    if (active && active.id !== activeOrgId) {
      storeOrgId(active.id)
      setActiveOrgId(active.id)
    }
    return active
  }, [organizations, activeOrgId])

  const switchOrg = useCallback((org: Organization) => {
    setActiveOrgId(org.id)
    storeOrgId(org.id)
  }, [])

  return { organizations, activeOrg, switchOrg, isPending, superAdmin }
}

export function OrgSwitcher({
  organizations,
  activeOrg,
  onSwitch,
  isPending,
  superAdmin,
}: {
  organizations: Organization[]
  activeOrg: Organization | null
  onSwitch: (org: Organization) => void
  isPending: boolean
  superAdmin?: boolean
}) {
  const router = useRouter()

  if (isPending) {
    return <Skeleton className="h-9 w-40" />
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm hover:bg-accent focus:outline-none">
        {activeOrg ? (
          <>
            <Avatar className="h-5 w-5 rounded-md text-[10px]">
              {activeOrg.logoUrl && (
                <AvatarImage src={activeOrg.logoUrl} alt={activeOrg.name} />
              )}
              <AvatarFallback className="rounded-md text-[10px]">
                {getOrgInitials(activeOrg.name)}
              </AvatarFallback>
            </Avatar>
            <span className="max-w-[160px] truncate font-medium">
              {activeOrg.name}
            </span>
            <span className="rounded bg-muted px-1.5 py-0.5 text-xs capitalize text-muted-foreground">
              {activeOrg.type}
            </span>
          </>
        ) : (
          <span className="text-muted-foreground">Select an organization</span>
        )}
        <ChevronsUpDown className="h-3.5 w-3.5 text-muted-foreground" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64">
        <DropdownMenuLabel>Organizations</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {organizations.map((org) => (
          <DropdownMenuItem
            key={org.id}
            onClick={() => {
              onSwitch(org)
              router.push(`/orgs/${org.id}`)
            }}
            className="flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <Avatar className="h-5 w-5 rounded-md text-[10px]">
                {org.logoUrl && (
                  <AvatarImage src={org.logoUrl} alt={org.name} />
                )}
                <AvatarFallback className="rounded-md text-[10px]">
                  {getOrgInitials(org.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-sm">{org.name}</span>
                <span className="text-xs capitalize text-muted-foreground">
                  {org.type}
                </span>
              </div>
            </div>
            {activeOrg && org.id === activeOrg.id && (
              <Check className="h-4 w-4 text-primary" />
            )}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        {superAdmin && (
          <DropdownMenuItem
            onClick={() => router.push('/admin')}
            className="text-amber-600 dark:text-amber-400"
          >
            <Shield className="h-4 w-4" />
            Admin panel
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onClick={() => router.push('/onboarding')}>
          <Plus className="h-4 w-4" />
          Create organization
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
