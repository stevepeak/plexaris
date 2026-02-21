'use client'

import { Play, Plus, Trash2, X } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { trpc } from '@/lib/trpc'

function formatRelativeTime(date: Date): string {
  const now = Date.now()
  const diffMs = date.getTime() - now
  const diffHours = Math.round(diffMs / (1000 * 60 * 60))
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24))

  if (diffMs < 0) return 'overdue'
  if (diffHours < 1) return 'in less than an hour'
  if (diffHours < 24) return `in ${diffHours} hour${diffHours === 1 ? '' : 's'}`
  return `in ${diffDays} day${diffDays === 1 ? '' : 's'}`
}

const SCHEDULE_TYPE_LABELS: Record<string, string> = {
  org_information_update: 'Organization Information Update',
  product_updating: 'Product Updating',
  competitive_analysis: 'Competitive Analysis',
  reduce_cost_analysis: 'Reduce Cost Analysis',
}

const FREQUENCY_LABELS: Record<string, string> = {
  daily: 'Daily',
  weekly: 'Weekly',
  biweekly: 'Bi-weekly',
  monthly: 'Monthly',
}

const PLACEHOLDER_SCHEDULES = [
  { name: 'Weekly Supplier Update', frequency: 'Weekly', next: 'in 3 days' },
  {
    name: 'Competitive Analysis',
    frequency: 'Bi-weekly',
    next: 'in 10 days',
  },
  { name: 'Product Catalog Refresh', frequency: 'Monthly', next: 'in 22 days' },
]

export function AgentsSchedulesTab({
  organizationId,
}: {
  organizationId: string
}) {
  const utils = trpc.useUtils()
  const { data: schedules, isPending } = trpc.agentSchedule.list.useQuery({
    organizationId,
  })

  const deleteMutation = trpc.agentSchedule.delete.useMutation({
    onSuccess: () => {
      toast.success('Schedule deleted')
      void utils.agentSchedule.list.invalidate({ organizationId })
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete schedule')
    },
  })

  const runNowMutation = trpc.agentSchedule.runNow.useMutation({
    onSuccess: () => {
      toast.success('Agent started')
      void utils.triggerRun.listAll.invalidate({ organizationId })
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to run agent')
    },
  })

  if (isPending) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {schedules && schedules.length > 0 ? (
        <div className="divide-y rounded-md border">
          {schedules.map((schedule) => (
            <div
              key={schedule.id}
              className="group flex items-center justify-between px-6 py-3"
            >
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium">
                  {schedule.name ||
                    SCHEDULE_TYPE_LABELS[schedule.scheduleType] ||
                    schedule.scheduleType}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">
                  {FREQUENCY_LABELS[schedule.frequency] || schedule.frequency},
                  next {formatRelativeTime(new Date(schedule.nextRunAt))}
                </span>
                <TooltipProvider delayDuration={300}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 opacity-0 transition-opacity group-hover:opacity-100"
                        onClick={() =>
                          runNowMutation.mutate({ id: schedule.id })
                        }
                        disabled={runNowMutation.isPending}
                      >
                        <Play className="h-3.5 w-3.5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Run now</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 opacity-0 transition-opacity group-hover:opacity-100"
                        onClick={() =>
                          deleteMutation.mutate({ id: schedule.id })
                        }
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Delete schedule</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="relative">
          <div
            aria-hidden
            className="pointer-events-none select-none space-y-0 divide-y rounded-md border blur-[6px]"
          >
            {PLACEHOLDER_SCHEDULES.map((p) => (
              <div
                key={p.name}
                className="flex items-center justify-between px-6 py-3 opacity-40"
              >
                <span className="text-sm font-medium">{p.name}</span>
                <span className="text-xs text-muted-foreground">
                  {p.frequency}, next {p.next}
                </span>
              </div>
            ))}
          </div>
          <div className="absolute inset-0 flex items-center justify-center bg-background/60">
            <div className="text-center">
              <p className="text-sm font-medium">No schedules yet</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Create a schedule to automate your agents on a recurring basis.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export function CreateScheduleDialog({
  organizationId,
}: {
  organizationId: string
}) {
  const utils = trpc.useUtils()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [scheduleType, setScheduleType] = useState('')
  const [frequency, setFrequency] = useState('')
  const [urlInput, setUrlInput] = useState('')
  const [urls, setUrls] = useState<string[]>([])

  const requiresUrls =
    scheduleType === 'org_information_update' ||
    scheduleType === 'product_updating'

  const createMutation = trpc.agentSchedule.create.useMutation({
    onSuccess: () => {
      toast.success('Schedule created')
      setOpen(false)
      resetForm()
      void utils.agentSchedule.list.invalidate({ organizationId })
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create schedule')
    },
  })

  function resetForm() {
    setName('')
    setScheduleType('')
    setFrequency('')
    setUrlInput('')
    setUrls([])
  }

  function addUrl() {
    const trimmed = urlInput.trim()
    if (trimmed && !urls.includes(trimmed)) {
      setUrls([...urls, trimmed])
      setUrlInput('')
    }
  }

  function removeUrl(url: string) {
    setUrls(urls.filter((u) => u !== url))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!scheduleType || !frequency) return

    createMutation.mutate({
      organizationId,
      name: name || undefined,
      scheduleType: scheduleType as
        | 'org_information_update'
        | 'product_updating'
        | 'competitive_analysis'
        | 'reduce_cost_analysis',
      frequency: frequency as 'daily' | 'weekly' | 'biweekly' | 'monthly',
      urls,
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="mr-2 h-4 w-4" />
          New Schedule
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Schedule</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name (optional)</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Weekly supplier update"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="scheduleType">Schedule Type</Label>
            <Select value={scheduleType} onValueChange={setScheduleType}>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="org_information_update">
                  Organization Information Update
                </SelectItem>
                <SelectItem value="product_updating">
                  Product Updating
                </SelectItem>
                <SelectItem value="competitive_analysis" disabled>
                  Competitive Analysis (Coming Soon)
                </SelectItem>
                <SelectItem value="reduce_cost_analysis" disabled>
                  Reduce Cost Analysis (Coming Soon)
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="frequency">Frequency</Label>
            <Select value={frequency} onValueChange={setFrequency}>
              <SelectTrigger>
                <SelectValue placeholder="Select frequency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="biweekly">Bi-weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="urls">URLs to scrape</Label>
            <div className="flex gap-2">
              <Input
                id="urls"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://example.com"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    addUrl()
                  }
                }}
              />
              <Button type="button" variant="outline" onClick={addUrl}>
                Add
              </Button>
            </div>
            {urls.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {urls.map((url) => (
                  <Badge
                    key={url}
                    variant="secondary"
                    className="gap-1 text-xs"
                  >
                    <span className="max-w-[200px] truncate">{url}</span>
                    <button
                      type="button"
                      onClick={() => removeUrl(url)}
                      className="ml-1"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label>Google Drive</Label>
            <p className="text-sm text-muted-foreground">Coming Soon</p>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={
              !scheduleType ||
              !frequency ||
              (requiresUrls && urls.length === 0) ||
              createMutation.isPending
            }
          >
            {createMutation.isPending ? 'Creating...' : 'Create Schedule'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
