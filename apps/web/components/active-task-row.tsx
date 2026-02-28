'use i18n'
'use client'

import {
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  Loader2,
  Timer,
} from 'lucide-react'
import Link from 'next/link'
import { useCallback, useState } from 'react'

import { useTriggerRun } from '@/app/hooks/use-trigger-run'
import { RelativeTime } from '@/components/relative-time'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { trpc } from '@/lib/trpc'

export function ActiveTaskRow({
  run,
}: {
  run: {
    id: string
    triggerRunId: string
    taskType: string
    label: string
    status: string
    creator?: { name: string; image: string | null } | null
    createdAt?: string
    publicAccessToken?: string | null
  }
}) {
  const isActive = run.status === 'running'
  const [latestLog, setLatestLog] = useState<string>('')
  const utils = trpc.useUtils()

  const fetchToken = useCallback(async () => {
    const result = await utils.triggerRun.getPublicAccessToken.fetch({
      triggerRunId: run.triggerRunId,
    })
    return result.publicAccessToken
  }, [utils, run.triggerRunId])

  const { isCompleted, isFailed } = useTriggerRun({
    triggerDevRunId: isActive ? run.triggerRunId : null,
    triggerDevPublicAccessToken: run.publicAccessToken ?? null,
    fetchPublicAccessToken:
      isActive && !run.publicAccessToken ? fetchToken : undefined,
    showToast: false,
    onStreamText: (text) => setLatestLog(text),
  })

  const effectiveStatus = isActive
    ? isCompleted
      ? 'completed'
      : isFailed
        ? 'failed'
        : 'running'
    : run.status

  return (
    <Link
      href={`/tasks/${run.id}`}
      className="flex items-center justify-between px-6 py-3 transition-colors hover:bg-muted/50"
    >
      <div className="flex items-center gap-3">
        {effectiveStatus === 'completed' ? (
          <CheckCircle2 className="h-4 w-4 text-green-500" />
        ) : effectiveStatus === 'failed' ? (
          <AlertCircle className="h-4 w-4 text-destructive" />
        ) : (
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        )}
        <span className="text-sm font-medium">{run.label}</span>
      </div>
      <div className="flex items-center gap-2">
        {run.creator ? (
          <Avatar className="h-4 w-4">
            {run.creator.image && <AvatarImage src={run.creator.image} />}
            <AvatarFallback className="text-[8px]">
              {run.creator.name?.charAt(0)?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
        ) : (
          <Timer className="h-3.5 w-3.5 text-muted-foreground" />
        )}
        <span className="max-w-[300px] truncate text-xs text-muted-foreground">
          {latestLog ||
            (effectiveStatus === 'running'
              ? 'Starting...'
              : effectiveStatus.charAt(0).toUpperCase() +
                effectiveStatus.slice(1))}
        </span>
        {run.createdAt && (
          <RelativeTime
            date={run.createdAt}
            className="shrink-0 text-xs text-muted-foreground"
          />
        )}
        <ExternalLink className="h-3 w-3 text-muted-foreground" />
      </div>
    </Link>
  )
}
