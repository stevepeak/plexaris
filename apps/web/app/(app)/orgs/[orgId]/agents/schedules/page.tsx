'use i18n'
'use client'

import { useOrg } from '@/components/org-context'
import {
  AgentsSchedulesTab,
  CreateScheduleDialog,
} from '@/components/org-page/agents-schedules-tab'
import { Separator } from '@/components/ui/separator'

export default function AgentsSchedulesPage() {
  const { organizationId } = useOrg()

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Schedules</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Automatically run agents on a recurring basis
          </p>
        </div>
        <CreateScheduleDialog organizationId={organizationId} />
      </div>
      <Separator className="my-6" />
      <AgentsSchedulesTab organizationId={organizationId} />
    </div>
  )
}
