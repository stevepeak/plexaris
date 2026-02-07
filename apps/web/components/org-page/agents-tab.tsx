'use client'

import { Building, Package } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

import { ActiveTaskRow } from '@/components/active-task-row'
import { Button } from '@/components/ui/button'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { trpc } from '@/lib/trpc'

const PAGE_SIZE = 15

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

export function AgentsTab({ organizationId }: { organizationId: string }) {
  const utils = trpc.useUtils()
  const [page, setPage] = useState(1)

  const { data, isPending } = trpc.triggerRun.listAll.useQuery(
    { organizationId, page, limit: PAGE_SIZE },
    { refetchInterval: 5000 },
  )

  const scrapeOrgMutation = trpc.trigger.scrapeOrganizationDetails.useMutation({
    onSuccess: () => {
      toast.success('Organization details agent started')
      setPage(1)
      void utils.triggerRun.listAll.invalidate({ organizationId })
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to start agent')
    },
  })

  const discoverProductsMutation = trpc.trigger.discoverProducts.useMutation({
    onSuccess: () => {
      toast.success('Product discovery agent started')
      setPage(1)
      void utils.triggerRun.listAll.invalidate({ organizationId })
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to start agent')
    },
  })

  const runs = data?.items ?? []
  const totalPages = data?.totalPages ?? 1
  const hasRuns = runs.length > 0

  return (
    <div>
      <h2 className="text-lg font-semibold">Agents</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Launch AI agents to extract and discover data
      </p>
      <Separator className="my-6" />

      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={() => scrapeOrgMutation.mutate({ organizationId })}
          disabled={scrapeOrgMutation.isPending}
        >
          <Building className="mr-2 h-4 w-4" />
          {scrapeOrgMutation.isPending ? 'Starting...' : 'Organization Details'}
        </Button>
        <Button
          variant="outline"
          onClick={() => discoverProductsMutation.mutate({ organizationId })}
          disabled={discoverProductsMutation.isPending}
        >
          <Package className="mr-2 h-4 w-4" />
          {discoverProductsMutation.isPending
            ? 'Starting...'
            : 'Discover Products'}
        </Button>
      </div>

      <Separator className="my-6" />

      <h3 className="mb-4 text-sm font-medium">Agent Runs</h3>

      {isPending ? (
        <div className="space-y-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      ) : hasRuns ? (
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
      ) : (
        <p className="py-4 text-sm text-muted-foreground">
          No agent runs yet. Launch an agent above to get started.
        </p>
      )}
    </div>
  )
}
