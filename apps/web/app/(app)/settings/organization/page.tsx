'use client'

import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

import { OrgSettings } from '@/components/org-settings-form'
import { useActiveOrg } from '@/components/org-switcher'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

export default function OrgSettingsPage() {
  const { activeOrg, isPending } = useActiveOrg()

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="mx-auto flex h-14 max-w-4xl items-center gap-4 px-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <span className="text-lg font-semibold">Organization settings</span>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8">
        {isPending ? (
          <div className="space-y-6">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        ) : activeOrg ? (
          <OrgSettings organizationId={activeOrg.id} />
        ) : (
          <p className="text-sm text-muted-foreground">
            No organization selected.
          </p>
        )}
      </main>
    </div>
  )
}
