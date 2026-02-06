'use client'

import { Loader2 } from 'lucide-react'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { trpc } from '@/lib/trpc'

import { ActiveTaskRow } from './active-task-row'

export function ActiveTasksCard({
  organizationId,
}: {
  organizationId: string
}) {
  const { data: runs, isPending } = trpc.triggerRun.list.useQuery(
    { organizationId },
    { refetchInterval: 5000 },
  )

  if (isPending) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            Active Tasks
          </CardTitle>
        </CardHeader>
        <Separator />
        <CardContent className="p-6">
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!runs?.length) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle className="flex items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            Active Tasks
          </CardTitle>
          <CardDescription>
            AI agents are currently processing data for this organization
          </CardDescription>
        </div>
      </CardHeader>
      <Separator />
      <CardContent className="p-0">
        <div className="divide-y">
          {runs.map((run) => (
            <ActiveTaskRow key={run.id} run={run} />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
