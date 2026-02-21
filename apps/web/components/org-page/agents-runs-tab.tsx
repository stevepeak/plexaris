'use client'

import { CheckCircle2, Loader2 } from 'lucide-react'
import { useState } from 'react'

import { ActiveTaskRow } from '@/components/active-task-row'
import { Badge } from '@/components/ui/badge'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import { Skeleton } from '@/components/ui/skeleton'
import { trpc } from '@/lib/trpc'

const PAGE_SIZE = 15

const PLACEHOLDER_RUNS = [
  {
    label: 'Weekly Supplier Update',
    status: 'completed',
    time: '2 hours ago',
  },
  {
    label: 'Competitive Analysis',
    status: 'running',
    time: '5 minutes ago',
  },
  {
    label: 'Product Catalog Refresh',
    status: 'completed',
    time: '3 days ago',
  },
]

function getPageNumbers(
  currentPage: number,
  totalPages: number,
): (number | 'ellipsis')[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1)
  }

  const pages: (number | 'ellipsis')[] = [1]

  if (currentPage > 3) {
    pages.push('ellipsis')
  }

  const start = Math.max(2, currentPage - 1)
  const end = Math.min(totalPages - 1, currentPage + 1)

  for (let i = start; i <= end; i++) {
    pages.push(i)
  }

  if (currentPage < totalPages - 2) {
    pages.push('ellipsis')
  }

  pages.push(totalPages)

  return pages
}

export function AgentsRunsTab({ organizationId }: { organizationId: string }) {
  const [page, setPage] = useState(1)

  const { data, isPending } = trpc.triggerRun.listAll.useQuery(
    { organizationId, page, limit: PAGE_SIZE },
    { refetchInterval: 5000 },
  )

  const runs = data?.items ?? []
  const totalPages = data?.totalPages ?? 1
  const hasRuns = runs.length > 0

  if (isPending) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    )
  }

  if (!hasRuns) {
    return (
      <div className="relative">
        <div
          aria-hidden
          className="pointer-events-none select-none space-y-0 divide-y rounded-md border blur-[6px]"
        >
          {PLACEHOLDER_RUNS.map((p) => (
            <div
              key={p.label}
              className="flex items-center justify-between px-6 py-3 opacity-40"
            >
              <div className="flex items-center gap-3">
                {p.status === 'running' ? (
                  <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                ) : (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                )}
                <span className="text-sm font-medium">{p.label}</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {p.status}
                </Badge>
                <span className="text-xs text-muted-foreground">{p.time}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="absolute inset-0 flex items-center justify-center bg-background/60">
          <div className="text-center">
            <p className="text-sm font-medium">No runs yet</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Create a schedule to start running agents automatically.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="divide-y rounded-md border">
        {runs.map((run) => (
          <ActiveTaskRow key={run.id} run={run} />
        ))}
      </div>

      {totalPages > 1 && (
        <Pagination className="mt-6">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className={
                  page <= 1
                    ? 'pointer-events-none opacity-50'
                    : 'cursor-pointer'
                }
              />
            </PaginationItem>

            {getPageNumbers(page, totalPages).map((p, i) =>
              p === 'ellipsis' ? (
                <PaginationItem key={`ellipsis-${i}`}>
                  <PaginationEllipsis />
                </PaginationItem>
              ) : (
                <PaginationItem key={p}>
                  <PaginationLink
                    isActive={p === page}
                    onClick={() => setPage(p)}
                    className="cursor-pointer"
                  >
                    {p}
                  </PaginationLink>
                </PaginationItem>
              ),
            )}

            <PaginationItem>
              <PaginationNext
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className={
                  page >= totalPages
                    ? 'pointer-events-none opacity-50'
                    : 'cursor-pointer'
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </>
  )
}
