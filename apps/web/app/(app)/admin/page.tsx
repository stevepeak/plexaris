'use i18n'
'use client'

import { Search } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

import { AppHeader } from '@/components/app-header'
import { useActiveOrg } from '@/components/org-switcher'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { trpc } from '@/lib/trpc'

import { AdminOrgsTable } from './admin-orgs-table'

export default function AdminPage() {
  const router = useRouter()
  const {
    organizations,
    activeOrg,
    switchOrg,
    isPending: orgsPending,
    superAdmin,
  } = useActiveOrg()

  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [type, setType] = useState<'supplier' | 'horeca' | 'all'>('all')
  const [page, setPage] = useState(1)

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
      setPage(1)
    }, 300)
    return () => clearTimeout(timer)
  }, [search])

  // Redirect non-super-admins
  useEffect(() => {
    if (!orgsPending && !superAdmin) {
      router.replace('/dashboard')
    }
  }, [orgsPending, superAdmin, router])

  const { data, isLoading } = trpc.admin.listOrganizations.useQuery(
    {
      search: debouncedSearch || undefined,
      type: type === 'all' ? undefined : type,
      page,
      limit: 20,
    },
    { enabled: superAdmin },
  )

  if (!superAdmin && !orgsPending) return null

  return (
    <div className="min-h-screen bg-background">
      <AppHeader
        organizations={organizations}
        activeOrg={activeOrg}
        onSwitchOrg={switchOrg}
        orgsPending={orgsPending}
        superAdmin={superAdmin}
      />

      <main className="mx-auto max-w-5xl px-4 py-8">
        <h1 className="text-2xl font-semibold">Admin Panel</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Browse and manage all organizations in the system.
        </p>

        <div className="mt-6 flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search organizations..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select
            value={type}
            onValueChange={(v) => {
              setType(v as 'supplier' | 'horeca' | 'all')
              setPage(1)
            }}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              <SelectItem value="supplier">Supplier</SelectItem>
              <SelectItem value="horeca">Horeca</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="mt-4">
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <>
              <AdminOrgsTable orgs={data?.items ?? []} />
              {data && data.totalPages > 1 && (
                <div className="mt-4 flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Page {data.page} of {data.totalPages} ({data.total}{' '}
                    organizations)
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page <= 1}
                      onClick={() => setPage((p) => p - 1)}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page >= data.totalPages}
                      onClick={() => setPage((p) => p + 1)}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  )
}
