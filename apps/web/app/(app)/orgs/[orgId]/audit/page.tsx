'use client'

import { useOrg } from '@/components/org-context'
import { AuditTab } from '@/components/org-page/audit-tab'
import { Separator } from '@/components/ui/separator'

export default function AuditPage() {
  const { organizationId } = useOrg()

  return (
    <div>
      <h2 className="text-lg font-semibold">Audit Log</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Browse the history of all actions taken in this organization
      </p>
      <Separator className="my-6" />
      <AuditTab organizationId={organizationId} />
    </div>
  )
}
