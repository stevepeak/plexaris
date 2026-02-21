'use client'

import {
  Building2,
  Check,
  ExternalLink,
  EyeOff,
  Package,
  Zap,
} from 'lucide-react'
import Link from 'next/link'

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
  createdAt: string
}

interface SuggestionCardProps {
  suggestion: SuggestionCardData
  organizationId?: string
  onAccept?: (id: string) => void
  onDismiss?: (id: string) => void
  isLoading?: boolean
}

function confidenceColor(confidence: string | null) {
  switch (confidence) {
    case 'high':
      return 'bg-green-100 text-green-800 border-green-200'
    case 'medium':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    case 'low':
      return 'bg-red-100 text-red-800 border-red-200'
    default:
      return ''
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
  isLoading,
}: SuggestionCardProps) {
  const isPending = suggestion.status === 'pending'
  const Icon = suggestion.targetType === 'product' ? Package : Building2

  // Product create with a linked draft — show review link instead of raw JSON
  const hasLinkedDraft =
    suggestion.targetType === 'product' &&
    suggestion.action === 'create' &&
    suggestion.targetId != null

  return (
    <Card className={cn('transition-opacity', !isPending && 'opacity-60')}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
            <CardTitle className="text-sm font-medium">
              {suggestion.label}
            </CardTitle>
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            <Badge variant="outline" className="text-xs">
              {suggestion.action}
            </Badge>
            {suggestion.confidence && (
              <Badge
                variant="outline"
                className={cn(
                  'text-xs',
                  confidenceColor(suggestion.confidence),
                )}
              >
                {suggestion.confidence}
              </Badge>
            )}
            {!isPending && (
              <Badge
                variant={statusVariant(suggestion.status)}
                className="text-xs"
              >
                {suggestion.status}
              </Badge>
            )}
          </div>
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
              onClick={() => onAccept?.(suggestion.id)}
              disabled={isLoading}
            >
              <Check className="mr-1 h-3 w-3" />
              Accept
            </Button>
          )}
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onDismiss?.(suggestion.id)}
            disabled={isLoading}
          >
            <EyeOff className="mr-1 h-3 w-3" />
            Dismiss
          </Button>
        </CardFooter>
      )}
    </Card>
  )
}
