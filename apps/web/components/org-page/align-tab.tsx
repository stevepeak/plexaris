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
import { useCallback, useRef, useState } from 'react'
import { toast } from 'sonner'

import { trpc } from '@/lib/trpc'
import { uploadOrganizationFiles } from '@/lib/upload-files'
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

  const fileInputRef = useRef<HTMLInputElement>(null)
  const scrapeMutation = trpc.trigger.scrapeOrganization.useMutation()

  const uploadFiles = useCallback(
    async (files: FileList) => {
      if (files.length === 0 || isUploading) return

      setIsUploading(true)

      try {
        await uploadOrganizationFiles(Array.from(files), props.organizationId)

        const result = await scrapeMutation.mutateAsync({
          organizationId: props.organizationId,
          filesOnly: true,
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
      await uploadFiles(e.dataTransfer.files)
    },
    [uploadFiles],
  )

  const handleClick = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        await uploadFiles(e.target.files)
      }
      e.target.value = ''
    },
    [uploadFiles],
  )

  return (
    <>
      <div className="relative flex min-h-[calc(100vh-12rem)] items-center justify-center overflow-hidden">
        {/* Background pattern */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            maskImage:
              'radial-gradient(ellipse at center, black 40%, transparent 80%)',
            WebkitMaskImage:
              'radial-gradient(ellipse at center, black 40%, transparent 80%)',
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-violet-500/15 via-transparent to-cyan-500/15" />
          <div
            className="absolute inset-0 opacity-[0.08]"
            style={{
              backgroundImage:
                'linear-gradient(rgba(128,128,128,1) 1px, transparent 1px), linear-gradient(90deg, rgba(128,128,128,1) 1px, transparent 1px)',
              backgroundSize: '48px 48px',
            }}
          />
          <div className="absolute left-1/4 top-1/4 h-64 w-64 animate-pulse rounded-full bg-violet-500/20 blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 h-64 w-64 animate-pulse rounded-full bg-cyan-500/20 blur-3xl [animation-delay:1s]" />
          <svg className="absolute inset-0 h-full w-full opacity-[0.1]">
            <line
              x1="10%"
              y1="20%"
              x2="90%"
              y2="80%"
              stroke="currentColor"
              strokeWidth="1"
              strokeDasharray="8 8"
            />
            <line
              x1="90%"
              y1="20%"
              x2="10%"
              y2="80%"
              stroke="currentColor"
              strokeWidth="1"
              strokeDasharray="8 8"
            />
            <line
              x1="50%"
              y1="0%"
              x2="50%"
              y2="100%"
              stroke="currentColor"
              strokeWidth="1"
              strokeDasharray="8 8"
            />
          </svg>
        </div>

        {/* Dropzone */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={handleFileChange}
        />
        <div
          role="button"
          tabIndex={0}
          onClick={handleClick}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              handleClick()
            }
          }}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            'relative z-10 flex w-full max-w-lg cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-10 transition-all duration-200',
            isDragging
              ? 'border-primary bg-background shadow-[0_0_0_4px_rgba(var(--primary)/0.1)]'
              : 'border-muted-foreground/25 bg-background backdrop-blur-sm hover:border-muted-foreground/40',
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
              className={cn('h-10 w-10', isDragging && 'animate-wobble')}
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
            Plexaris AI will discover product and organization details and turn
            them into{' '}
            <Link
              href={`/orgs/${orgId}/suggestions`}
              className="inline-flex items-center gap-1 decoration-yellow-500/60 decoration-wavy underline-offset-4 transition-all hover:underline-offset-2 underline"
            >
              <Lightbulb className="h-3.5 w-3.5 text-yellow-500" />
              <span className="font-medium text-foreground">Suggestions</span>
            </Link>
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-2">
            {FILE_HINTS.map((hint) => (
              <div
                key={hint.label}
                className={cn(
                  'flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium',
                  hint.color,
                  isDragging && 'animate-wobble',
                )}
              >
                <hint.icon className="h-3.5 w-3.5" />
                {hint.label}
              </div>
            ))}
          </div>
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
