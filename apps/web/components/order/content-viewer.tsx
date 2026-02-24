'use i18n'
'use client'

import { MessageSquare, Search } from 'lucide-react'

import { Card, CardDescription, CardTitle } from '@/components/ui/card'
import { type CartStateReturn } from '@/hooks/use-cart-state'

import { type ActivityEntry, ActivityLog } from './activity-log'
import { AdvancedTab } from './advanced-tab'
import { CartTableView } from './cart-table-view'
import { ProductDetail } from './product-detail'
import { SupplierDetail } from './supplier-detail'
import { TabBar } from './tab-bar'
import { type TabItem, tabKey } from './types'

interface ContentViewerProps {
  tabs: TabItem[]
  activeTabKey: string | null
  onSelectTab: (key: string) => void
  onCloseTab: (key: string) => void
  onOpenSupplier: (supplierId: string, supplierName: string) => void
  onOpenProduct: (productId: string, productName: string) => void
  organizationId?: string | null
  onFavoriteToggled?: () => void
  onAddToCart?: (item: {
    id: string
    name: string
    price: number
    unit: string
    supplierId: string
    supplierName: string
    category: string | null
  }) => void
  cart?: CartStateReturn
  activityEntries?: ActivityEntry[]
  onFocusSearch?: () => void
  onOpenChat?: () => void
  orderId?: string
  onOrderArchived?: () => void
}

export function ContentViewer({
  tabs,
  activeTabKey,
  onSelectTab,
  onCloseTab,
  onOpenSupplier,
  onOpenProduct,
  organizationId,
  onFavoriteToggled,
  onAddToCart,
  cart,
  activityEntries,
  onFocusSearch,
  onOpenChat,
  orderId,
  onOrderArchived,
}: ContentViewerProps) {
  const activeTab = tabs.find((t) => tabKey(t) === activeTabKey)

  if (tabs.length === 0) {
    return (
      <div className="relative flex h-full items-center justify-center overflow-hidden">
        {/* Background pattern with edge fade */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            maskImage:
              'radial-gradient(ellipse at center, black 40%, transparent 80%)',
            WebkitMaskImage:
              'radial-gradient(ellipse at center, black 40%, transparent 80%)',
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-pink-500/15 via-transparent to-amber-500/15" />
          <div
            className="absolute inset-0 opacity-[0.08]"
            style={{
              backgroundImage:
                'linear-gradient(rgba(128,128,128,1) 1px, transparent 1px), linear-gradient(90deg, rgba(128,128,128,1) 1px, transparent 1px)',
              backgroundSize: '48px 48px',
            }}
          />
          <div className="absolute left-1/4 top-1/4 h-64 w-64 animate-pulse rounded-full bg-pink-500/20 blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 h-64 w-64 animate-pulse rounded-full bg-amber-500/20 blur-3xl [animation-delay:1s]" />
        </div>

        {/* Action cards */}
        <div className="relative z-10 flex gap-6">
          <Card
            className="group flex w-56 cursor-pointer flex-col items-center gap-3 border-border/50 bg-card/80 p-6 shadow-lg backdrop-blur-sm transition-all hover:shadow-xl hover:-translate-y-0.5"
            onClick={onFocusSearch}
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-pink-500/10">
              <Search className="h-6 w-6 text-pink-400" />
            </div>
            <CardTitle className="text-base">Search catalog</CardTitle>
            <CardDescription className="text-center text-sm">
              Browse products or recipes from the catalog
            </CardDescription>
          </Card>

          <Card
            className="group flex w-56 cursor-pointer flex-col items-center gap-3 border-border/50 bg-card/80 p-6 shadow-lg backdrop-blur-sm transition-all hover:shadow-xl hover:-translate-y-0.5"
            onClick={onOpenChat}
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10">
              <MessageSquare className="h-6 w-6 text-amber-400" />
            </div>
            <CardTitle className="text-base">Chat with agent</CardTitle>
            <CardDescription className="text-center text-sm">
              Let an assistant pick items for you
            </CardDescription>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col">
      <TabBar
        tabs={tabs}
        activeTabKey={activeTabKey}
        onSelect={onSelectTab}
        onClose={onCloseTab}
      />
      <div className="flex-1 overflow-hidden">
        {activeTab?.type === 'product' && (
          <ProductDetail
            key={activeTab.id}
            productId={activeTab.id}
            onOpenSupplier={onOpenSupplier}
            onAddToCart={onAddToCart}
            organizationId={organizationId}
            onFavoriteToggled={onFavoriteToggled}
          />
        )}
        {activeTab?.type === 'supplier' && (
          <SupplierDetail
            key={activeTab.id}
            supplierId={activeTab.id}
            onOpenProduct={onOpenProduct}
            organizationId={organizationId}
            onFavoriteToggled={onFavoriteToggled}
          />
        )}
        {activeTab?.type === 'cart' && cart && (
          <CartTableView
            key="cart"
            cart={cart}
            onOpenProduct={onOpenProduct}
            onOpenSupplier={onOpenSupplier}
          />
        )}
        {activeTab?.type === 'activity' && (
          <ActivityLog key="activity" entries={activityEntries ?? []} />
        )}
        {activeTab?.type === 'advanced' && orderId && (
          <AdvancedTab
            key="advanced"
            orderId={orderId}
            onOrderArchived={onOrderArchived}
          />
        )}
      </div>
    </div>
  )
}
