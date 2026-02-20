'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { type ActivityEntry } from '@/components/order/activity-log'
import { type BrowseSection } from '@/components/order/browse-home'
import {
  type BrowseProduct,
  type BrowseSupplier,
  CategorySidebar,
} from '@/components/order/category-sidebar'
import { ContentViewer } from '@/components/order/content-viewer'
import { KeyboardShortcutsDialog } from '@/components/order/keyboard-shortcuts-dialog'
import { OrderCart, type OrderCartHandle } from '@/components/order/order-cart'
import { OrderChat } from '@/components/order/order-chat'
import {
  type PanelState,
  PanelToggleBar,
} from '@/components/order/panel-toggle-bar'
import {
  ACTIVITY_TAB,
  ADVANCED_TAB,
  CART_TAB,
  type TabItem,
  tabKey,
} from '@/components/order/types'
import { useOrderHotkeys } from '@/components/order/use-order-hotkeys'
import { OrgSwitcher, useActiveOrg } from '@/components/org-switcher'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { useOrderCart } from '@/hooks/use-order-cart'
import { authClient } from '@/lib/auth-client'
import { trpc } from '@/lib/trpc'

function getInitials(name: string | undefined): string {
  if (!name) return '?'
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export default function OrderPage() {
  const { orderId } = useParams<{ orderId: string }>()
  const { data: session, isPending } = authClient.useSession()
  const {
    organizations,
    activeOrg,
    switchOrg,
    isPending: orgsPending,
  } = useActiveOrg()
  const [activeSection, setActiveSection] = useState<BrowseSection | null>(null)
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [products, setProducts] = useState<BrowseProduct[]>([])
  const [suppliers, setSuppliers] = useState<BrowseSupplier[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null)

  const [tabs, setTabs] = useState<TabItem[]>([])
  const [activeTabKey, setActiveTabKey] = useState<string | null>(null)

  const [favoriteVersion, setFavoriteVersion] = useState(0)

  const [panels, setPanels] = useState<PanelState>({
    search: true,
    order: true,
    chat: false,
  })

  const [shortcutsOpen, setShortcutsOpen] = useState(false)

  const cart = useOrderCart(orderId)

  const eventsQuery = trpc.order.getEvents.useQuery({ orderId })

  const activityEntries: ActivityEntry[] = useMemo(() => {
    if (!eventsQuery.data) return []
    return eventsQuery.data.map((e) => {
      const payload = (e.payload ?? {}) as Record<string, unknown>
      let detail = ''
      switch (e.type) {
        case 'item_added':
          detail = e.itemName
            ? `${payload.quantity ?? 1}x ${e.itemName}`
            : `${payload.quantity ?? 1} item(s)`
          break
        case 'item_removed':
          detail = e.itemName ? `Removed ${e.itemName}` : 'Removed item'
          break
        case 'item_quantity_changed':
          detail = `${payload.previousQuantity} → ${payload.newQuantity}`
          break
        case 'item_supplier_changed':
          detail = e.supplierName
            ? `Changed to ${e.supplierName}`
            : 'Supplier changed'
          break
        case 'note_updated':
          detail = 'Note updated'
          break
        case 'order_archived':
          detail = 'Order archived'
          break
        case 'order_duplicated':
          detail = payload.newOrderId
            ? `Duplicated to ${(payload.newOrderId as string).slice(0, 8)}...`
            : 'Order duplicated'
          break
        default:
          break
      }
      return {
        id: e.id,
        action: e.type,
        itemName: e.itemName ?? '',
        detail,
        timestamp: new Date(e.createdAt),
        user: { name: e.actorName },
      }
    })
  }, [eventsQuery.data])

  const searchInputRef = useRef<HTMLInputElement>(null)
  const cartRef = useRef<OrderCartHandle>(null)

  const handleTogglePanel = useCallback((panel: keyof PanelState) => {
    setPanels((prev) => ({ ...prev, [panel]: !prev[panel] }))
  }, [])

  const handleNavigateHome = useCallback(() => {
    setActiveSection(null)
    setActiveCategory(null)
    setSearch('')
  }, [])

  const openTab = useCallback((tab: TabItem) => {
    const key = tabKey(tab)
    setTabs((prev) => {
      if (prev.some((t) => tabKey(t) === key)) return prev
      return [...prev, tab]
    })
    setActiveTabKey(key)
  }, [])

  const handleOpenCartTab = useCallback(() => {
    openTab(CART_TAB)
  }, [openTab])

  const handleOpenActivityTab = useCallback(() => {
    openTab(ACTIVITY_TAB)
  }, [openTab])

  const handleOpenAdvancedTab = useCallback(() => {
    openTab(ADVANCED_TAB)
  }, [openTab])

  const handleOrderArchived = useCallback(() => {
    // Navigation to /dashboard is handled inside AdvancedTab
  }, [])

  const closeTab = useCallback(
    (key: string) => {
      setTabs((prev) => {
        const idx = prev.findIndex((t) => tabKey(t) === key)
        const next = prev.filter((t) => tabKey(t) !== key)

        if (key === activeTabKey) {
          if (next.length === 0) {
            setActiveTabKey(null)
          } else {
            const newIdx = Math.min(idx, next.length - 1)
            setActiveTabKey(tabKey(next[newIdx]!))
          }
        }

        return next
      })
    },
    [activeTabKey],
  )

  const handleOpenShortcuts = useCallback(() => {
    setShortcutsOpen(true)
  }, [])

  useOrderHotkeys({
    panels,
    onTogglePanel: handleTogglePanel,
    tabs,
    activeTabKey,
    setActiveTabKey,
    closeTab,
    searchInputRef,
    cartRef,
    onNavigateHome: handleNavigateHome,
    onOpenShortcuts: handleOpenShortcuts,
    onOpenActivityTab: handleOpenActivityTab,
    onOpenCartTab: handleOpenCartTab,
    onOpenAdvancedTab: handleOpenAdvancedTab,
  })

  const handleFavoriteToggled = useCallback(() => {
    setFavoriteVersion((v) => v + 1)
  }, [])

  const fetchProducts = useCallback(
    async (category: string | null, searchText: string) => {
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
        if (activeOrg?.id) {
          params.set('favoritesOrgId', activeOrg.id)
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
    [activeOrg?.id],
  )

  const fetchFavorites = useCallback(async () => {
    if (!activeOrg?.id) return

    setIsLoading(true)
    try {
      const params = new URLSearchParams({ organizationId: activeOrg.id })
      const res = await fetch(`/api/favorites?${params.toString()}`)
      if (res.ok) {
        const data = await res.json()
        setProducts(data.favorites)
      }
    } finally {
      setIsLoading(false)
    }
  }, [activeOrg?.id])

  const fetchSuppliers = useCallback(async (searchText?: string) => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      if (searchText) {
        params.set('search', searchText)
      }
      const res = await fetch(`/api/suppliers/browse?${params.toString()}`)
      if (res.ok) {
        const data = await res.json()
        setSuppliers(data.suppliers)
      }
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (activeSection === 'favorites') {
      void fetchFavorites()
      return
    }

    if (activeSection === 'suppliers') {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }

      debounceRef.current = setTimeout(
        () => {
          void fetchSuppliers(search || undefined)
        },
        search ? 300 : 0,
      )

      return () => {
        if (debounceRef.current) {
          clearTimeout(debounceRef.current)
        }
      }
    }

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
  }, [
    activeCategory,
    activeSection,
    search,
    fetchProducts,
    fetchFavorites,
    fetchSuppliers,
    favoriteVersion,
  ])

  function handleSectionChange(section: BrowseSection | null) {
    setActiveSection(section)
    setActiveCategory(null)
    setSearch('')
    setSuppliers([])
  }

  function handleNavigate(category: string | null) {
    setActiveCategory(category)
    if (!category) {
      setSearch('')
    }
  }

  const handleAddToCart = useCallback(
    (item: {
      id: string
      name: string
      price: number
      unit: string
      supplierId: string
      supplierName: string
      category: string | null
    }) => {
      cart.addItemToOrder(item)
    },
    [cart],
  )

  function handleProductClick(product: BrowseProduct) {
    openTab({ type: 'product', id: product.id, label: product.name })
  }

  function handleSupplierClick(supplier: BrowseSupplier) {
    openTab({ type: 'supplier', id: supplier.id, label: supplier.name })
  }

  function handleOpenSupplier(supplierId: string, supplierName: string) {
    openTab({ type: 'supplier', id: supplierId, label: supplierName })
  }

  function handleOpenProduct(productId: string, productName: string) {
    openTab({ type: 'product', id: productId, label: productName })
  }

  if (cart.isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Skeleton className="h-8 w-48" />
          <p className="text-sm text-muted-foreground">Loading order...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen flex-col">
      <header className="border-b">
        <div className="flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-lg font-semibold">
              Plexaris
            </Link>
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
              <PanelToggleBar panels={panels} onToggle={handleTogglePanel} />
              <KeyboardShortcutsDialog
                open={shortcutsOpen}
                onOpenChange={setShortcutsOpen}
              />
              <Button variant="ghost" size="icon" asChild>
                <Link href="/settings/profile">
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={session?.user.image ?? undefined}
                      alt={session?.user.name ?? ''}
                    />
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

      <div className="flex min-h-0 flex-1">
        {panels.search && (
          <div className="w-[280px] shrink-0 border-r">
            <CategorySidebar
              searchInputRef={searchInputRef}
              activeSection={activeSection}
              onSectionChange={handleSectionChange}
              activeCategory={activeCategory}
              onNavigate={handleNavigate}
              search={search}
              onSearchChange={setSearch}
              products={products}
              suppliers={suppliers}
              isLoading={isLoading}
              onProductClick={handleProductClick}
              onSupplierClick={handleSupplierClick}
            />
          </div>
        )}

        <div className="min-w-0 flex-1">
          <ContentViewer
            tabs={tabs}
            activeTabKey={activeTabKey}
            onSelectTab={setActiveTabKey}
            onCloseTab={closeTab}
            onOpenSupplier={handleOpenSupplier}
            onOpenProduct={handleOpenProduct}
            organizationId={activeOrg?.id ?? null}
            onFavoriteToggled={handleFavoriteToggled}
            onAddToCart={handleAddToCart}
            cart={cart}
            activityEntries={activityEntries}
            onFocusSearch={() => {
              if (!panels.search) {
                setPanels((prev) => ({ ...prev, search: true }))
              }
              setTimeout(() => searchInputRef.current?.focus(), 0)
            }}
            onOpenChat={() => {
              setPanels((prev) => ({ ...prev, chat: true }))
            }}
            orderId={orderId}
            onOrderArchived={handleOrderArchived}
          />
        </div>

        {panels.order && (
          <div className="w-[320px] shrink-0 border-l">
            <OrderCart
              ref={cartRef}
              cart={cart}
              onOpenProduct={handleOpenProduct}
              onOpenSupplier={handleOpenSupplier}
              onOpenCartTab={handleOpenCartTab}
              onOpenActivityTab={handleOpenActivityTab}
              onOpenAdvancedTab={handleOpenAdvancedTab}
            />
          </div>
        )}

        {panels.chat && (
          <div className="w-[320px] shrink-0 border-l">
            <OrderChat />
          </div>
        )}
      </div>
    </div>
  )
}
