'use client'

import { Building2, Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function OrgNameStep({
  orgType,
  name,
  onNameChange,
  onBack,
  onSubmit,
  isLoading,
  error,
}: {
  orgType: 'supplier' | 'horeca'
  name: string
  onNameChange: (name: string) => void
  onBack: () => void
  onSubmit: () => void
  isLoading: boolean
  error: string | null
}) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        onSubmit()
      }}
      className="grid gap-4"
    >
      <div className="grid gap-2">
        <Label htmlFor="org-name">Business name</Label>
        <Input
          id="org-name"
          type="text"
          placeholder={
            orgType === 'supplier'
              ? 'e.g. Fresh Foods BV'
              : 'e.g. Restaurant De Kas'
          }
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          required
        />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          disabled={isLoading}
        >
          Back
        </Button>
        <Button type="submit" disabled={isLoading} className="flex-1">
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
      </div>
    </form>
  )
}
