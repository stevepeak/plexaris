'use client'

import { Lightbulb } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

import { SuggestionCard } from '@/components/suggestion-card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { trpc } from '@/lib/trpc'

export function SuggestionsTab({ organizationId }: { organizationId: string }) {
  const [statusFilter, setStatusFilter] = useState<string>('pending')
  const [targetTypeFilter, setTargetTypeFilter] = useState<string>('all')

  const utils = trpc.useUtils()

  const { data: suggestions, isPending } = trpc.suggestion.list.useQuery(
    {
      organizationId,
      status:
        statusFilter === 'all'
          ? undefined
          : (statusFilter as 'pending' | 'accepted' | 'rejected' | 'dismissed'),
      targetType:
        targetTypeFilter === 'all'
          ? undefined
          : (targetTypeFilter as 'product' | 'organization'),
    },
    { refetchInterval: 5000 },
  )

  const acceptMutation = trpc.suggestion.accept.useMutation({
    onSuccess: () => {
      toast.success('Suggestion accepted')
      void utils.suggestion.list.invalidate({ organizationId })
      void utils.suggestion.pendingCount.invalidate({ organizationId })
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to accept suggestion')
    },
  })

  const rejectMutation = trpc.suggestion.reject.useMutation({
    onSuccess: () => {
      toast.success('Suggestion rejected')
      void utils.suggestion.list.invalidate({ organizationId })
      void utils.suggestion.pendingCount.invalidate({ organizationId })
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to reject suggestion')
    },
  })

  const dismissMutation = trpc.suggestion.dismiss.useMutation({
    onSuccess: () => {
      toast.success('Suggestion dismissed')
      void utils.suggestion.list.invalidate({ organizationId })
      void utils.suggestion.pendingCount.invalidate({ organizationId })
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to dismiss suggestion')
    },
  })

  const isMutating =
    acceptMutation.isPending ||
    rejectMutation.isPending ||
    dismissMutation.isPending

  return (
    <div>
      <h2 className="text-lg font-semibold">Suggestions</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Review AI-generated suggestions before applying changes
      </p>
      <Separator className="my-6" />

      <div className="mb-4 flex gap-2">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="accepted">Accepted</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
            <SelectItem value="dismissed">Dismissed</SelectItem>
          </SelectContent>
        </Select>

        <Select value={targetTypeFilter} onValueChange={setTargetTypeFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            <SelectItem value="product">Products</SelectItem>
            <SelectItem value="organization">Organization</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isPending ? (
        <div className="space-y-3">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      ) : suggestions && suggestions.length > 0 ? (
        <div className="space-y-3">
          {suggestions.map((s) => (
            <SuggestionCard
              key={s.id}
              suggestion={s}
              onAccept={(id) => acceptMutation.mutate({ id })}
              onReject={(id) => rejectMutation.mutate({ id })}
              onDismiss={(id) => dismissMutation.mutate({ id })}
              isLoading={isMutating}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Lightbulb className="mb-3 h-10 w-10 text-muted-foreground/50" />
          <p className="text-sm font-medium text-muted-foreground">
            No suggestions yet
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Run an agent from the Agents tab to generate suggestions
          </p>
        </div>
      )}
    </div>
  )
}
