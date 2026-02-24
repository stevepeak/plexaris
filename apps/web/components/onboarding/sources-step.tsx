'use i18n'
'use client'

import { Building2, Loader2 } from 'lucide-react'

import { DocumentUpload } from '@/components/document-upload'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

import { type OrgType } from './types'

export function SourcesStep({
  orgType,
  urls,
  onUrlsChange,
  files,
  onFilesChange,
  onBack,
  onSubmit,
  isLoading,
  error,
}: {
  orgType: OrgType
  urls: string
  onUrlsChange: (urls: string) => void
  files: File[]
  onFilesChange: (files: File[]) => void
  onBack: () => void
  onSubmit: () => void
  isLoading: boolean
  error: string | null
}) {
  return (
    <div className="grid w-full max-w-lg gap-6">
      <p className="text-sm text-muted-foreground">
        {orgType === 'supplier'
          ? "If you have a website or documents, we'll use them to find your business information and products. You can always add these later."
          : "If you have a website or documents, we'll use them to find your business information. You can always add these later."}
      </p>

      <div className="grid gap-2">
        <Label htmlFor="urls">
          Website URLs <span className="text-muted-foreground">(optional)</span>
        </Label>
        <Textarea
          id="urls"
          placeholder={
            'https://example.com\nhttps://example.com/products\nhttps://example.com/menu.pdf'
          }
          value={urls}
          onChange={(e) => onUrlsChange(e.target.value)}
          rows={4}
        />
        <p className="text-xs text-muted-foreground">
          One URL per line — website, product catalogs, menus, etc.
        </p>
      </div>

      <div className="grid gap-2">
        <Label>
          Upload documents{' '}
          <span className="text-muted-foreground">(optional)</span>
        </Label>
        <DocumentUpload
          files={files}
          onFilesChange={onFilesChange}
          isUploading={isLoading}
          error={error}
        />
      </div>

      <Button
        type="button"
        onClick={onSubmit}
        disabled={isLoading}
        className="w-full"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Creating...
          </>
        ) : (
          <>
            <Building2 className="h-4 w-4" />
            Create organization
          </>
        )}
      </Button>
      <Button
        type="button"
        variant="link"
        onClick={onBack}
        disabled={isLoading}
        className="w-full"
      >
        Back
      </Button>
    </div>
  )
}
