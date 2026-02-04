'use client'

import { MessageSquare, Search } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { type CartStateReturn } from '@/hooks/use-cart-state'

import { type ActivityEntry, ActivityLog } from './activity-log'
import { CartTableView } from './cart-table-view'
import { ProductDetail } from './product-detail'
import { SupplierDetail } from './supplier-detail'
import { TabBar } from './tab-bar'
import { type TabItem, tabKey } from './types'

function SearchArrow() {
  return (
    <svg
      width="120"
      height="80"
      viewBox="0 0 120 80"
      fill="none"
      className="text-muted-foreground/40"
    >
      <path
        d="M100 70 C 80 65, 40 60, 15 20"
        stroke="currentColor"
        strokeWidth="2"
        strokeDasharray="6 4"
        strokeLinecap="round"
      />
      <path
        d="M20 10 L12 22 L24 24"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function ChatArrow() {
  return (
    <svg
      width="120"
      height="80"
      viewBox="0 0 120 80"
      fill="none"
      className="text-muted-foreground/40"
    >
      <path
        d="M20 70 C 40 65, 80 60, 105 20"
        stroke="currentColor"
        strokeWidth="2"
        strokeDasharray="6 4"
        strokeLinecap="round"
      />
      <path
        d="M100 10 L108 22 L96 24"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

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
}: ContentViewerProps) {
  const activeTab = tabs.find((t) => tabKey(t) === activeTabKey)

  if (tabs.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="flex items-center gap-16">
          <div className="flex flex-col items-center gap-2">
            <SearchArrow />
            <Button variant="outline" className="gap-2" onClick={onFocusSearch}>
              <Search className="h-4 w-4" />
              Search products or recipes
            </Button>
            <p className="text-xs text-muted-foreground">
              Browse the catalog on the left
            </p>
          </div>

          <div className="flex flex-col items-center gap-2">
            <ChatArrow />
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
      </div>
    </div>
  )
}
