import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

export type ActiveRun = {
  id: string
  triggerRunId: string
  taskType: string
  label: string
  status: string
  publicAccessToken: string | null
}

export function ActiveTasksCardStatic({ runs }: { runs: ActiveRun[] }) {
  if (!runs.length) return null

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
            <ActiveTaskRowStatic key={run.id} run={run} />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function ActiveTaskRowStatic({ run }: { run: ActiveRun }) {
  return (
    <div className="flex items-center justify-between px-6 py-3">
      <div className="flex items-center gap-3">
        {run.status === 'completed' ? (
          <CheckCircle2 className="h-4 w-4 text-green-500" />
        ) : run.status === 'failed' ? (
          <AlertCircle className="h-4 w-4 text-destructive" />
        ) : (
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        )}
        <span className="text-sm font-medium">{run.label}</span>
        <Badge variant="outline" className="text-xs">
          {run.taskType}
        </Badge>
      </div>
      <span className="text-xs text-muted-foreground">
        {run.status === 'running' ? 'In progress...' : run.status}
      </span>
    </div>
  )
}
