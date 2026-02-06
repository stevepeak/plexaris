'use client'

import { Globe } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

export function UrlStep({
  urls,
  onUrlsChange,
  onBack,
  onNext,
}: {
  urls: string
  onUrlsChange: (urls: string) => void
  onBack: () => void
  onNext: () => void
}) {
  return (
    <div className="grid w-full max-w-md gap-4">
      <div className="grid gap-2">
        <Label htmlFor="urls">Website URLs</Label>
        <Textarea
          id="urls"
          placeholder={
            'https://example.com\nhttps://example.com/products\nhttps://example.com/menu.pdf'
          }
          value={urls}
          onChange={(e) => onUrlsChange(e.target.value)}
          rows={5}
        />
        <p className="text-sm text-muted-foreground">
          Provide URLs to your website, product catalogs, or any pages we can
          scrape for product and company details. One URL per line.
        </p>
      </div>
      <div className="flex gap-3">
        <Button type="button" variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button type="button" onClick={onNext} className="flex-1">
          <Globe className="h-4 w-4" />
          {urls.trim() ? 'Continue' : 'Skip'}
        </Button>
      </div>
    </div>
  )
}
