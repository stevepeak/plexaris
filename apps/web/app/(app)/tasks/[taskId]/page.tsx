'use client'

import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Construction,
  Loader2,
  XCircle,
} from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useCallback, useState } from 'react'

import { useTriggerRun } from '@/app/hooks/use-trigger-run'
import { CodeViewer } from '@/components/code-viewer'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link
                href={`/orgs/${task.organizationId}?tab=agents&agentsTab=runs`}
              >
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
        <Alert>
          <Construction className="h-4 w-4" />
          <AlertTitle>Active Development</AlertTitle>
          <AlertDescription>
            This page exposes agent execution details that end-users may not
            need. It will evolve as we learn what information is most useful to
            surface.
          </AlertDescription>
        </Alert>

        {/* Task Header */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <StatusIcon status={effectiveStatus} />
                <div className="grid gap-1">
                  <CardTitle>{task.label}</CardTitle>
                  <CardDescription className="flex items-center gap-2">
                    <Badge variant="outline" className="font-mono text-xs">
                      {task.taskType}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      Created {new Date(task.createdAt).toLocaleString()}
                    </span>
                  </CardDescription>
                </div>
              </div>
              <StatusBadge status={effectiveStatus} />
            </div>
          </CardHeader>
        </Card>

        {/* Tabbed Content */}
        <Tabs defaultValue="output" className="space-y-4">
          <TabsList>
            <TabsTrigger value="output">Output</TabsTrigger>
            <TabsTrigger value="logs">
              Logs {logs.length > 0 && `(${logs.length})`}
            </TabsTrigger>
            <TabsTrigger value="metadata">Metadata</TabsTrigger>
            {scrapeIssues.length > 0 && (
              <TabsTrigger value="issues">
                Issues ({scrapeIssues.length})
              </TabsTrigger>
            )}
            {effectiveError && <TabsTrigger value="error">Error</TabsTrigger>}
          </TabsList>

          <TabsContent value="output" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Task Output</CardTitle>
                <CardDescription>
                  The result returned by the task after execution
                </CardDescription>
              </CardHeader>
              <Separator />
              <CardContent className="p-4">
                {effectiveOutput ? (
                  <CodeViewer code={effectiveOutput} maxHeight={500} />
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No output available yet
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="logs" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Execution Logs</CardTitle>
                <CardDescription>
                  Real-time progress updates from the task
                </CardDescription>
              </CardHeader>
              <Separator />
              <CardContent className="p-4">
                {logs.length > 0 ? (
                  <CodeViewer
                    code={logs.join('\n')}
                    language="text"
                    maxHeight={500}
                  />
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No logs captured yet. Logs appear as the task runs.
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="metadata" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Task Metadata</CardTitle>
                <CardDescription>
                  Technical details about the task execution
                </CardDescription>
              </CardHeader>
              <Separator />
              <CardContent className="p-4">
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
              </CardContent>
            </Card>
          </TabsContent>

          {scrapeIssues.length > 0 && (
            <TabsContent value="issues" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Scrape Issues</CardTitle>
                  <CardDescription>
                    Problems encountered during data extraction
                  </CardDescription>
                </CardHeader>
                <Separator />
                <CardContent className="p-4">
                  <CodeViewer code={scrapeIssues} maxHeight={500} />
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {effectiveError && (
            <TabsContent value="error" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base text-destructive">
                    Error Details
                  </CardTitle>
                  <CardDescription>
                    Information about why the task failed
                  </CardDescription>
                </CardHeader>
                <Separator />
                <CardContent className="p-4">
                  <CodeViewer code={effectiveError} maxHeight={400} />
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </main>
    </div>
  )
}
