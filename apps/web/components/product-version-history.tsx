'use i18n'
'use client'

import { ArrowLeft, Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

export type ProductVersionEntry = {
  id: string
  version: number
  name: string
  description: string | null
  price: string | null
  unit: string | null
  category: string | null
  images: string[]
  note: string | null
  createdAt: string
  editedBy: { id: string; name: string }
}

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffSecs = Math.floor(diffMs / 1000)
  const diffMins = Math.floor(diffSecs / 60)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffSecs < 60) return 'just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 30) return `${diffDays}d ago`
  return date.toLocaleDateString()
}

type ProductVersionHistoryProps = {
  productId: string
  currentVersionId?: string | null
  onBack?: () => void
  versions?: ProductVersionEntry[]
}

export function ProductVersionHistory({
  productId,
  currentVersionId,
  onBack,
  versions: initialVersions,
}: ProductVersionHistoryProps) {
  const [versions, setVersions] = useState<ProductVersionEntry[]>(
    initialVersions ?? [],
  )
  const [isLoading, setIsLoading] = useState(!initialVersions)

  useEffect(() => {
    if (initialVersions) return

    setIsLoading(true)
    void fetch(`/api/products/${productId}/versions`)
      .then((res) => (res.ok ? res.json() : { versions: [] }))
      .then((data) => setVersions(data.versions ?? []))
      .finally(() => setIsLoading(false))
  }, [productId, initialVersions])

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          {onBack && (
            <Button variant="ghost" size="icon" onClick={onBack}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          <div>
            <CardTitle>Version history</CardTitle>
            <CardDescription>All changes made to this product</CardDescription>
          </div>
        </div>
      </CardHeader>
      <Separator />
      <CardContent className="pt-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : versions.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No version history available.
          </p>
        ) : (
          <div className="space-y-4">
            {versions.map((v) => (
              <div
                key={v.id}
                className="flex items-start gap-4 rounded-lg border p-4"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-medium">
                  {v.version}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">
                      {v.editedBy.name}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatRelativeTime(v.createdAt)}
                    </span>
                    {currentVersionId === v.id && (
                      <Badge variant="secondary" className="text-xs">
                        Current
                      </Badge>
                    )}
                  </div>
                  {v.note && (
                    <p className="mt-1 text-sm text-muted-foreground">
                      {v.note}
                    </p>
                  )}
                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    <span>{v.name}</span>
                    {v.price && <span>{v.price} EUR</span>}
                    {v.category && <span>{v.category}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
