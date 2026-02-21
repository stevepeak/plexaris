'use client'

import {
  FileSpreadsheet,
  FileText,
  Image,
  Lightbulb,
  Loader2,
  Receipt,
  ScrollText,
  Upload,
} from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useCallback, useState } from 'react'
import { toast } from 'sonner'

import { trpc } from '@/lib/trpc'
import { cn } from '@/lib/utils'

import { AlignProgressDialog } from './align-progress-dialog'

const FILE_HINTS = [
  { icon: FileText, label: 'Catalogs', color: 'text-blue-500 bg-blue-500/10' },
  {
    icon: Receipt,
    label: 'Invoices',
    color: 'text-emerald-500 bg-emerald-500/10',
  },
  {
    icon: FileSpreadsheet,
    label: 'Price lists',
    color: 'text-amber-500 bg-amber-500/10',
  },
  {
    icon: ScrollText,
    label: 'Contracts',
    color: 'text-violet-500 bg-violet-500/10',
  },
  {
    icon: Image,
    label: 'Images',
    color: 'text-rose-500 bg-rose-500/10',
  },
] as const

export function AlignTab(props: { organizationId: string }) {
  const { orgId } = useParams<{ orgId: string }>()
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [triggerDevRunId, setTriggerDevRunId] = useState<string | null>(null)
  const [publicAccessToken, setPublicAccessToken] = useState<string | null>(
    null,
  )
  const [taskId, setTaskId] = useState<string | null>(null)

  const scrapeMutation = trpc.trigger.scrapeOrganization.useMutation()

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragging(false)

      const files = e.dataTransfer.files
      if (files.length === 0 || isUploading) return

      setIsUploading(true)

      try {
        // Upload files
        const formData = new FormData()
        for (const file of files) {
          formData.append('files', file)
        }

        const res = await fetch(
          `/api/organizations/${props.organizationId}/files`,
          { method: 'POST', body: formData },
        )

        if (!res.ok) {
          throw new Error('File upload failed')
        }

        // Trigger scrape
        const result = await scrapeMutation.mutateAsync({
          organizationId: props.organizationId,
        })

        setTriggerDevRunId(result.runId)
        setPublicAccessToken(result.publicAccessToken)
        setTaskId(result.taskId)
        setDialogOpen(true)
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Something went wrong')
      } finally {
        setIsUploading(false)
      }
    },
    [isUploading, props.organizationId, scrapeMutation],
  )

  return (
    <>
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          'relative flex min-h-[480px] flex-col items-center justify-center rounded-xl border-2 border-dashed transition-all duration-200',
          isDragging
            ? 'border-primary bg-primary/5 shadow-[0_0_0_4px_rgba(var(--primary)/0.1)]'
            : 'border-muted-foreground/25 hover:border-muted-foreground/40 hover:bg-muted/30',
        )}
      >
        {isUploading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-background/80 backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="text-sm font-medium">Uploading files...</span>
            </div>
          </div>
        )}

        <div
          className={cn(
            'mb-5 rounded-full p-5 transition-all duration-200',
            isDragging
              ? 'bg-primary/10 text-primary'
              : 'bg-muted text-muted-foreground',
          )}
        >
          <Upload
            className={cn(
              'h-10 w-10 transition-transform duration-200',
              isDragging && 'scale-110',
            )}
          />
        </div>
        <p
          className={cn(
            'text-xl font-semibold transition-colors',
            isDragging ? 'text-primary' : 'text-foreground',
          )}
        >
          {isDragging ? 'Drop files here' : 'Drop any document here'}
        </p>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Agents will turn it into{' '}
          <Link
            href={`/orgs/${orgId}/suggestions`}
            className="inline-flex items-center gap-1 decoration-yellow-500/60 decoration-wavy underline-offset-4 transition-all hover:underline-offset-2 underline"
          >
            <Lightbulb className="h-3.5 w-3.5 text-yellow-500" />
            <span className="font-medium text-foreground">Suggestions</span>
          </Link>{' '}
          for your org
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-2">
          {FILE_HINTS.map((hint) => (
            <div
              key={hint.label}
              className={cn(
                'flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-opacity',
                hint.color,
                isDragging && 'opacity-40',
              )}
            >
              <hint.icon className="h-3.5 w-3.5" />
              {hint.label}
            </div>
          ))}
        </div>
      </div>

      {triggerDevRunId && publicAccessToken && taskId && (
        <AlignProgressDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          triggerDevRunId={triggerDevRunId}
          triggerDevPublicAccessToken={publicAccessToken}
          taskId={taskId}
          orgId={orgId}
        />
      )}
    </>
  )
}
