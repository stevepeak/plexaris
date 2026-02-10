'use client'

import { useSearchParams } from 'next/navigation'

import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import { AgentsRunsTab } from './agents-runs-tab'
import { AgentsSchedulesTab } from './agents-schedules-tab'

export function AgentsTab({ organizationId }: { organizationId: string }) {
  const searchParams = useSearchParams()
  const defaultTab =
    searchParams.get('agentsTab') === 'runs' ? 'runs' : 'schedules'

  return (
    <div>
      <h2 className="text-lg font-semibold">Agents</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Configure scheduled agents and view their runs
      </p>
      <Separator className="my-6" />

      <Tabs defaultValue={defaultTab}>
        <TabsList>
          <TabsTrigger value="schedules">Schedules</TabsTrigger>
          <TabsTrigger value="runs">Runs</TabsTrigger>
        </TabsList>
        <TabsContent value="schedules">
          <AgentsSchedulesTab organizationId={organizationId} />
        </TabsContent>
        <TabsContent value="runs">
          <AgentsRunsTab organizationId={organizationId} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
