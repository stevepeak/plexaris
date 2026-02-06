'use client'

import { ArrowRight } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function OrgNameStep({
  orgType,
  name,
  onNameChange,
  onBack,
  onSubmit,
}: {
  orgType: 'supplier' | 'horeca'
  name: string
  onNameChange: (name: string) => void
  onBack: () => void
  onSubmit: () => void
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
      <div className="flex gap-3">
        <Button type="button" variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button type="submit" className="flex-1">
          <ArrowRight className="h-4 w-4" />
          Continue
        </Button>
      </div>
    </form>
  )
}
