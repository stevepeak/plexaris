'use client'

import { useCallback, useEffect, useMemo, useRef } from 'react'

import { type CartItemData } from '@/components/order/cart-item'
import { trpc } from '@/lib/trpc'

import { type CartStateReturn, useCartState } from './use-cart-state'

function mapServerItems(
  items: {
    id: string
    productId: string
    supplierId: string
    quantity: number
    unitPrice: string | null
    unit: string | null
    addedByName: string
    productName: string
    productCategory: string | null
    supplierName: string
    createdAt: Date | string
  }[],
): CartItemData[] {
  return items.map((item) => ({
    id: item.productId,
    name: item.productName,
    price: Number(item.unitPrice ?? 0),
    unit: item.unit ?? '',
    quantity: item.quantity,
    supplier: item.supplierName,
    supplierId: item.supplierId,
    category: item.productCategory ?? undefined,
    addedBy: {
      name: item.addedByName,
      addedAt: new Date(item.createdAt),
    },
  }))
}

export interface OrderItemMapping {
  orderItemId: string
  productId: string
}

export function useOrderCart(orderId: string): CartStateReturn & {
  isLoading: boolean
  addItemToOrder: (item: {
    id: string
    name: string
    price: number
    unit: string
    supplierId: string
    supplierName: string
    category: string | null
  }) => void
} {
  const utils = trpc.useUtils()
  const invalidateEvents = useCallback(
    () => utils.order.getEvents.invalidate({ orderId }),
    [utils, orderId],
  )

  const orderQuery = trpc.order.get.useQuery({ orderId })
  const addItemMutation = trpc.order.addItem.useMutation()
  const removeItemMutation = trpc.order.removeItem.useMutation({
    onSuccess: invalidateEvents,
  })
  const updateQuantityMutation = trpc.order.updateQuantity.useMutation({
    onSuccess: invalidateEvents,
  })
  const updateSupplierMutation = trpc.order.updateSupplier.useMutation({
    onSuccess: invalidateEvents,
  })

  // Map server items to CartItemData once loaded
  const serverItems = orderQuery.data?.items
  const mappedItems = useMemo(
    () => (serverItems ? mapServerItems(serverItems) : []),
    [serverItems],
  )

  // Track order_item IDs so we can map productId -> orderItemId for mutations
  const itemMapRef = useRef<Map<string, string>>(new Map())

  useEffect(() => {
    if (!serverItems) {
      return
    }
    const map = new Map<string, string>()
    for (const item of serverItems) {
      map.set(item.productId, item.id)
    }
    itemMapRef.current = map
  }, [serverItems])

  const cart = useCartState(orderQuery.data ? mappedItems : undefined)
  const { resetItems } = cart

  // Re-initialize cart state when server data arrives after the initial
  // render (e.g. page refresh where the query is still loading on mount).
  const initializedRef = useRef(false)
  useEffect(() => {
    if (!orderQuery.data || initializedRef.current) {
      return
    }
    initializedRef.current = true
    if (mappedItems.length > 0) {
      resetItems(mappedItems)
    }
  }, [orderQuery.data, mappedItems, resetItems])

  const addItemToOrder = useCallback(
    (item: {
      id: string
      name: string
      price: number
      unit: string
      supplierId: string
      supplierName: string
      category: string | null
    }) => {
      // Optimistic local update
      cart.addItem({
        id: item.id,
        name: item.name,
        price: item.price,
        unit: item.unit,
        quantity: 1,
        supplier: item.supplierName,
        supplierId: item.supplierId,
        category: item.category ?? undefined,
      })

      // Persist to server
      addItemMutation.mutate(
        {
          orderId,
          productId: item.id,
          supplierId: item.supplierId,
          quantity: 1,
          unitPrice: String(item.price),
          unit: item.unit || undefined,
        },
        {
          onSuccess: (data) => {
            itemMapRef.current.set(item.id, data.orderItemId)
            void invalidateEvents()
          },
          onError: () => {
            // Rollback on failure
            cart.removeItem(item.id)
          },
        },
      )
    },
    [orderId, cart, addItemMutation, invalidateEvents],
  )

  // Wrap updateQuantity to persist
  const originalUpdateQuantity = cart.updateQuantity
  const wrappedUpdateQuantity = useCallback(
    (itemId: string, delta: number) => {
      const currentItem = cart.state.items[itemId]
      if (!currentItem) {
        return
      }

      const newQuantity = currentItem.quantity + delta
      // Optimistic update
      originalUpdateQuantity(itemId, delta)

      if (newQuantity <= 0) {
        // Item removed
        const orderItemId = itemMapRef.current.get(itemId)
        if (orderItemId) {
          removeItemMutation.mutate({ orderId, orderItemId })
          itemMapRef.current.delete(itemId)
        }
      } else {
        const orderItemId = itemMapRef.current.get(itemId)
        if (orderItemId) {
          updateQuantityMutation.mutate({
            orderId,
            orderItemId,
            quantity: newQuantity,
          })
        }
      }
    },
    [
      orderId,
      cart.state.items,
      originalUpdateQuantity,
      removeItemMutation,
      updateQuantityMutation,
    ],
  )

  // Wrap removeItem to persist
  const originalRemoveItem = cart.removeItem
  const wrappedRemoveItem = useCallback(
    (itemId: string) => {
      originalRemoveItem(itemId)
      const orderItemId = itemMapRef.current.get(itemId)
      if (orderItemId) {
        removeItemMutation.mutate({ orderId, orderItemId })
        itemMapRef.current.delete(itemId)
      }
    },
    [orderId, originalRemoveItem, removeItemMutation],
  )

  // Wrap updateSupplier to persist
  const originalUpdateSupplier = cart.updateSupplier
  const wrappedUpdateSupplier = useCallback(
    (itemId: string, supplierId: string, supplierName: string) => {
      originalUpdateSupplier(itemId, supplierId, supplierName)
      const orderItemId = itemMapRef.current.get(itemId)
      if (orderItemId) {
        updateSupplierMutation.mutate({ orderId, orderItemId, supplierId })
      }
    },
    [orderId, originalUpdateSupplier, updateSupplierMutation],
  )

  return {
    ...cart,
    updateQuantity: wrappedUpdateQuantity,
    removeItem: wrappedRemoveItem,
    updateSupplier: wrappedUpdateSupplier,
    addItemToOrder,
    isLoading: orderQuery.isLoading,
  }
}
