'use client'

import { MousePointerClick } from 'lucide-react'

import { type CartStateReturn } from '@/hooks/use-cart-state'

import { type ActivityEntry, ActivityLog } from './activity-log'
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
}: ContentViewerProps) {
  const activeTab = tabs.find((t) => tabKey(t) === activeTabKey)

  if (tabs.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="flex flex-col items-center gap-2 text-muted-foreground">
          <MousePointerClick className="h-8 w-8" />
          <p className="text-sm">Select a product to view details</p>
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
      </div>
    </div>
  )
}
