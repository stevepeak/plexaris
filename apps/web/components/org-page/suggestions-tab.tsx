'use client'

import {
  Bot,
  Building2,
  Check,
  EyeOff,
  HelpCircle,
  MessageSquare,
  Package,
  Users,
} from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

import { SuggestionCard } from '@/components/suggestion-card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
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

const SUGGESTION_SOURCES = [
  {
    icon: Bot,
    title: 'AI Agents',
    description:
      'Agents analyze your data and suggest improvements to products, pricing, and strategy.',
    iconColor: 'text-violet-500',
  },
  {
    icon: Users,
    title: 'Team Members',
    description:
      'Your team can submit suggestions for changes based on their expertise and observations.',
    iconColor: 'text-blue-500',
  },
  {
    icon: MessageSquare,
    title: 'Customers',
    description:
      'Customer feedback and requests are captured as actionable suggestions.',
    iconColor: 'text-green-500',
  },
] as const

const PLACEHOLDER_SUGGESTIONS = [
  {
    icon: Package,
    label: 'Update product pricing for Premium Plan',
    action: 'update_field',
    reasoning:
      'Market analysis suggests a 15% price increase would align with competitor pricing while maintaining value proposition.',
  },
  {
    icon: Building2,
    label: 'Add new product category: Enterprise Tools',
    action: 'create',
    reasoning:
      'Customer feedback indicates demand for enterprise-tier tooling with dedicated support and SLA guarantees.',
  },
  {
    icon: Package,
    label: 'Update description for Starter Kit',
    action: 'update_field',
    reasoning:
      'Current description lacks key differentiators. Proposed copy highlights onboarding speed and integration options.',
  },
] as const

function SuggestionSourceCards({ compact }: { compact?: boolean }) {
  return (
    <div className={compact ? 'space-y-2' : 'grid gap-4 sm:grid-cols-3'}>
      {SUGGESTION_SOURCES.map((source) => (
        <div
          key={source.title}
          className={
            compact
              ? 'flex gap-3'
              : 'rounded-lg border bg-card p-4 text-card-foreground'
          }
        >
          <source.icon
            className={`${source.iconColor} ${compact ? 'mt-0.5 h-4 w-4 shrink-0' : 'mb-2 h-5 w-5'}`}
          />
          <div>
            <p className={`font-medium ${compact ? 'text-xs' : 'text-sm'}`}>
              {source.title}
            </p>
            <p
              className={`text-muted-foreground ${compact ? 'text-xs' : 'mt-1 text-xs'}`}
            >
              {source.description}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}

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
          : (statusFilter as 'pending' | 'accepted' | 'dismissed'),
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

  const isMutating = acceptMutation.isPending || dismissMutation.isPending

  return (
    <div>
      <div className="flex items-center gap-2">
        <h2 className="text-lg font-semibold">Suggestions</h2>
        <Popover>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="text-muted-foreground hover:text-foreground"
            >
              <HelpCircle className="h-4 w-4" />
            </button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-80">
            <p className="mb-3 text-sm font-medium">
              Where do suggestions come from?
            </p>
            <SuggestionSourceCards compact />
          </PopoverContent>
        </Popover>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        Review and apply suggestions from agents, your team, and customers
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
              organizationId={organizationId}
              onAccept={(id) => acceptMutation.mutate({ id })}
              onDismiss={(id) => dismissMutation.mutate({ id })}
              isLoading={isMutating}
            />
          ))}
        </div>
      ) : (
        <div className="relative">
          {/* Blurred placeholder cards */}
          <div
            aria-hidden
            className="pointer-events-none select-none space-y-3 blur-[6px]"
          >
            {PLACEHOLDER_SUGGESTIONS.map((p) => (
              <Card key={p.label} className="opacity-40">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <p.icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                      <CardTitle className="text-sm font-medium">
                        {p.label}
                      </CardTitle>
                    </div>
                    <div className="flex shrink-0 items-center gap-1.5">
                      <Badge variant="outline" className="text-xs">
                        {p.action}
                      </Badge>
                      <Badge
                        variant="outline"
                        className="border-green-200 bg-green-100 text-xs text-green-800"
                      >
                        high
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pb-3">
                  <p className="text-xs text-muted-foreground">{p.reasoning}</p>
                </CardContent>
                <CardFooter className="gap-2 pt-0">
                  <Button size="sm" variant="default" disabled>
                    <Check className="mr-1 h-3 w-3" />
                    Accept
                  </Button>
                  <Button size="sm" variant="ghost" disabled>
                    <EyeOff className="mr-1 h-3 w-3" />
                    Dismiss
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>

          {/* Overlay with source cards */}
          <div className="absolute inset-0 flex items-center justify-center bg-background/60">
            <div className="w-full max-w-2xl px-4">
              <p className="mb-4 text-center text-sm font-medium">
                No suggestions yet
              </p>
              <p className="mb-5 text-center text-xs text-muted-foreground">
                Suggestions can come from three sources:
              </p>
              <SuggestionSourceCards />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
