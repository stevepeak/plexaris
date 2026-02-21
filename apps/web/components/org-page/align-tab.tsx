'use client'

import {
  FileSpreadsheet,
  FileText,
  Image,
  Lightbulb,
  Receipt,
  ScrollText,
  Upload,
} from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useCallback, useState } from 'react'

import { cn } from '@/lib/utils'

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

export function AlignTab(_props: { organizationId: string }) {
  const { orgId } = useParams<{ orgId: string }>()
  const [isDragging, setIsDragging] = useState(false)

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

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    // No-op for now — backend not yet implemented
  }, [])

  return (
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
          href={`/orgs/${orgId}?tab=suggestions`}
          className="inline-flex items-center gap-1 decoration-yellow-500/60 decoration-wavy underline-offset-4 hover:underline-offset-2 underline transition-all"
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
  )
}
