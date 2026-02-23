'use client'

import { ArrowDown, ArrowUp, Check, ListFilter, Search } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { RelativeTime } from '@/components/relative-time'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
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

type SortField =
  | 'name'
  | 'supplier'
  | 'addedBy'
  | 'date'
  | 'qty'
  | 'price'
  | 'total'
type SortDirection = 'asc' | 'desc'

interface CartFilters {
  suppliers: Set<string>
  categories: Set<string>
  teamMembers: Set<string>
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

  // Search, filter, and sort state
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState<CartFilters>({
    suppliers: new Set(),
    categories: new Set(),
    teamMembers: new Set(),
  })
  const [sortField, setSortField] = useState<SortField | null>(null)
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')

  const suppliers = useMemo(() => {
    const map = new Map<string, string>()
    for (const item of items) {
      map.set(item.supplierId, item.supplier)
    }
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }))
  }, [items])

  const filterOptions = useMemo(() => {
    const supplierSet = new Map<string, string>()
    const categorySet = new Set<string>()
    const teamMemberSet = new Set<string>()
    for (const item of items) {
      supplierSet.set(item.supplierId, item.supplier)
      if (item.category) categorySet.add(item.category)
      if (item.assignee) teamMemberSet.add(item.assignee)
    }
    return {
      suppliers: Array.from(supplierSet.entries()).map(([id, name]) => ({
        id,
        name,
      })),
      categories: Array.from(categorySet).sort(),
      teamMembers: Array.from(teamMemberSet).sort(),
    }
  }, [items])

  const hasActiveFilters =
    filters.suppliers.size > 0 ||
    filters.categories.size > 0 ||
    filters.teamMembers.size > 0

  const toggleFilter = useCallback((type: keyof CartFilters, value: string) => {
    setFilters((prev) => {
      const next = new Set(prev[type])
      if (next.has(value)) {
        next.delete(value)
      } else {
        next.add(value)
      }
      return { ...prev, [type]: next }
    })
  }, [])

  const clearFilters = useCallback(() => {
    setFilters({
      suppliers: new Set(),
      categories: new Set(),
      teamMembers: new Set(),
    })
  }, [])

  const handleSort = useCallback(
    (field: SortField) => {
      if (sortField === field) {
        setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'))
      } else {
        setSortField(field)
        setSortDirection('asc')
      }
    },
    [sortField],
  )

  // Apply search, filters, and sort
  const filteredItems = useMemo(() => {
    let result = items

    // Search
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      result = result.filter(
        (item) =>
          item.name.toLowerCase().includes(q) ||
          item.supplier.toLowerCase().includes(q) ||
          item.category?.toLowerCase().includes(q) ||
          item.assignee?.toLowerCase().includes(q),
      )
    }

    // Filters
    if (filters.suppliers.size > 0) {
      result = result.filter((item) => filters.suppliers.has(item.supplierId))
    }
    if (filters.categories.size > 0) {
      result = result.filter(
        (item) => item.category && filters.categories.has(item.category),
      )
    }
    if (filters.teamMembers.size > 0) {
      result = result.filter(
        (item) => item.assignee && filters.teamMembers.has(item.assignee),
      )
    }

    // Sort
    if (sortField) {
      result = [...result].sort((a, b) => {
        let cmp = 0
        switch (sortField) {
          case 'name':
            cmp = a.name.localeCompare(b.name)
            break
          case 'supplier':
            cmp = a.supplier.localeCompare(b.supplier)
            break
          case 'addedBy':
            cmp = (a.addedBy?.name ?? '').localeCompare(b.addedBy?.name ?? '')
            break
          case 'date': {
            const aTime = a.addedBy?.addedAt.getTime() ?? 0
            const bTime = b.addedBy?.addedAt.getTime() ?? 0
            cmp = aTime - bTime
            break
          }
          case 'qty':
            cmp = a.quantity - b.quantity
            break
          case 'price':
            cmp = a.price - b.price
            break
          case 'total':
            cmp = a.quantity * a.price - b.quantity * b.price
            break
        }
        return sortDirection === 'desc' ? -cmp : cmp
      })
    }

    return result
  }, [items, searchQuery, filters, sortField, sortDirection])

  const startEditing = useCallback(
    (row: number, col: number) => {
      const item = filteredItems[row]
      if (!item) return
      if (col === 1) {
        setEditValue(String(item.quantity))
      }
      setEditingCell({ row, col })
    },
    [filteredItems],
  )

  const commitEdit = useCallback(
    (row: number, col: number) => {
      const item = filteredItems[row]
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
    [filteredItems, editValue, cart],
  )

  const cancelEdit = useCallback(() => {
    setEditingCell(null)
    setEditValue('')
  }, [])

  const handleSupplierChange = useCallback(
    (row: number, supplierId: string) => {
      const item = filteredItems[row]
      if (!item) return
      const supplier = suppliers.find((s) => s.id === supplierId)
      if (supplier) {
        cart.updateSupplier(item.id, supplier.id, supplier.name)
      }
      setEditingCell(null)
    },
    [filteredItems, suppliers, cart],
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
          if (nextRow < filteredItems.length) {
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
          if (nextRow < filteredItems.length) {
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
          prev && prev.row < filteredItems.length - 1
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
        if (nextRow < filteredItems.length) {
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
      filteredItems.length,
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

  function renderSortIcon(field: SortField) {
    if (sortField !== field) return null
    return sortDirection === 'asc' ? (
      <ArrowUp className="ml-1 h-3 w-3" />
    ) : (
      <ArrowDown className="ml-1 h-3 w-3" />
    )
  }

  function renderSortableHeader(label: string, field: SortField) {
    return (
      <button
        type="button"
        className="inline-flex items-center text-xs font-medium hover:text-foreground"
        onClick={() => handleSort(field)}
      >
        {label}
        {renderSortIcon(field)}
      </button>
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
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3 border-b px-4 py-2">
        <div className="relative w-64">
          <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search cart"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-8 border-none bg-transparent pl-8 text-xs shadow-none focus-visible:ring-0"
          />
        </div>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="relative h-8 w-8">
              <ListFilter className="h-4 w-4" />
              {hasActiveFilters && (
                <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-blue-500" />
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-56 p-0">
            <div className="p-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium">Filters</p>
                {hasActiveFilters && (
                  <button
                    type="button"
                    className="text-xs text-muted-foreground hover:text-foreground"
                    onClick={clearFilters}
                  >
                    Clear all
                  </button>
                )}
              </div>
            </div>

            {filterOptions.suppliers.length > 0 && (
              <div className="border-t p-3">
                <p className="mb-2 text-xs font-medium text-muted-foreground">
                  Supplier
                </p>
                <div className="flex flex-col gap-1.5">
                  {filterOptions.suppliers.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      className="flex items-center gap-2 rounded px-1 py-0.5 text-xs hover:bg-accent"
                      onClick={() => toggleFilter('suppliers', s.id)}
                    >
                      <div
                        className={cn(
                          'flex h-4 w-4 items-center justify-center rounded border',
                          filters.suppliers.has(s.id)
                            ? 'border-primary bg-primary text-primary-foreground'
                            : 'border-input',
                        )}
                      >
                        {filters.suppliers.has(s.id) && (
                          <Check className="h-3 w-3" />
                        )}
                      </div>
                      {s.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {filterOptions.categories.length > 0 && (
              <div className="border-t p-3">
                <p className="mb-2 text-xs font-medium text-muted-foreground">
                  Category
                </p>
                <div className="flex flex-col gap-1.5">
                  {filterOptions.categories.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      className="flex items-center gap-2 rounded px-1 py-0.5 text-xs hover:bg-accent"
                      onClick={() => toggleFilter('categories', cat)}
                    >
                      <div
                        className={cn(
                          'flex h-4 w-4 items-center justify-center rounded border',
                          filters.categories.has(cat)
                            ? 'border-primary bg-primary text-primary-foreground'
                            : 'border-input',
                        )}
                      >
                        {filters.categories.has(cat) && (
                          <Check className="h-3 w-3" />
                        )}
                      </div>
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {filterOptions.teamMembers.length > 0 && (
              <div className="border-t p-3">
                <p className="mb-2 text-xs font-medium text-muted-foreground">
                  Team Member
                </p>
                <div className="flex flex-col gap-1.5">
                  {filterOptions.teamMembers.map((member) => (
                    <button
                      key={member}
                      type="button"
                      className="flex items-center gap-2 rounded px-1 py-0.5 text-xs hover:bg-accent"
                      onClick={() => toggleFilter('teamMembers', member)}
                    >
                      <div
                        className={cn(
                          'flex h-4 w-4 items-center justify-center rounded border',
                          filters.teamMembers.has(member)
                            ? 'border-primary bg-primary text-primary-foreground'
                            : 'border-input',
                        )}
                      >
                        {filters.teamMembers.has(member) && (
                          <Check className="h-3 w-3" />
                        )}
                      </div>
                      {member}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </PopoverContent>
        </Popover>
      </div>

      <ScrollArea className="flex-1">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[180px]">
                {renderSortableHeader('Name', 'name')}
              </TableHead>
              <TableHead className="min-w-[120px]">
                {renderSortableHeader('Supplier', 'supplier')}
              </TableHead>
              <TableHead className="min-w-[100px]">
                {renderSortableHeader('Added By', 'addedBy')}
              </TableHead>
              <TableHead className="min-w-[80px]">
                {renderSortableHeader('Date', 'date')}
              </TableHead>
              <TableHead className="min-w-[100px]">
                {renderSortableHeader('Qty', 'qty')}
              </TableHead>
              <TableHead className="min-w-[80px] text-right">
                {renderSortableHeader('Price', 'price')}
              </TableHead>
              <TableHead className="min-w-[80px] text-right">
                {renderSortableHeader('Total', 'total')}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredItems.map((item, row) => (
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
                  {item.addedBy ? (
                    <RelativeTime
                      date={item.addedBy.addedAt}
                      className="text-xs text-muted-foreground"
                    />
                  ) : (
                    <span className="text-xs text-muted-foreground">-</span>
                  )}
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
