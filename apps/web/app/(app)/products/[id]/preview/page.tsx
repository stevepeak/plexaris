'use client'

import {
  ArrowLeft,
  MessageSquare,
  Package,
  Search,
  ShoppingCart,
} from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'

import { ProductDetail } from '@/components/order/product-detail'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'

function BlurredSearchSidebar() {
  return (
    <div className="pointer-events-none select-none blur-[2px]">
      <div className="border-b p-3">
        <div className="flex h-9 items-center gap-2 rounded-md border bg-muted/50 px-3">
          <Search className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            Search products...
          </span>
        </div>
      </div>
      <div className="flex flex-col gap-1 p-3">
        {['Bread', 'Dairy', 'Meat', 'Produce', 'Beverages'].map((cat) => (
          <div
            key={cat}
            className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground"
          >
            <Package className="h-4 w-4" />
            {cat}
          </div>
        ))}
      </div>
    </div>
  )
}

function BlurredCartSidebar() {
  return (
    <div className="pointer-events-none flex h-full select-none flex-col blur-[2px]">
      <div className="flex items-center gap-2 border-b px-4 py-3">
        <ShoppingCart className="h-5 w-5 text-muted-foreground" />
        <h2 className="font-semibold">Cart</h2>
      </div>

      <ScrollArea className="flex-1">
        <div className="flex flex-col">
          {[1, 2, 3].map((i) => (
            <div key={i} className="border-b px-4 py-3">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded bg-muted">
                  <Package className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <Skeleton className="mb-1 h-4 w-24" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      <div className="border-t px-4 py-3">
        <div className="mb-3 flex items-center justify-between text-sm">
          <span className="text-muted-foreground">3 items</span>
          <span className="font-semibold">$45.00</span>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" disabled>
            Edit Cart
          </Button>
          <Button className="flex-1" disabled>
            Checkout
          </Button>
        </div>
      </div>
    </div>
  )
}

function BlurredTabBar() {
  return (
    <div className="pointer-events-none select-none border-b blur-[2px]">
      <div className="flex">
        <div className="flex items-center gap-1.5 border-r bg-background px-3 py-2 text-sm">
          <Package className="h-3.5 w-3.5" />
          <span className="max-w-[120px] truncate">Product</span>
        </div>
        <div className="flex items-center gap-1.5 border-r bg-muted/50 px-3 py-2 text-sm text-muted-foreground">
          <MessageSquare className="h-3.5 w-3.5" />
          <span className="max-w-[120px] truncate">Chat</span>
        </div>
      </div>
    </div>
  )
}

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = () => {}

export default function ProductPreviewPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()

  return (
    <div className="flex h-screen flex-col">
      <header className="border-b">
        <div className="flex h-14 items-center px-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => router.back()}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <Separator orientation="vertical" className="h-6" />
            <span className="font-mono text-sm text-muted-foreground">
              HoReCa Preview
            </span>
          </div>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        {/* Blurred search sidebar */}
        <div className="w-[280px] shrink-0 border-r">
          <BlurredSearchSidebar />
        </div>

        {/* Center content — product detail is clear and usable */}
        <div className="min-w-0 flex-1">
          <div className="flex h-full flex-col">
            <BlurredTabBar />
            <div className="flex-1 overflow-hidden">
              <ProductDetail productId={id} onOpenSupplier={noop} />
            </div>
          </div>
        </div>

        {/* Blurred cart sidebar */}
        <div className="w-[320px] shrink-0 border-l">
          <BlurredCartSidebar />
        </div>
      </div>
    </div>
  )
}
