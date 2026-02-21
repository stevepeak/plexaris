'use client'

import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  ChevronDown,
  Clock,
  Download,
  FileIcon,
  FileSpreadsheet,
  FileText,
  Image,
  Loader2,
  Timer,
  User,
  XCircle,
} from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useCallback, useState } from 'react'
import { toast } from 'sonner'

import { useTriggerRun } from '@/app/hooks/use-trigger-run'
import { CodeViewer } from '@/components/code-viewer'
import { RelativeTime } from '@/components/relative-time'
import { SuggestionCard } from '@/components/suggestion-card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { trpc } from '@/lib/trpc'

function StatusBadge({ status }: { status: string }) {
  const statusConfig: Record<
    string,
    { label: string; variant: 'default' | 'secondary' | 'destructive' }
  > = {
    running: { label: 'Running', variant: 'default' },
    completed: { label: 'Completed', variant: 'secondary' },
    failed: { label: 'Failed', variant: 'destructive' },
    EXECUTING: { label: 'Running', variant: 'default' },
    COMPLETED: { label: 'Completed', variant: 'secondary' },
    FAILED: { label: 'Failed', variant: 'destructive' },
    CANCELED: { label: 'Cancelled', variant: 'destructive' },
    CRASHED: { label: 'Crashed', variant: 'destructive' },
    PENDING: { label: 'Pending', variant: 'secondary' },
    QUEUED: { label: 'Queued', variant: 'secondary' },
  }

  const config = statusConfig[status] ?? { label: status, variant: 'secondary' }

  return <Badge variant={config.variant}>{config.label}</Badge>
}

function StatusIcon({ status }: { status: string }) {
  if (status === 'running' || status === 'EXECUTING') {
    return <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
  }
  if (status === 'completed' || status === 'COMPLETED') {
    return <CheckCircle2 className="h-5 w-5 text-green-500" />
  }
  if (
    status === 'failed' ||
    status === 'FAILED' ||
    status === 'CRASHED' ||
    status === 'CANCELED'
  ) {
    return <XCircle className="h-5 w-5 text-destructive" />
  }
  return <Clock className="h-5 w-5 text-muted-foreground" />
}

function FileIconByMime({ mimeType }: { mimeType: string }) {
  if (mimeType.startsWith('image/')) {
    return <Image className="h-8 w-8 text-muted-foreground" />
  }
  if (
    mimeType === 'text/csv' ||
    mimeType.includes('spreadsheet') ||
    mimeType.includes('excel')
  ) {
    return <FileSpreadsheet className="h-8 w-8 text-muted-foreground" />
  }
  if (mimeType === 'application/pdf' || mimeType.startsWith('text/')) {
    return <FileText className="h-8 w-8 text-muted-foreground" />
  }
  return <FileIcon className="h-8 w-8 text-muted-foreground" />
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function TaskDetailPage() {
  const { taskId } = useParams<{ taskId: string }>()
  const [logs, setLogs] = useState<string[]>([])

  const {
    data: task,
    isPending,
    error,
    refetch,
  } = trpc.triggerRun.getById.useQuery(
    { id: taskId },
    { refetchInterval: 5000 },
  )

  const fetchToken = useCallback(async () => {
    if (task?.publicAccessToken) {
      return task.publicAccessToken
    }
    await refetch()
    return null
  }, [task?.publicAccessToken, refetch])

  // Use realtime updates for running tasks
  const { run: realtimeRun } = useTriggerRun({
    triggerDevRunId: task?.triggerRunId ?? null,
    triggerDevPublicAccessToken: task?.publicAccessToken ?? null,
    fetchPublicAccessToken: fetchToken,
    showToast: false,
    onStreamText: (text) => {
      setLogs((prev) => [...prev, text])
    },
  })

  // Fetch suggestions created by this run
  const utils = trpc.useUtils()

  const invalidateSuggestions = () => {
    void utils.suggestion.list.invalidate()
    void utils.suggestion.pendingCount.invalidate()
  }

  const acceptMutation = trpc.suggestion.accept.useMutation({
    onSuccess: () => invalidateSuggestions(),
    onError: (err) => toast.error(err.message || 'Failed to accept suggestion'),
  })

  const dismissMutation = trpc.suggestion.dismiss.useMutation({
    onSuccess: () => invalidateSuggestions(),
    onError: (err) =>
      toast.error(err.message || 'Failed to dismiss suggestion'),
  })

  const revertMutation = trpc.suggestion.revertToPending.useMutation({
    onSuccess: () => invalidateSuggestions(),
    onError: (err) => toast.error(err.message || 'Failed to undo'),
  })

  const isMutating =
    acceptMutation.isPending ||
    dismissMutation.isPending ||
    revertMutation.isPending

  const { data: suggestions } = trpc.suggestion.list.useQuery(
    {
      organizationId: task?.organizationId ?? '',
      triggerRunId: task?.triggerRunId ?? '',
    },
    { enabled: !!task, refetchInterval: isMutating ? false : 5000 },
  )

  if (isPending) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b">
          <div className="mx-auto flex h-14 max-w-6xl items-center px-4">
            <Skeleton className="h-6 w-48" />
          </div>
        </header>
        <main className="mx-auto max-w-6xl space-y-6 px-4 py-8">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-64 w-full" />
        </main>
      </div>
    )
  }

  if (error || !task) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b">
          <div className="mx-auto flex h-14 max-w-6xl items-center px-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Link>
            </Button>
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-4 py-8">
          <Card>
            <CardContent className="flex items-center gap-2 py-8 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <span>{error?.message ?? 'Task not found'}</span>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  // Merge realtime data with fetched data
  const effectiveStatus =
    realtimeRun?.status ?? task.triggerRun?.status ?? task.status
  const effectiveOutput = realtimeRun?.output ?? task.triggerRun?.output
  const effectiveError = task.triggerRun?.error

  // Extract issues from output if it exists
  const output = effectiveOutput as {
    scrapeIssues?: unknown[]
    [key: string]: unknown
  } | null
  const scrapeIssues = output?.scrapeIssues ?? []

  // Extract input data from payload
  const payload = task.payload as Record<string, unknown> | null
  const inputUrls = Array.isArray(payload?.urls)
    ? (payload.urls as string[])
    : []
  const files = task.files ?? []

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href={`/orgs/${task.organizationId}/agents/runs`}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Link>
            </Button>
            <Separator orientation="vertical" className="h-6" />
            <span className="font-mono text-sm text-muted-foreground">
              Task Details
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-6 px-4 py-8">
        {/* Task Header */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <StatusIcon status={effectiveStatus} />
                <div className="grid gap-1">
                  <CardTitle>{task.label}</CardTitle>
                  <CardDescription className="flex items-center gap-2">
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      {task.creator ? (
                        <>
                          <Avatar className="h-4 w-4">
                            {task.creator.image && (
                              <AvatarImage src={task.creator.image} />
                            )}
                            <AvatarFallback className="text-[8px]">
                              {task.creator.name?.charAt(0)?.toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          {task.creator.name} started{' '}
                        </>
                      ) : (
                        <>
                          <Timer className="h-3.5 w-3.5" />
                          Scheduled{' '}
                        </>
                      )}
                      <RelativeTime date={task.createdAt} />
                    </span>
                  </CardDescription>
                </div>
              </div>
              <StatusBadge status={effectiveStatus} />
            </div>
          </CardHeader>
        </Card>

        {/* Input */}
        {(inputUrls.length > 0 || files.length > 0) && (
          <Card>
            <CardContent className="space-y-6 p-4">
              {inputUrls.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">URLs</h4>
                  <ul className="space-y-1">
                    {inputUrls.map((url) => (
                      <li key={url}>
                        <a
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 underline hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          {url}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {files.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Files</h4>
                  <TooltipProvider>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                      {files.map((file) => (
                        <Tooltip key={file.id}>
                          <TooltipTrigger asChild>
                            <a
                              href={file.url}
                              download={file.name}
                              className="flex flex-col items-center gap-2 rounded-lg border p-4 transition-colors hover:bg-muted"
                            >
                              <FileIconByMime mimeType={file.mimeType} />
                              <span className="max-w-full truncate text-sm font-medium">
                                {file.name}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {formatFileSize(file.size)}
                              </span>
                              <Download className="h-4 w-4 text-muted-foreground" />
                            </a>
                          </TooltipTrigger>
                          <TooltipContent>Download</TooltipContent>
                        </Tooltip>
                      ))}
                    </div>
                  </TooltipProvider>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Suggestions */}
        {suggestions && suggestions.length > 0 ? (
          <>
            <div className="space-y-3">
              {suggestions.map((s) => (
                <SuggestionCard
                  key={s.id}
                  suggestion={s}
                  organizationId={task.organizationId}
                  onAccept={(id) => acceptMutation.mutate({ id })}
                  onDismiss={(id) => dismissMutation.mutate({ id })}
                  onUndo={(id) => revertMutation.mutate({ id })}
                  isLoading={isMutating}
                />
              ))}
            </div>
            <p className="text-center text-xs text-muted-foreground">
              Review all suggestions on the{' '}
              <Link
                href={`/orgs/${task.organizationId}/suggestions`}
                className="underline hover:text-foreground"
              >
                Suggestions page
              </Link>
            </p>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">
            No suggestions were created by this run.
          </p>
        )}

        {/* Debug Data */}
        <Collapsible defaultOpen={false}>
          <Card className="bg-muted/40">
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer py-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Debug Data
                  </CardTitle>
                  <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform [[data-state=open]>&]:rotate-180" />
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <Separator />
              <CardContent className="space-y-6 p-4">
                <p className="text-xs text-muted-foreground">
                  This is mostly for development purposes. Nothing to see
                  here...
                </p>
                {/* Raw Output */}
                {effectiveOutput && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-muted-foreground">
                      Raw Output
                    </h4>
                    <CodeViewer code={effectiveOutput} maxHeight={400} />
                  </div>
                )}

                {/* Metadata */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground">
                    Metadata
                  </h4>
                  <CodeViewer
                    code={{
                      id: task.id,
                      triggerRunId: task.triggerRunId,
                      organizationId: task.organizationId,
                      taskType: task.taskType,
                      status: effectiveStatus,
                      createdAt: task.createdAt,
                      updatedAt: task.updatedAt,
                      triggerRun: task.triggerRun
                        ? {
                            id: task.triggerRun.id,
                            status: task.triggerRun.status,
                            createdAt: task.triggerRun.createdAt,
                            startedAt: task.triggerRun.startedAt,
                            finishedAt: task.triggerRun.finishedAt,
                            isCompleted: task.triggerRun.isCompleted,
                            isFailed: task.triggerRun.isFailed,
                            isExecuting: task.triggerRun.isExecuting,
                          }
                        : null,
                    }}
                    maxHeight={400}
                  />
                </div>

                {/* Execution Logs */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground">
                    Execution Logs
                  </h4>
                  {logs.length > 0 ? (
                    <CodeViewer
                      code={logs.join('\n')}
                      language="text"
                      maxHeight={400}
                    />
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      No logs captured.
                    </p>
                  )}
                </div>

                {/* Scrape Issues */}
                {scrapeIssues.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-muted-foreground">
                      Scrape Issues ({scrapeIssues.length})
                    </h4>
                    <CodeViewer code={scrapeIssues} maxHeight={400} />
                  </div>
                )}

                {/* Error */}
                {effectiveError && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-destructive">
                      Error Details
                    </h4>
                    <CodeViewer code={effectiveError} maxHeight={400} />
                  </div>
                )}
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      </main>
    </div>
  )
}
