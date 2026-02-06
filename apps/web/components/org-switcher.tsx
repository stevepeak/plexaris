'use client'

import { Check, ChevronsUpDown, Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'

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

type Organization = {
  id: string
  name: string
  type: 'supplier' | 'horeca'
  claimed: boolean
  logoUrl: string | null
  role: 'owner' | 'member'
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

export function useActiveOrg(refreshKey?: number) {
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [activeOrg, setActiveOrg] = useState<Organization | null>(null)
  const [isPending, setIsPending] = useState(true)

  useEffect(() => {
    async function fetchOrgs() {
      try {
        const res = await fetch('/api/organizations/mine')
        if (!res.ok) return
        const data = await res.json()
        const orgs: Organization[] = data.organizations ?? []
        setOrganizations(orgs)

        const storedId = getStoredOrgId()
        const stored = orgs.find((o) => o.id === storedId)
        const active = stored ?? orgs[0] ?? null
        setActiveOrg(active)
        if (active) storeOrgId(active.id)
      } finally {
        setIsPending(false)
      }
    }
    void fetchOrgs()
  }, [refreshKey])

  const switchOrg = useCallback((org: Organization) => {
    setActiveOrg(org)
    storeOrgId(org.id)
  }, [])

  return { organizations, activeOrg, switchOrg, isPending }
}

export function OrgSwitcher({
  organizations,
  activeOrg,
  onSwitch,
  isPending,
}: {
  organizations: Organization[]
  activeOrg: Organization | null
  onSwitch: (org: Organization) => void
  isPending: boolean
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
        <DropdownMenuItem onClick={() => router.push('/onboarding')}>
          <Plus className="h-4 w-4" />
          Create organization
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
