# Cart Folder Organization

Add folder organization to the order cart, enabling users to group items into collapsible, renamable, drag-and-drop folders for clarity when building large orders.

## Current State

The cart (`apps/web/components/order/order-cart.tsx`) is a client-side-only component:

- Uses `useState<CartItem[]>` with demo data (no persistence)
- `CartItem`: `{ id, name, price, unit, quantity, supplier }`
- Renders in a 320px right panel on the order page
- Features: quantity +/-, remove item, subtotal, empty state
- No drag-and-drop library installed
- No global state management — all React useState
- Center panel uses a tab system (`TabItem` with types: product, supplier, recipe) managed by `openTab` in the order page

## Cart Item Click-Through

Cart items act as entry points into the center panel tab system:

- **Click item name** → opens a `product` tab in the center panel via `openTab({ type: 'product', id, label })`
- **Click supplier badge** → opens a `supplier` tab in the center panel via `openTab({ type: 'supplier', id, label })`

The `OrderCart` component receives an `onOpenProduct` and `onOpenSupplier` callback from the order page (same pattern as `ContentViewer`). Item names render as clickable `button` elements with `hover:underline` styling. Supplier badges render as clickable `Badge` elements with `cursor-pointer`.

## Cart Layout Modes

An icon button in the cart header provides a dropdown menu to switch between layout modes. The button icon changes to reflect the active mode.

### Modes

| Mode           | Icon         | Description                                                                      |
| -------------- | ------------ | -------------------------------------------------------------------------------- |
| Flat           | `List`       | Default. Plain item list, no grouping.                                           |
| Folders        | `FolderOpen` | Manual drag-and-drop folders (see Folder Organization below).                    |
| By Supplier    | `Store`      | Auto-grouped by `item.supplier`. Each supplier is a collapsible group header.    |
| By Category    | `Tag`        | Auto-grouped by `item.category`. Each category is a collapsible group header.    |
| By Team Member | `Users`      | Auto-grouped by `item.assignee`. Each team member is a collapsible group header. |

### Data Model Additions

```typescript
type CartLayoutMode =
  | 'flat'
  | 'folders'
  | 'by-supplier'
  | 'by-category'
  | 'by-team-member'

interface CartItem {
  id: string
  name: string
  price: number
  unit: string
  quantity: number
  supplier: string
  supplierId: string // needed for click-through to supplier tab
  category?: string // populated from product data, used for by-category grouping
  assignee?: string // team member who added/is responsible, used for by-team-member grouping
}
```

### Layout Menu Component

```
CartHeader
  ShoppingCart icon + "Cart" title + item count badge
  LayoutModeButton (icon changes per active mode)
    DropdownMenu
      DropdownMenuLabel "Organize"
      DropdownMenuSeparator
      DropdownMenuRadioGroup (value = activeMode)
        DropdownMenuRadioItem "Flat"           (List icon)
        DropdownMenuRadioItem "Folders"        (FolderOpen icon)
      DropdownMenuSeparator
      DropdownMenuLabel "Group by"
        DropdownMenuRadioItem "Supplier"       (Store icon)
        DropdownMenuRadioItem "Category"       (Tag icon)
        DropdownMenuRadioItem "Team Member"    (Users icon)
```

### Auto-Grouping Behavior

When a grouped mode is active (by-supplier, by-category, by-team-member):

- Items are automatically sorted into collapsible groups based on the grouping field
- Group headers show: `[chevron] [group name] [item count badge] [$subtotal]`
- Groups are collapsible using the same `Collapsible` component as folders
- Items with a missing grouping field (e.g., no category) go into an "Ungrouped" section at the bottom
- Switching modes preserves the cart contents — only the visual layout changes
- Auto-grouped modes are read-only (no drag-and-drop reordering); only "Folders" mode supports DnD

### State

```typescript
const [layoutMode, setLayoutMode] = useState<CartLayoutMode>('flat')
```

The `useCartState` hook accepts `layoutMode` and returns the appropriate rendering structure. When mode is `flat`, items render as a plain list. When mode is a `by-*` grouping, the hook computes groups from item data. When mode is `folders`, the full DnD folder system is active.

## Data Model

```typescript
interface CartFolder {
  id: string // "folder-<uuid>"
  name: string // editable, default "New Folder"
  collapsed: boolean
}

interface CartItem {
  id: string
  name: string
  price: number
  unit: string
  quantity: number
  supplier: string
}

// Normalized state for efficient DnD multi-container operations
interface CartState {
  items: Record<string, CartItem>
  folders: Record<string, CartFolder>
  rootOrder: string[] // interleaved folder ids + loose item ids
  folderContents: Record<string, string[]> // folder id -> ordered item ids
}
```

An item exists in exactly one place: either `rootOrder` (loose) or a single `folderContents[folderId]` entry. Folders only exist at root level — no nesting.

## Dependencies

Install into `apps/web`:

```
bun add --cwd apps/web @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

- `@dnd-kit/core` — DndContext, DragOverlay, sensors, collision detection
- `@dnd-kit/sortable` — SortableContext, useSortable, arrayMove, verticalListSortingStrategy
- `@dnd-kit/utilities` — CSS transform utilities

## Files

| Action | File                                                      | Purpose                                                                                       |
| ------ | --------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| Create | `apps/web/hooks/use-cart-state.ts`                        | CartState, all actions, DnD handlers, computed totals, layout mode logic                      |
| Create | `apps/web/components/order/cart-item.tsx`                 | Presentational item row with clickable name + supplier badge                                  |
| Create | `apps/web/components/order/cart-item.stories.tsx`         | Stories for cart item                                                                         |
| Create | `apps/web/components/order/sortable-cart-item.tsx`        | `useSortable` wrapper + GripVertical drag handle                                              |
| Create | `apps/web/components/order/cart-folder.tsx`               | Folder header: chevron, editable name, count/subtotal badges, delete                          |
| Create | `apps/web/components/order/cart-folder.stories.tsx`       | Stories for cart folder                                                                       |
| Create | `apps/web/components/order/sortable-cart-folder.tsx`      | `useSortable` + Collapsible + inner SortableContext                                           |
| Create | `apps/web/components/order/cart-group-header.tsx`         | Auto-group header: chevron, group name, count/subtotal (for by-supplier/category/team-member) |
| Create | `apps/web/components/order/cart-group-header.stories.tsx` | Stories for cart group header                                                                 |
| Create | `apps/web/components/order/cart-layout-menu.tsx`          | DropdownMenu for switching layout modes with dynamic icon                                     |
| Create | `apps/web/components/order/cart-layout-menu.stories.tsx`  | Stories for cart layout menu                                                                  |
| Modify | `apps/web/components/order/order-cart.tsx`                | DndContext orchestrator using useCartState + sub-components + layout modes                    |
| Modify | `apps/web/components/order/order-cart.stories.tsx`        | Add folder + grouped layout stories                                                           |
| Modify | `apps/web/app/(app)/order/new/page.tsx`                   | Pass `onOpenProduct`/`onOpenSupplier` callbacks to OrderCart                                  |

## Component Tree

```
OrderCart
  DndContext (sensors, closestCorners collision) — only active when layoutMode === 'folders'
    CartHeader
      ShoppingCart icon + "Cart" title + item count badge
      CartLayoutMenu (dropdown, icon matches active mode)
      "Add Folder" button (FolderPlus icon) — only visible when layoutMode === 'folders'
    ScrollArea
      if layoutMode === 'flat':
        flat list of CartItem (clickable name + supplier badge)
      if layoutMode === 'folders':
        SortableContext (rootOrder, verticalListSortingStrategy)
          for each rootOrder id:
            folder? → SortableCartFolder
                        CollapsibleTrigger (chevron + editable name + count + subtotal)
                        CollapsibleContent
                          SortableContext (folderContents[id])
                            SortableCartItem (indented with pl-8)
                          empty → droppable placeholder ("Drag items here")
            item?   → SortableCartItem (root level, full width)
      if layoutMode === 'by-supplier' | 'by-category' | 'by-team-member':
        for each group:
          CartGroupHeader (chevron + group name + count + subtotal)
          Collapsible
            CartItem[] (indented with pl-8, clickable name + supplier badge)
        "Ungrouped" section (if any items lack the grouping field)
    DragOverlay → simplified CartItem or CartFolder preview with shadow (folders mode only)
  CartFooter — total items, subtotal, checkout button
```

## DnD Configuration

### Sensors

```typescript
const sensors = useSensors(
  useSensor(PointerSensor, {
    activationConstraint: { distance: 5 }, // prevent accidental drags when clicking buttons
  }),
  useSensor(KeyboardSensor, {
    coordinateGetter: sortableKeyboardCoordinates,
  }),
)
```

### Collision Detection

Use `closestCorners` (not `closestCenter`) — works better for detecting folder container boundaries with varying heights.

### Drag Handle

GripVertical icon at the left edge of each row. Only the handle receives `listeners` + `attributes` from `useSortable`, keeping quantity buttons, delete, etc. clickable.

### useSortable Data

Each sortable element passes `data` so DnD handlers can identify types and containers:

```typescript
// Items:
useSortable({ id: item.id, data: { type: 'item', containerId } })

// Folders:
useSortable({ id: folder.id, data: { type: 'folder' } })
```

### Event Handlers

**`onDragOver`** — handles cross-container movement (item moving between root ↔ folder, or folder ↔ folder):

- Only processes item-type drags (folders can't nest)
- Detects target container from `over.data.current`
- If source and target containers differ, moves item between them in real-time

**`onDragEnd`** — handles same-container reordering:

- Folder drags: reorder within `rootOrder`
- Item drags: reorder within their current container (`rootOrder` or `folderContents[folderId]`)

## Interactions

### Add Folder

- FolderPlus button in cart header
- Appends new folder with name "New Folder" to end of `rootOrder`
- Auto-enters rename mode on creation

### Rename Folder

- Double-click folder name → inline `<Input>` (compact: `h-6 text-xs`)
- Enter or blur → commit rename
- Escape → revert to previous name
- Local editing state in the folder component

### Collapse/Expand

- Chevron toggle (ChevronRight, rotates 90deg when expanded)
- Uses shadcn/ui `Collapsible` component (already in project)
- Collapsed state shows: `[grip] [chevron] [name] [count badge] [$subtotal] [delete]`
- Collapsed folders remain valid drop targets — items dropped on them go to end of contents

### Delete Folder

- Trash2 button on folder header
- Moves all contained items back to `rootOrder` at the folder's position
- Then removes the folder

### Drag Item Into Folder

- `onDragOver` detects folder boundary
- Moves item from current container into `folderContents[folderId]`
- Folder highlights with `ring-2 ring-primary/50` during hover

### Drag Item Out of Folder

- `onDragOver` detects root boundary
  const [layoutMode, setLayoutMode] = useState<CartLayoutMode>('flat')
- Moves item from `folderContents[folderId]` to `rootOrder`

### Reorder Folders

- Drag folders within `rootOrder`
- Items inside move with their folder
- Folders cannot be dragged into other folders

## `useCartState` Hook API

```typescript
function useCartState(initialItems?: CartItem[]) {
  // State
  const [state, setState] = useState<CartState>()
  const [activeId, setActiveId] = useState<string | null>(null)

  // Auto-grouping (active when layoutMode is a 'by-*' mode)
  const groups: Array<{ key: string; label: string; items: CartItem[] }>
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>()
  function toggleGroupCollapse(groupKey: string): void

  // Item actions
  function updateQuantity(itemId: string, delta: number): void
  function removeItem(itemId: string): void

  // Folder actions (only active when layoutMode === 'folders')
  function addFolder(): string // returns new folder id
  function groupSubtotal(groupKey: string): number
  function groupItemCount(groupKey: string): number
  function renameFolder(folderId: string, name: string): void
  function toggleFolderCollapse(folderId: string): void
  function removeFolder(folderId: string): void

  // DnD handlers (only active when layoutMode === 'folders')
  function handleDragStart(event: DragStartEvent): void
  function handleDragOver(event: DragOverEvent): void
  function handleDragEnd(event: DragEndEvent): void

  // Computed
  const allItems: CartItem[]
  const itemCount: number
  const subtotal: number
  function folderSubtotal(folderId: string): number
  function folderItemCount(folderId: string): number
}
```

## Visual Layout (320px panel)

- Root items: `px-4 py-3`, full width, same layout as current
- Folder header: `px-4 py-2`, compact row: `[grip 16px] [chevron 16px] [name flex-1] [count] [$total] [delete 28px]`
- Folder items: `pl-8 pr-4 py-3`, indented to nest visually under folder
- Drag overlay: `w-[288px]`, `shadow-lg rounded-md bg-background border`, no interactive buttons
- Empty folder zone: `pl-8 py-4`, muted text "Drag items here"

## Edge Cases

- **Empty folder drop**: useDroppable zone with placeholder text when folder has zero items
- **No nested folders**: `onDragOver` ignores folder-into-folder drags
- **Collapsed folder drop**: folder header acts as droppable; items go to end of contents
- **Quantity to zero**: removes item from its container (root or folder); empty folders are kept
- **Auto-scroll**: @dnd-kit auto-scroll works with Radix ScrollArea's native scroll behavior

## Implementation Order

1. Install @dnd-kit packages
2. `cart-item.tsx` + stories — extract presentational item with clickable name + supplier badge (`onOpenProduct`, `onOpenSupplier` callbacks)
3. `cart-layout-menu.tsx` + stories — layout mode dropdown with dynamic icon
4. `cart-group-header.tsx` + stories — auto-group collapsible header
5. `cart-folder.tsx` + stories — folder header component
6. `use-cart-state.ts` — state hook with all logic + DnD handlers + layout mode + auto-grouping
7. `sortable-cart-item.tsx` — useSortable wrapper
8. `sortable-cart-folder.tsx` — useSortable + Collapsible + inner SortableContext
9. Refactor `order-cart.tsx` — wire up DndContext + layout modes + all sub-components; accept `onOpenProduct`/`onOpenSupplier` props
10. Update `order/new/page.tsx` — pass `onOpenProduct`/`onOpenSupplier` to `OrderCart`
11. Update `order-cart.stories.tsx` — Flat, WithFolders, CollapsedFolders, EmptyFolder, MixedItems, GroupedBySupplier, GroupedByCategory, GroupedByTeamMember
12. `bun run fix && bun run knip:fix` then `bun run ci`

## OrderCart Props

```typescript
interface OrderCartProps {
  initialItems?: CartItem[]
  onOpenProduct?: (productId: string, productName: string) => void
  onOpenSupplier?: (supplierId: string, supplierName: string) => void
}
```

## Verification

- **Storybook**: all stories render correctly
- **Dev app** (localhost:3000): navigate to order page and test:
  - Click item name in cart → product tab opens in center panel
  - Click supplier badge in cart → supplier tab opens in center panel
  - Switch layout modes via dropdown menu; icon updates to match
  - Flat mode: plain list, no grouping
  - Folders mode: create folder, rename, collapse/expand, DnD
  - By Supplier: items auto-grouped under supplier headers
  - By Category: items auto-grouped under category headers
  - By Team Member: items auto-grouped under team member headers
  - Items without a grouping field appear in "Ungrouped" section
  - Switching modes preserves cart contents
  - Quantity +/- and delete still work in all modes
- **CI**: `bun run ci` passes
