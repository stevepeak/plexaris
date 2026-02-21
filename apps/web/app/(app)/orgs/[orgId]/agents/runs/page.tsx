'use client'

import { useOrg } from '@/components/org-context'
import { AgentsRunsTab } from '@/components/org-page/agents-runs-tab'
import { Separator } from '@/components/ui/separator'

export default function AgentsRunsPage() {
  const { organizationId } = useOrg()

  return (
    <div>
      <h2 className="text-lg font-semibold">Runs</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        View the history of all agent runs
      </p>
      <Separator className="my-6" />
      <AgentsRunsTab organizationId={organizationId} />
    </div>
  )
}
