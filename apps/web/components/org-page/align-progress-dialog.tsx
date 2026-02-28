'use i18n'
'use client'

import { AlertCircle, CheckCircle2, ExternalLink, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

import { useTriggerRun } from '@/app/hooks/use-trigger-run'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

type Status = 'running' | 'completed' | 'failed'

interface AlignProgressDialogContentProps {
  status: Status
  latestLog: string
  taskId: string
  orgId: string
}

export function AlignProgressDialogContent({
  status,
  latestLog,
  taskId,
  orgId,
}: AlignProgressDialogContentProps) {
  return (
    <>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          {status === 'running' && (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          )}
          {status === 'completed' && (
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          )}
          {status === 'failed' && (
            <AlertCircle className="h-4 w-4 text-destructive" />
          )}
          {status === 'completed'
            ? 'Processing complete'
            : status === 'failed'
              ? 'Processing failed'
              : 'Processing files...'}
        </DialogTitle>
        <DialogDescription>
          {status === 'completed'
            ? 'Your files have been processed. Check the Suggestions tab for results.'
            : status === 'failed'
              ? 'Something went wrong while processing your files.'
              : 'You can close this dialog — the agent will continue working in the background.'}
        </DialogDescription>
      </DialogHeader>

      {latestLog && (
        <div className="rounded-md bg-muted px-3 py-2">
          <p className="truncate text-sm text-muted-foreground">{latestLog}</p>
        </div>
      )}

      <DialogFooter className="gap-2 sm:gap-0">
        <Button variant="outline" asChild>
          <Link href={`/tasks/${taskId}`}>
            <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
            View Agent Run
          </Link>
        </Button>
      </DialogFooter>
    </>
  )
}

interface AlignProgressDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  triggerDevRunId: string
  triggerDevPublicAccessToken: string
  taskId: string
  orgId: string
}

export function AlignProgressDialog({
  open,
  onOpenChange,
  triggerDevRunId,
  triggerDevPublicAccessToken,
  taskId,
  orgId,
}: AlignProgressDialogProps) {
  const [latestLog, setLatestLog] = useState('')

  const { isLoading, isCompleted, isFailed } = useTriggerRun({
    triggerDevRunId: open ? triggerDevRunId : null,
    triggerDevPublicAccessToken,
    showToast: false,
    onStreamText: (text) => setLatestLog(text),
  })

  const status: Status = isCompleted
    ? 'completed'
    : isFailed
      ? 'failed'
      : 'running'

  // Suppress unused variable — isLoading drives the hook's internal state
  void isLoading

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <AlignProgressDialogContent
          status={status}
          latestLog={latestLog}
          taskId={taskId}
          orgId={orgId}
        />
      </DialogContent>
    </Dialog>
  )
}
