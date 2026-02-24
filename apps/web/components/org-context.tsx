'use i18n'
'use client'

import { createContext, useContext } from 'react'

import { type Organization } from '@/components/org-switcher'

type OrgContextValue = {
  organizationId: string
  orgName: string
  orgType: Organization['type']
  permissions: string[]
  isAdmin: boolean
  refreshOrg: () => void
}

const OrgContext = createContext<OrgContextValue | null>(null)

export function OrgProvider({
  org,
  refreshOrg,
  children,
}: {
  org: Organization
  refreshOrg: () => void
  children: React.ReactNode
}) {
  return (
    <OrgContext.Provider
      value={{
        organizationId: org.id,
        orgName: org.name,
        orgType: org.type,
        permissions: org.permissions,
        isAdmin: org.isAdmin,
        refreshOrg,
      }}
    >
      {children}
    </OrgContext.Provider>
  )
}

export function useOrg() {
  const ctx = useContext(OrgContext)
  if (!ctx) throw new Error('useOrg must be used within OrgProvider')
  return ctx
}
