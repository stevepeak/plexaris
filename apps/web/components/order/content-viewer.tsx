'use client'

import { MessageSquare, Search } from 'lucide-react'

import { Button } from '@/components/ui/button'
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
      <div className="flex h-full items-center justify-center">
        <div className="flex items-center gap-16">
          <div className="flex flex-col items-center gap-2">
            <Button variant="outline" className="gap-2" onClick={onFocusSearch}>
              <Search className="h-4 w-4" />
              Search products or recipes
            </Button>
            <p className="text-xs text-muted-foreground">
              Browse the catalog on the left
            </p>
          </div>

          <div className="flex flex-col items-center gap-2">
            <Button variant="outline" className="gap-2" onClick={onOpenChat}>
              <MessageSquare className="h-4 w-4" />
              Start chat with agent
            </Button>
            <p className="text-xs text-muted-foreground">
              Let an assistant pick items for you
            </p>
          </div>
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
