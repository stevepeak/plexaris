'use client'

import {
  Building2,
  Check,
  ExternalLink,
  EyeOff,
  Package,
  Undo2,
  Zap,
} from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { cn } from '@/lib/utils'

export interface SuggestionCardData {
  id: string
  targetType: 'product' | 'organization'
  targetId: string | null
  action: 'create' | 'update' | 'update_field'
  field: string | null
  label: string
  currentValue?: unknown
  proposedValue?: unknown
  confidence: string | null
  source: string | null
  reasoning: string | null
  triggerRunId: string
  status: 'pending' | 'accepted' | 'rejected' | 'dismissed'
  reviewedAt: string | null
  reviewerName: string | null
  reviewerImage: string | null
  createdAt: string
}

interface SuggestionCardProps {
  suggestion: SuggestionCardData
  organizationId?: string
  onAccept?: (id: string) => void
  onDismiss?: (id: string) => void
  onUndo?: (id: string) => void
  isLoading?: boolean
}

function categoryInfo(
  action: SuggestionCardData['action'],
  targetType: SuggestionCardData['targetType'],
): { label: string; className: string } {
  const target = targetType === 'product' ? 'product' : 'organization'
  switch (action) {
    case 'create':
      return {
        label: `New ${target}`,
        className: 'border-green-200 bg-green-50 text-green-700',
      }
    case 'update':
      return {
        label: `Update ${target}`,
        className: 'border-blue-200 bg-blue-50 text-blue-700',
      }
    case 'update_field':
      return {
        label: `Update ${target}`,
        className: 'border-blue-200 bg-blue-50 text-blue-700',
      }
  }
}

function statusVariant(
  status: string,
): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case 'accepted':
      return 'default'
    case 'dismissed':
      return 'secondary'
    default:
      return 'outline'
  }
}

function formatValue(value: unknown): string {
  if (value === null || value === undefined) return '(empty)'
  if (typeof value === 'string') return value
  return JSON.stringify(value, null, 2)
}

export function SuggestionCard({
  suggestion,
  organizationId,
  onAccept,
  onDismiss,
  onUndo,
  isLoading,
}: SuggestionCardProps) {
  const [resolvedAs, setResolvedAs] = useState<'accepted' | 'dismissed' | null>(
    null,
  )

  const effectiveStatus = resolvedAs ?? suggestion.status
  const isPending = effectiveStatus === 'pending'
  const Icon = suggestion.targetType === 'product' ? Package : Building2
  const category = categoryInfo(suggestion.action, suggestion.targetType)

  // Product create with a linked draft — show review link instead of raw JSON
  const hasLinkedDraft =
    suggestion.targetType === 'product' &&
    suggestion.action === 'create' &&
    suggestion.targetId != null

  function handleAccept() {
    setResolvedAs('accepted')
    onAccept?.(suggestion.id)
  }

  function handleDismiss() {
    setResolvedAs('dismissed')
    onDismiss?.(suggestion.id)
  }

  function handleUndo() {
    setResolvedAs(null)
    onUndo?.(suggestion.id)
  }

  return (
    <Card
      className={cn(
        'transition-opacity duration-300',
        !isPending && 'opacity-60',
      )}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className={cn('shrink-0 text-xs', category.className)}
            >
              <Icon className="h-3 w-3" />
              {category.label}
            </Badge>
            <CardTitle className="text-sm font-medium">
              {suggestion.label}
            </CardTitle>
          </div>
          {!isPending && (
            <Badge
              variant={statusVariant(effectiveStatus)}
              className="shrink-0 text-xs"
            >
              {effectiveStatus}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-3 pb-3">
        {suggestion.action === 'update_field' && suggestion.field && (
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">
              Field:{' '}
              <code className="rounded bg-muted px-1">{suggestion.field}</code>
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <p className="font-medium text-muted-foreground">Current</p>
                <pre className="mt-0.5 max-h-24 overflow-auto whitespace-pre-wrap rounded bg-muted p-2">
                  {formatValue(suggestion.currentValue)}
                </pre>
              </div>
              <div>
                <p className="font-medium text-muted-foreground">Proposed</p>
                <pre className="mt-0.5 max-h-24 overflow-auto whitespace-pre-wrap rounded bg-green-50 p-2">
                  {formatValue(suggestion.proposedValue)}
                </pre>
              </div>
            </div>
          </div>
        )}

        {suggestion.action === 'create' && !hasLinkedDraft && (
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">
              Proposed data
            </p>
            <pre className="max-h-48 overflow-auto whitespace-pre-wrap rounded bg-green-50 p-2 text-xs">
              {formatValue(suggestion.proposedValue)}
            </pre>
          </div>
        )}

        {suggestion.action === 'update' && (
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">
              Proposed update
            </p>
            <pre className="max-h-48 overflow-auto whitespace-pre-wrap rounded bg-green-50 p-2 text-xs">
              {formatValue(suggestion.proposedValue)}
            </pre>
          </div>
        )}

        {suggestion.reasoning && (
          <p className="text-xs text-muted-foreground">
            {suggestion.reasoning}
          </p>
        )}

        <p className="text-xs text-muted-foreground">
          {suggestion.source && (
            <>
              <a
                href={suggestion.source}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
              >
                {suggestion.source}
              </a>
              {' discovered by '}
            </>
          )}
          {!suggestion.source && 'Discovered by '}
          <Link
            href={`/tasks/${suggestion.triggerRunId}`}
            className="inline-flex items-center gap-0.5 align-baseline hover:underline"
          >
            <Zap className="h-3 w-3 shrink-0 translate-y-px" />
            Agent
          </Link>
          {' on '}
          {new Date(suggestion.createdAt).toLocaleDateString()}
          {effectiveStatus !== 'pending' &&
            suggestion.reviewerName &&
            suggestion.reviewedAt && (
              <>
                {` and ${effectiveStatus} by `}
                <span className="inline-flex items-center gap-1 align-baseline">
                  <Avatar className="inline-block h-4 w-4 translate-y-0.5">
                    {suggestion.reviewerImage && (
                      <AvatarImage src={suggestion.reviewerImage} />
                    )}
                    <AvatarFallback className="text-[8px]">
                      {suggestion.reviewerName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  {suggestion.reviewerName}
                </span>
                {' on '}
                {new Date(suggestion.reviewedAt).toLocaleDateString()}
              </>
            )}
        </p>
      </CardContent>

      {isPending && (
        <CardFooter className="gap-2 pt-0">
          {hasLinkedDraft && organizationId ? (
            <Button size="sm" variant="default" asChild>
              <Link
                href={`/orgs/${organizationId}/products/${suggestion.targetId}`}
              >
                <ExternalLink className="mr-1 h-3 w-3" />
                Review product
              </Link>
            </Button>
          ) : (
            <Button
              size="sm"
              variant="default"
              onClick={handleAccept}
              disabled={isLoading}
            >
              <Check className="mr-1 h-3 w-3" />
              Accept
            </Button>
          )}
          <Button
            size="sm"
            variant="ghost"
            onClick={handleDismiss}
            disabled={isLoading}
          >
            <EyeOff className="mr-1 h-3 w-3" />
            Dismiss
          </Button>
        </CardFooter>
      )}

      {resolvedAs && (
        <CardFooter className="pt-0">
          <Button
            size="sm"
            variant="ghost"
            onClick={handleUndo}
            disabled={isLoading}
          >
            <Undo2 className="mr-1 h-3 w-3" />
            Undo
          </Button>
        </CardFooter>
      )}
    </Card>
  )
}
