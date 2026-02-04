import { useCallback, useMemo, useState } from 'react'

import { type CartItemData } from '@/components/order/cart-item'
import { type CartLayoutMode } from '@/components/order/cart-layout-menu'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface CartState {
  items: Record<string, CartItemData>
}

export interface CartGroup {
  key: string
  label: string
  items: CartItemData[]
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function buildInitialState(items: CartItemData[]): CartState {
  const itemMap: Record<string, CartItemData> = {}
  for (const item of items) {
    itemMap[item.id] = item
  }
  return { items: itemMap }
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useCartState(
  initialItems?: CartItemData[],
  initialLayoutMode?: CartLayoutMode,
) {
  const [state, setState] = useState<CartState>(() =>
    buildInitialState(initialItems ?? []),
  )
  const [layoutMode, setLayoutMode] = useState<CartLayoutMode>(
    initialLayoutMode ?? 'flat',
  )
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(
    () => new Set(),
  )

  // -----------------------------------------------------------------------
  // Item actions
  // -----------------------------------------------------------------------

  const addItem = useCallback((item: CartItemData) => {
    setState((prev) => {
      const existing = prev.items[item.id]
      if (existing) {
        return {
          ...prev,
          items: {
            ...prev.items,
            [item.id]: {
              ...existing,
              quantity: existing.quantity + item.quantity,
            },
          },
        }
      }
      return {
        ...prev,
        items: { ...prev.items, [item.id]: item },
      }
    })
  }, [])

  const updateQuantity = useCallback((itemId: string, delta: number) => {
    setState((prev) => {
      const item = prev.items[itemId]
      if (!item) return prev
      const next = item.quantity + delta
      if (next <= 0) {
        const { [itemId]: _, ...remaining } = prev.items
        return { ...prev, items: remaining }
      }
      return {
        ...prev,
        items: { ...prev.items, [itemId]: { ...item, quantity: next } },
      }
    })
  }, [])

  const updateSupplier = useCallback(
    (itemId: string, supplierId: string, supplierName: string) => {
      setState((prev) => {
        const item = prev.items[itemId]
        if (!item) return prev
        return {
          ...prev,
          items: {
            ...prev.items,
            [itemId]: { ...item, supplierId, supplier: supplierName },
          },
        }
      })
    },
    [],
  )

  const removeItem = useCallback((itemId: string) => {
    setState((prev) => {
      const { [itemId]: _, ...remaining } = prev.items
      return { ...prev, items: remaining }
    })
  }, [])

  const resetItems = useCallback((items: CartItemData[]) => {
    setState(buildInitialState(items))
  }, [])

  // -----------------------------------------------------------------------
  // Auto-grouping
  // -----------------------------------------------------------------------

  const toggleGroupCollapse = useCallback((groupKey: string) => {
    setCollapsedGroups((prev) => {
      const next = new Set(prev)
      if (next.has(groupKey)) {
        next.delete(groupKey)
      } else {
        next.add(groupKey)
      }
      return next
    })
  }, [])

  const groups = useMemo((): CartGroup[] => {
    if (
      layoutMode !== 'by-supplier' &&
      layoutMode !== 'by-category' &&
      layoutMode !== 'by-team-member'
    ) {
      return []
    }

    const fieldKey: keyof CartItemData =
      layoutMode === 'by-supplier'
        ? 'supplier'
        : layoutMode === 'by-category'
          ? 'category'
          : 'assignee'

    const groupMap = new Map<string, CartItemData[]>()
    const ungrouped: CartItemData[] = []

    for (const item of Object.values(state.items)) {
      const val = item[fieldKey]
      if (!val) {
        ungrouped.push(item)
      } else {
        const key = String(val)
        if (!groupMap.has(key)) groupMap.set(key, [])
        groupMap.get(key)!.push(item)
      }
    }

    const result: CartGroup[] = []
    for (const [key, items] of groupMap) {
      result.push({ key, label: key, items })
    }
    // Sort groups alphabetically
    result.sort((a, b) => a.label.localeCompare(b.label))

    if (ungrouped.length > 0) {
      result.push({ key: '__ungrouped', label: 'Ungrouped', items: ungrouped })
    }

    return result
  }, [layoutMode, state.items])

  // -----------------------------------------------------------------------
  // Computed values
  // -----------------------------------------------------------------------

  const allItems = useMemo(() => Object.values(state.items), [state.items])

  const itemCount = useMemo(
    () => allItems.reduce((sum, item) => sum + item.quantity, 0),
    [allItems],
  )

  const subtotal = useMemo(
    () => allItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [allItems],
  )

  const groupSubtotal = useCallback(
    (groupKey: string): number => {
      const group = groups.find((g) => g.key === groupKey)
      if (!group) return 0
      return group.items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0,
      )
    },
    [groups],
  )

  const groupItemCount = useCallback(
    (groupKey: string): number => {
      const group = groups.find((g) => g.key === groupKey)
      if (!group) return 0
      return group.items.reduce((sum, item) => sum + item.quantity, 0)
    },
    [groups],
  )

  // -----------------------------------------------------------------------
  // Return
  // -----------------------------------------------------------------------

  return {
    // State
    state,
    layoutMode,
    setLayoutMode,

    // Auto-grouping
    groups,
    collapsedGroups,
    toggleGroupCollapse,

    // Item actions
    addItem,
    updateQuantity,
    updateSupplier,
    removeItem,
    resetItems,

    // Computed
    allItems,
    itemCount,
    subtotal,
    groupSubtotal,
    groupItemCount,
  }
}

export type CartStateReturn = ReturnType<typeof useCartState>
