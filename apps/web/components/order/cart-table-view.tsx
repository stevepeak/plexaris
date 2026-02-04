'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { type CartStateReturn } from '@/hooks/use-cart-state'
import { cn } from '@/lib/utils'

import { type CartItemData } from './cart-item'

interface CartTableViewProps {
  cart: CartStateReturn
  onOpenProduct?: (productId: string, productName: string) => void
  onOpenSupplier?: (supplierId: string, supplierName: string) => void
}

// Editable column indices: 0 = supplier, 1 = quantity
const EDITABLE_COL_COUNT = 2

function getInitials(name: string) {
  return name
    .split(' ')
    .map((p) => p[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

function formatDate(date: Date) {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
}

export function CartTableView({
  cart,
  onOpenProduct,
  onOpenSupplier,
}: CartTableViewProps) {
  const items = cart.allItems
  const [focusedCell, setFocusedCell] = useState<{
    row: number
    col: number
  } | null>(null)
  const [editingCell, setEditingCell] = useState<{
    row: number
    col: number
  } | null>(null)
  const [editValue, setEditValue] = useState('')
  const tableRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const suppliers = useMemo(() => {
    const map = new Map<string, string>()
    for (const item of items) {
      map.set(item.supplierId, item.supplier)
    }
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }))
  }, [items])

  const startEditing = useCallback(
    (row: number, col: number) => {
      const item = items[row]
      if (!item) return
      if (col === 1) {
        setEditValue(String(item.quantity))
      }
      setEditingCell({ row, col })
    },
    [items],
  )

  const commitEdit = useCallback(
    (row: number, col: number) => {
      const item = items[row]
      if (!item) return
      if (col === 1) {
        const newQty = parseInt(editValue, 10)
        if (!isNaN(newQty) && newQty > 0 && newQty !== item.quantity) {
          cart.updateQuantity(item.id, newQty - item.quantity)
        }
      }
      setEditingCell(null)
      setEditValue('')
    },
    [items, editValue, cart],
  )

  const cancelEdit = useCallback(() => {
    setEditingCell(null)
    setEditValue('')
  }, [])

  const handleSupplierChange = useCallback(
    (row: number, supplierId: string) => {
      const item = items[row]
      if (!item) return
      const supplier = suppliers.find((s) => s.id === supplierId)
      if (supplier) {
        cart.updateSupplier(item.id, supplier.id, supplier.name)
      }
      setEditingCell(null)
    },
    [items, suppliers, cart],
  )

  // Focus input when editing qty
  useEffect(() => {
    if (editingCell?.col === 1 && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [editingCell])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      // Don't interfere when editing a select (col 0)
      if (editingCell?.col === 0) return

      if (editingCell) {
        if (e.key === 'Escape') {
          e.preventDefault()
          e.stopPropagation()
          cancelEdit()
          return
        }
        if (e.key === 'Enter') {
          e.preventDefault()
          e.stopPropagation()
          commitEdit(editingCell.row, editingCell.col)
          // Move down
          const nextRow = editingCell.row + 1
          if (nextRow < items.length) {
            setFocusedCell({ row: nextRow, col: editingCell.col })
          }
          return
        }
        if (e.key === 'Tab') {
          e.preventDefault()
          e.stopPropagation()
          commitEdit(editingCell.row, editingCell.col)
          // Move to next editable cell
          let nextCol = editingCell.col + 1
          let nextRow = editingCell.row
          if (nextCol >= EDITABLE_COL_COUNT) {
            nextCol = 0
            nextRow += 1
          }
          if (nextRow < items.length) {
            setFocusedCell({ row: nextRow, col: nextCol })
          }
          return
        }
        return
      }

      if (!focusedCell) return

      e.stopPropagation()

      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setFocusedCell((prev) =>
          prev && prev.row < items.length - 1
            ? { ...prev, row: prev.row + 1 }
            : prev,
        )
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setFocusedCell((prev) =>
          prev && prev.row > 0 ? { ...prev, row: prev.row - 1 } : prev,
        )
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        setFocusedCell((prev) =>
          prev && prev.col < EDITABLE_COL_COUNT - 1
            ? { ...prev, col: prev.col + 1 }
            : prev,
        )
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        setFocusedCell((prev) =>
          prev && prev.col > 0 ? { ...prev, col: prev.col - 1 } : prev,
        )
      } else if (e.key === 'Enter') {
        e.preventDefault()
        startEditing(focusedCell.row, focusedCell.col)
      } else if (e.key === 'Tab') {
        e.preventDefault()
        let nextCol = focusedCell.col + 1
        let nextRow = focusedCell.row
        if (nextCol >= EDITABLE_COL_COUNT) {
          nextCol = 0
          nextRow += 1
        }
        if (nextRow < items.length) {
          setFocusedCell({ row: nextRow, col: nextCol })
        }
      } else if (e.key === 'Escape') {
        e.preventDefault()
        setFocusedCell(null)
      }
    },
    [
      focusedCell,
      editingCell,
      items.length,
      startEditing,
      commitEdit,
      cancelEdit,
    ],
  )

  function isFocused(row: number, col: number) {
    return focusedCell?.row === row && focusedCell?.col === col
  }

  function isEditing(row: number, col: number) {
    return editingCell?.row === row && editingCell?.col === col
  }

  function cellClassName(row: number, col: number) {
    return cn(
      'cursor-pointer select-none',
      isFocused(row, col) && !isEditing(row, col) && 'ring-1 ring-border',
      isEditing(row, col) && 'ring-2 ring-ring',
    )
  }

  function handleCellClick(row: number, col: number) {
    setFocusedCell({ row, col })
    if (editingCell) {
      commitEdit(editingCell.row, editingCell.col)
    }
  }

  function handleCellDoubleClick(row: number, col: number) {
    setFocusedCell({ row, col })
    startEditing(row, col)
  }

  function renderSupplierCell(item: CartItemData, row: number) {
    if (isEditing(row, 0)) {
      return (
        <Select
          value={item.supplierId}
          onValueChange={(val) => handleSupplierChange(row, val)}
          onOpenChange={(open) => {
            if (!open) {
              setEditingCell(null)
            }
          }}
          defaultOpen
        >
          <SelectTrigger
            className="h-8 text-xs"
            onKeyDown={(e) => e.stopPropagation()}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {suppliers.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )
    }
    return (
      <button
        type="button"
        className="truncate text-left text-xs hover:underline"
        onClick={(e) => {
          e.stopPropagation()
          onOpenSupplier?.(item.supplierId, item.supplier)
        }}
      >
        {item.supplier}
      </button>
    )
  }

  function renderQtyCell(item: CartItemData, row: number) {
    if (isEditing(row, 1)) {
      return (
        <Input
          ref={inputRef}
          type="number"
          min={1}
          className="h-8 w-20 text-xs"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={(e) => e.stopPropagation()}
          onBlur={() => commitEdit(row, 1)}
        />
      )
    }
    return (
      <span className="text-xs">
        {item.quantity} {item.unit}
      </span>
    )
  }

  if (items.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-sm text-muted-foreground">
          Your cart is empty. Add items to see them here.
        </p>
      </div>
    )
  }

  return (
    <div
      ref={tableRef}
      className="flex h-full flex-col outline-none"
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      <ScrollArea className="flex-1">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[180px]">Name</TableHead>
              <TableHead className="min-w-[120px]">Supplier</TableHead>
              <TableHead className="min-w-[100px]">Added By</TableHead>
              <TableHead className="min-w-[80px]">Date</TableHead>
              <TableHead className="min-w-[100px]">Qty</TableHead>
              <TableHead className="min-w-[80px] text-right">Price</TableHead>
              <TableHead className="min-w-[80px] text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item, row) => (
              <TableRow key={item.id}>
                <TableCell>
                  <button
                    type="button"
                    className="truncate text-left text-xs font-medium hover:underline"
                    onClick={() => onOpenProduct?.(item.id, item.name)}
                  >
                    {item.name}
                  </button>
                </TableCell>
                <TableCell
                  className={cellClassName(row, 0)}
                  onClick={() => handleCellClick(row, 0)}
                  onDoubleClick={() => handleCellDoubleClick(row, 0)}
                >
                  {renderSupplierCell(item, row)}
                </TableCell>
                <TableCell>
                  {item.addedBy ? (
                    <div className="flex items-center gap-1.5">
                      <Avatar className="h-5 w-5">
                        {item.addedBy.avatarUrl && (
                          <AvatarImage
                            src={item.addedBy.avatarUrl}
                            alt={item.addedBy.name}
                          />
                        )}
                        <AvatarFallback className="text-[8px]">
                          {getInitials(item.addedBy.name)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="truncate text-xs">
                        {item.addedBy.name}
                      </span>
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell>
                  <span className="text-xs text-muted-foreground">
                    {item.addedBy ? formatDate(item.addedBy.addedAt) : '-'}
                  </span>
                </TableCell>
                <TableCell
                  className={cellClassName(row, 1)}
                  onClick={() => handleCellClick(row, 1)}
                  onDoubleClick={() => handleCellDoubleClick(row, 1)}
                >
                  {renderQtyCell(item, row)}
                </TableCell>
                <TableCell className="text-right">
                  <span className="text-xs">${item.price.toFixed(2)}</span>
                </TableCell>
                <TableCell className="text-right">
                  <span className="text-xs font-medium">
                    ${(item.quantity * item.price).toFixed(2)}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>
    </div>
  )
}
