'use client'

import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react'
import { useState } from 'react'

import { useTriggerRun } from '@/app/hooks/use-trigger-run'
import { Badge } from '@/components/ui/badge'

export function ActiveTaskRow({
  run,
}: {
  run: {
    id: string
    triggerRunId: string
    taskType: string
    label: string
    status: string
    publicAccessToken: string | null
  }
}) {
  const [latestLog, setLatestLog] = useState<string>('')

  const { isCompleted, isFailed } = useTriggerRun({
    triggerDevRunId: run.publicAccessToken ? run.triggerRunId : null,
    triggerDevPublicAccessToken: run.publicAccessToken,
    showToast: false,
    onStreamText: (text) => setLatestLog(text),
  })

  const effectiveStatus = isCompleted
    ? 'completed'
    : isFailed
      ? 'failed'
      : run.status

  return (
    <div className="flex items-center justify-between px-6 py-3">
      <div className="flex items-center gap-3">
        {effectiveStatus === 'completed' ? (
          <CheckCircle2 className="h-4 w-4 text-green-500" />
        ) : effectiveStatus === 'failed' ? (
          <AlertCircle className="h-4 w-4 text-destructive" />
        ) : (
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        )}
        <span className="text-sm font-medium">{run.label}</span>
        <Badge variant="outline" className="text-xs">
          {run.taskType}
        </Badge>
      </div>
      <span className="max-w-[300px] truncate text-xs text-muted-foreground">
        {latestLog ||
          (effectiveStatus === 'running' ? 'Starting...' : effectiveStatus)}
      </span>
    </div>
  )
}
