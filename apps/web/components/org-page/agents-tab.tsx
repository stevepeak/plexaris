'use client'

import { Building, Package } from 'lucide-react'
import { toast } from 'sonner'

import { ActiveTaskRow } from '@/components/active-task-row'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { trpc } from '@/lib/trpc'

export function AgentsTab({ organizationId }: { organizationId: string }) {
  const utils = trpc.useUtils()

  const { data: runs, isPending } = trpc.triggerRun.listAll.useQuery(
    { organizationId },
    { refetchInterval: 5000 },
  )

  const scrapeOrgMutation = trpc.trigger.scrapeOrganizationDetails.useMutation({
    onSuccess: () => {
      toast.success('Organization details agent started')
      void utils.triggerRun.listAll.invalidate({ organizationId })
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to start agent')
    },
  })

  const discoverProductsMutation = trpc.trigger.discoverProducts.useMutation({
    onSuccess: () => {
      toast.success('Product discovery agent started')
      void utils.triggerRun.listAll.invalidate({ organizationId })
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to start agent')
    },
  })

  const hasRuns = runs && runs.length > 0

  return (
    <div>
      <h2 className="text-lg font-semibold">Agents</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Launch AI agents to extract and discover data
      </p>
      <Separator className="my-6" />

      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={() => scrapeOrgMutation.mutate({ organizationId })}
          disabled={scrapeOrgMutation.isPending}
        >
          <Building className="mr-2 h-4 w-4" />
          {scrapeOrgMutation.isPending ? 'Starting...' : 'Organization Details'}
        </Button>
        <Button
          variant="outline"
          onClick={() => discoverProductsMutation.mutate({ organizationId })}
          disabled={discoverProductsMutation.isPending}
        >
          <Package className="mr-2 h-4 w-4" />
          {discoverProductsMutation.isPending
            ? 'Starting...'
            : 'Discover Products'}
        </Button>
      </div>

      <Separator className="my-6" />

      <h3 className="mb-4 text-sm font-medium">Agent Runs</h3>

      {isPending ? (
        <div className="space-y-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      ) : hasRuns ? (
        <div className="divide-y rounded-md border">
          {runs.map((run) => (
            <ActiveTaskRow key={run.id} run={run} />
          ))}
        </div>
      ) : (
        <p className="py-4 text-sm text-muted-foreground">
          No agent runs yet. Launch an agent above to get started.
        </p>
      )}
    </div>
  )
}
