import { useCallback, useMemo, useState } from 'react'

import { arrayMove } from '@dnd-kit/sortable'
import type { DragEndEvent, DragOverEvent, DragStartEvent } from '@dnd-kit/core'

import type { CartItemData } from '@/components/order/cart-item'
import type { CartLayoutMode } from '@/components/order/cart-layout-menu'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface CartFolder {
  id: string
  name: string
  collapsed: boolean
}

export interface CartState {
  items: Record<string, CartItemData>
  folders: Record<string, CartFolder>
  rootOrder: string[] // interleaved folder ids + loose item ids
  folderContents: Record<string, string[]> // folder id -> ordered item ids
}

export interface CartGroup {
  key: string
  label: string
  items: CartItemData[]
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

let folderId = 0

function nextFolderId(): string {
  folderId += 1
  return `folder-${folderId}`
}

function buildInitialState(items: CartItemData[]): CartState {
  const itemMap: Record<string, CartItemData> = {}
  const rootOrder: string[] = []
  for (const item of items) {
    itemMap[item.id] = item
    rootOrder.push(item.id)
  }
  return { items: itemMap, folders: {}, rootOrder, folderContents: {} }
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useCartState(initialItems?: CartItemData[]) {
  const [state, setState] = useState<CartState>(() =>
    buildInitialState(initialItems ?? []),
  )
  const [layoutMode, setLayoutMode] = useState<CartLayoutMode>('flat')
  const [activeId, setActiveId] = useState<string | null>(null)
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(
    () => new Set(),
  )

  // -----------------------------------------------------------------------
  // Item actions
  // -----------------------------------------------------------------------

  const updateQuantity = useCallback((itemId: string, delta: number) => {
    setState((prev) => {
      const item = prev.items[itemId]
      if (!item) return prev
      const next = item.quantity + delta
      if (next <= 0) {
        // Remove item entirely
        const { [itemId]: _, ...remaining } = prev.items
        const newState: CartState = {
          ...prev,
          items: remaining,
          rootOrder: prev.rootOrder.filter((id) => id !== itemId),
          folderContents: Object.fromEntries(
            Object.entries(prev.folderContents).map(([fId, ids]) => [
              fId,
              ids.filter((id) => id !== itemId),
            ]),
          ),
        }
        return newState
      }
      return {
        ...prev,
        items: { ...prev.items, [itemId]: { ...item, quantity: next } },
      }
    })
  }, [])

  const removeItem = useCallback((itemId: string) => {
    setState((prev) => {
      const { [itemId]: _, ...remaining } = prev.items
      return {
        ...prev,
        items: remaining,
        rootOrder: prev.rootOrder.filter((id) => id !== itemId),
        folderContents: Object.fromEntries(
          Object.entries(prev.folderContents).map(([fId, ids]) => [
            fId,
            ids.filter((id) => id !== itemId),
          ]),
        ),
      }
    })
  }, [])

  // -----------------------------------------------------------------------
  // Folder actions
  // -----------------------------------------------------------------------

  const addFolder = useCallback((): string => {
    const id = nextFolderId()
    setState((prev) => ({
      ...prev,
      folders: {
        ...prev.folders,
        [id]: { id, name: 'New Folder', collapsed: false },
      },
      rootOrder: [...prev.rootOrder, id],
      folderContents: { ...prev.folderContents, [id]: [] },
    }))
    return id
  }, [])

  const renameFolder = useCallback((fId: string, name: string) => {
    setState((prev) => {
      const folder = prev.folders[fId]
      if (!folder) return prev
      return {
        ...prev,
        folders: { ...prev.folders, [fId]: { ...folder, name } },
      }
    })
  }, [])

  const toggleFolderCollapse = useCallback((fId: string) => {
    setState((prev) => {
      const folder = prev.folders[fId]
      if (!folder) return prev
      return {
        ...prev,
        folders: {
          ...prev.folders,
          [fId]: { ...folder, collapsed: !folder.collapsed },
        },
      }
    })
  }, [])

  const removeFolder = useCallback((fId: string) => {
    setState((prev) => {
      const contents = prev.folderContents[fId] ?? []
      const folderIndex = prev.rootOrder.indexOf(fId)
      const { [fId]: _, ...remainingFolders } = prev.folders
      const { [fId]: __, ...remainingContents } = prev.folderContents

      // Splice folder items into rootOrder at the folder's position
      const newRootOrder = [...prev.rootOrder]
      newRootOrder.splice(folderIndex, 1, ...contents)

      return {
        ...prev,
        folders: remainingFolders,
        rootOrder: newRootOrder,
        folderContents: remainingContents,
      }
    })
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
  // DnD handlers (folders mode only)
  // -----------------------------------------------------------------------

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(String(event.active.id))
  }, [])

  const handleDragOver = useCallback((event: DragOverEvent) => {
    const { active, over } = event
    if (!over) return

    const activeData = active.data.current as
      | { type: 'item' | 'folder'; containerId?: string }
      | undefined
    const overData = over.data.current as
      | { type: 'item' | 'folder'; containerId?: string }
      | undefined

    // Only items can move between containers — folders stay at root
    if (!activeData || activeData.type !== 'item') return

    const activeId = String(active.id)
    const overId = String(over.id)

    // Determine target container
    let targetContainerId: string | undefined
    if (overData?.type === 'folder') {
      // Dropping onto a folder → target is that folder
      targetContainerId = overId
    } else if (overData?.type === 'item') {
      // Dropping onto another item → target is that item's container
      targetContainerId = overData.containerId
    }

    // Determine source container
    const sourceContainerId = activeData.containerId

    // Same container → no cross-container move needed (reorder handled in onDragEnd)
    if (sourceContainerId === targetContainerId) return

    setState((prev) => {
      const draft = { ...prev }
      // Remove from source
      if (!sourceContainerId) {
        // Source is root
        draft.rootOrder = draft.rootOrder.filter((id) => id !== activeId)
      } else {
        draft.folderContents = {
          ...draft.folderContents,
          [sourceContainerId]: (
            draft.folderContents[sourceContainerId] ?? []
          ).filter((id) => id !== activeId),
        }
      }

      // Add to target
      if (!targetContainerId) {
        // Target is root
        const overIndex = draft.rootOrder.indexOf(overId)
        const insertIndex = overIndex >= 0 ? overIndex : draft.rootOrder.length
        draft.rootOrder = [...draft.rootOrder]
        draft.rootOrder.splice(insertIndex, 0, activeId)
      } else {
        // Target is a folder
        const folderItems = [...(draft.folderContents[targetContainerId] ?? [])]
        if (overData?.type === 'item') {
          const overIndex = folderItems.indexOf(overId)
          const insertIndex = overIndex >= 0 ? overIndex : folderItems.length
          folderItems.splice(insertIndex, 0, activeId)
        } else {
          // Dropped onto the folder header itself → append
          folderItems.push(activeId)
        }
        draft.folderContents = {
          ...draft.folderContents,
          [targetContainerId]: folderItems,
        }
      }

      return draft
    })
  }, [])

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)

    if (!over || active.id === over.id) return

    const activeData = active.data.current as
      | { type: 'item' | 'folder'; containerId?: string }
      | undefined
    const overData = over.data.current as
      | { type: 'item' | 'folder'; containerId?: string }
      | undefined

    if (!activeData) return

    const activeId = String(active.id)
    const overId = String(over.id)

    setState((prev) => {
      if (activeData.type === 'folder') {
        // Reorder folders in rootOrder
        const oldIndex = prev.rootOrder.indexOf(activeId)
        const newIndex = prev.rootOrder.indexOf(overId)
        if (oldIndex === -1 || newIndex === -1) return prev
        return {
          ...prev,
          rootOrder: arrayMove(prev.rootOrder, oldIndex, newIndex),
        }
      }

      // Item reorder within same container
      const containerId = activeData.containerId
      const overContainerId = overData?.containerId

      // Only handle same-container reorder — cross-container is in onDragOver
      if (containerId !== overContainerId) return prev

      if (!containerId) {
        // Root level
        const oldIndex = prev.rootOrder.indexOf(activeId)
        const newIndex = prev.rootOrder.indexOf(overId)
        if (oldIndex === -1 || newIndex === -1) return prev
        return {
          ...prev,
          rootOrder: arrayMove(prev.rootOrder, oldIndex, newIndex),
        }
      }

      // Inside a folder
      const folderItems = prev.folderContents[containerId] ?? []
      const oldIndex = folderItems.indexOf(activeId)
      const newIndex = folderItems.indexOf(overId)
      if (oldIndex === -1 || newIndex === -1) return prev
      return {
        ...prev,
        folderContents: {
          ...prev.folderContents,
          [containerId]: arrayMove(folderItems, oldIndex, newIndex),
        },
      }
    })
  }, [])

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

  const folderSubtotal = useCallback(
    (fId: string): number => {
      const ids = state.folderContents[fId] ?? []
      return ids.reduce((sum, id) => {
        const item = state.items[id]
        return item ? sum + item.price * item.quantity : sum
      }, 0)
    },
    [state.folderContents, state.items],
  )

  const folderItemCount = useCallback(
    (fId: string): number => {
      const ids = state.folderContents[fId] ?? []
      return ids.reduce((sum, id) => {
        const item = state.items[id]
        return item ? sum + item.quantity : sum
      }, 0)
    },
    [state.folderContents, state.items],
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
    activeId,

    // Auto-grouping
    groups,
    collapsedGroups,
    toggleGroupCollapse,

    // Item actions
    updateQuantity,
    removeItem,

    // Folder actions
    addFolder,
    renameFolder,
    toggleFolderCollapse,
    removeFolder,

    // DnD handlers
    handleDragStart,
    handleDragOver,
    handleDragEnd,

    // Computed
    allItems,
    itemCount,
    subtotal,
    folderSubtotal,
    folderItemCount,
    groupSubtotal,
    groupItemCount,
  }
}
