'use i18n'
'use client'

import { notFound, useParams } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'

import { AppHeader } from '@/components/app-header'
import { OrgProvider } from '@/components/org-context'
import { OrgSidebar } from '@/components/org-sidebar'
import { type Organization, useActiveOrg } from '@/components/org-switcher'
import { Skeleton } from '@/components/ui/skeleton'

export default function OrgLayout({ children }: { children: React.ReactNode }) {
  const { orgId } = useParams<{ orgId: string }>()
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

  const effectiveOrg = superAdminOrg ?? activeOrg
  const orgNotFound =
    !orgsPending && !effectiveOrg && !superAdmin && organizations.length > 0

  if (orgNotFound) notFound()

  return (
    <div className="min-h-screen bg-background">
      <AppHeader
        organizations={organizations}
        activeOrg={effectiveOrg}
        onSwitchOrg={switchOrg}
        orgsPending={orgsPending}
        superAdmin={superAdmin}
      />

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
