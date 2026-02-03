'use client'

import Link from 'next/link'
import { useCallback, useEffect, useRef, useState } from 'react'

import {
  type BrowseProduct,
  type Category,
  CategorySidebar,
} from '@/components/order/category-sidebar'
import { OrderCart } from '@/components/order/order-cart'
import { OrderChat } from '@/components/order/order-chat'
import { OrgSwitcher, useActiveOrg } from '@/components/org-switcher'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { authClient } from '@/lib/auth-client'

function getInitials(name: string | undefined): string {
  if (!name) return '?'
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export default function NewOrderPage() {
  const { data: session, isPending } = authClient.useSession()
  const {
    organizations,
    activeOrg,
    switchOrg,
    isPending: orgsPending,
  } = useActiveOrg()
  const [activeCategory, setActiveCategory] = useState<Category | null>(null)
  const [search, setSearch] = useState('')
  const [products, setProducts] = useState<BrowseProduct[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null)

  const fetchProducts = useCallback(
    async (category: Category | null, searchText: string) => {
      if (!category && !searchText) return

      setIsLoading(true)
      try {
        const params = new URLSearchParams()
        if (category && category !== 'All products') {
          params.set('category', category)
        }
        if (searchText) {
          params.set('search', searchText)
        }

        const res = await fetch(`/api/products/browse?${params.toString()}`)
        if (res.ok) {
          const data = await res.json()
          setProducts(data.products)
        }
      } finally {
        setIsLoading(false)
      }
    },
    [],
  )

  useEffect(() => {
    if (!activeCategory && !search) {
      setProducts([])
      return
    }

    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    debounceRef.current = setTimeout(
      () => {
        void fetchProducts(activeCategory, search)
      },
      search ? 300 : 0,
    )

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [activeCategory, search, fetchProducts])

  function handleNavigate(category: Category | null) {
    setActiveCategory(category)
    if (!category) {
      setSearch('')
    }
  }

  return (
    <div className="flex h-screen flex-col">
      <header className="border-b">
        <div className="flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <span className="text-lg font-semibold">Plexaris</span>
            <Separator orientation="vertical" className="h-6" />
            <OrgSwitcher
              organizations={organizations}
              activeOrg={activeOrg}
              onSwitch={switchOrg}
              isPending={orgsPending}
            />
          </div>
          {isPending ? (
            <Skeleton className="h-8 w-8 rounded-full" />
          ) : (
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">
                {session?.user.name}
              </span>
              <Button variant="ghost" size="icon" asChild>
                <Link href="/settings/profile">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs">
                      {getInitials(session?.user.name)}
                    </AvatarFallback>
                  </Avatar>
                </Link>
              </Button>
            </div>
          )}
        </div>
      </header>

      <ResizablePanelGroup direction="horizontal" className="flex-1">
        <ResizablePanel defaultSize={20} minSize={15} maxSize={30}>
          <CategorySidebar
            activeCategory={activeCategory}
            onNavigate={handleNavigate}
            search={search}
            onSearchChange={setSearch}
            products={products}
            isLoading={isLoading}
          />
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={50} minSize={30}>
          <OrderChat />
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={30} minSize={20} maxSize={40}>
          <OrderCart />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  )
}
