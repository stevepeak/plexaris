'use client'

import { ArrowRight } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

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
      <Input
        id="org-name"
        type="text"
        placeholder="What is your business name?"
        value={name}
        onChange={(e) => onNameChange(e.target.value)}
        className="h-12 w-[400px] text-lg"
        required
      />
      <Button type="submit" className="w-full">
        Continue
        <ArrowRight className="h-4 w-4" />
      </Button>
      <Button type="button" variant="link" onClick={onBack} className="w-full">
        Back
      </Button>
    </form>
  )
}
