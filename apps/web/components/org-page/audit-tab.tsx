'use i18n'
'use client'

import { Search } from 'lucide-react'
import { useEffect, useState } from 'react'

import { RelativeTime } from '@/components/relative-time'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { trpc } from '@/lib/trpc'

const PAGE_SIZE = 20

const ENTITY_TYPES = [
  { value: 'all', label: 'All types' },
  { value: 'order', label: 'Order' },
  { value: 'suggestion', label: 'Suggestion' },
  { value: 'agent_schedule', label: 'Agent Schedule' },
  { value: 'organization', label: 'Organization' },
  { value: 'role', label: 'Role' },
  { value: 'membership', label: 'Membership' },
  { value: 'invitation', label: 'Invitation' },
]

function EntityTypeLabel({ text }: { text: string }) {
  switch (text) {
    case 'All types':
      return <span>All types</span>
    case 'Order':
      return <span>Order</span>
    case 'Suggestion':
      return <span>Suggestion</span>
    case 'Agent Schedule':
      return <span>Agent Schedule</span>
    case 'Organization':
      return <span>Organization</span>
    case 'Role':
      return <span>Role</span>
    case 'Membership':
      return <span>Membership</span>
    case 'Invitation':
      return <span>Invitation</span>
    default:
      return <span>{text}</span>
  }
}

function formatAction(action: string): string {
  return action.replace(/[._]/g, ' ')
}

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

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

function formatValue(val: unknown): string {
  if (val === null || val === undefined) return '(empty)'
  if (typeof val === 'string') return val
  if (Array.isArray(val)) return val.join(', ')
  return JSON.stringify(val)
}

function ChangesDisplay({
  payload,
}: {
  payload: Record<string, unknown> | null
}) {
  if (!payload) return null

  const changes = payload.changes as
    | Record<string, { from: unknown; to: unknown }>
    | undefined

  if (!changes || Object.keys(changes).length === 0) {
    // Show other payload keys as simple key-value pairs
    const entries = Object.entries(payload).filter(([k]) => k !== 'changes')
    if (entries.length === 0) return null
    return (
      <div className="space-y-0.5">
        {entries.map(([key, val]) => (
          <div key={key} className="text-xs text-muted-foreground">
            <span className="font-medium">{key}:</span> {formatValue(val)}
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-0.5">
      {Object.entries(changes).map(([field, { from, to }]) => (
        <div key={field} className="text-xs">
          <span className="font-medium text-muted-foreground">{field}:</span>{' '}
          <span className="text-red-500/70 line-through">
            {formatValue(from)}
          </span>{' '}
          <span className="text-green-600">{formatValue(to)}</span>
        </div>
      ))}
    </div>
  )
}

export function AuditTab({ organizationId }: { organizationId: string }) {
  const [page, setPage] = useState(1)
  const [entityType, setEntityType] = useState('all')
  const [searchInput, setSearchInput] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput)
      setPage(1)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchInput])

  const { data, isPending } = trpc.audit.list.useQuery({
    organizationId,
    page,
    limit: PAGE_SIZE,
    entityType: entityType === 'all' ? undefined : entityType,
    search: debouncedSearch || undefined,
  })

  const items = data?.items ?? []
  const totalPages = data?.totalPages ?? 1

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search actions or users..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select
          value={entityType}
          onValueChange={(v) => {
            setEntityType(v)
            setPage(1)
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ENTITY_TYPES.map((t) => (
              <SelectItem key={t.value} value={t.value}>
                <EntityTypeLabel text={t.label} />
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isPending ? (
        <div className="space-y-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      ) : items.length === 0 ? (
        <div className="flex items-center justify-center rounded-md border py-12">
          <div className="text-center">
            <p className="text-sm font-medium">No audit entries</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Actions will appear here as they occur.
            </p>
          </div>
        </div>
      ) : (
        <>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Entity</TableHead>
                  <TableHead>Changes</TableHead>
                  <TableHead className="text-right">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          {item.actorImage && (
                            <AvatarImage src={item.actorImage} />
                          )}
                          <AvatarFallback className="text-[10px]">
                            {getInitials(item.actorName)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm">{item.actorName}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="capitalize">
                        {formatAction(item.action)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs text-muted-foreground">
                        {item.entityType}
                      </span>
                      {item.entityId && (
                        <span className="ml-1 font-mono text-xs text-muted-foreground">
                          {item.entityId.slice(0, 8)}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <ChangesDisplay payload={item.payload} />
                    </TableCell>
                    <TableCell className="text-right">
                      <RelativeTime
                        date={item.createdAt}
                        className="text-xs text-muted-foreground"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {totalPages > 1 && (
            <Pagination>
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
      )}
    </div>
  )
}
