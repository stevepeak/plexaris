## 2026-02-03

### Task 1: Install @dnd-kit packages

Added `@dnd-kit/core@^6.3.1`, `@dnd-kit/sortable@^10.0.0`, and `@dnd-kit/utilities@^3.2.2` as dependencies in `apps/web/package.json`. Run `bun install` to complete installation.

Screenshot: browser was locked by another process; no screenshot taken for this dependency-only change.

### Task 2: Create cart-item.tsx + cart-item.stories.tsx

Created `apps/web/components/order/cart-item.tsx` — a presentational cart item component extracted from the inline rendering in `order-cart.tsx`. Features:

- Exported `CartItemData` interface with all fields from the spec (`id`, `name`, `price`, `unit`, `quantity`, `supplier`, `supplierId`, `category?`, `assignee?`)
- Clickable item name (`button` with `hover:underline`) that fires `onOpenProduct(id, name)`
- Clickable supplier `Badge` (outline variant, `cursor-pointer`) that fires `onOpenSupplier(supplierId, supplierName)`
- Quantity +/- buttons with tooltips and keyboard shortcut hints
- Remove button with tooltip
- `selected` prop for accent background highlight
- `className` prop for layout customization (e.g., `pl-8` for folder indentation)

Created `apps/web/components/order/cart-item.stories.tsx` with 5 stories:

- `Default` — standard item with all callbacks
- `Selected` — item with accent background
- `LongName` — item with truncated long name
- `HighQuantity` — item with quantity 999
- `NoCallbacks` — item rendered without any event handlers

Verified: TypeScript compiles without errors. All 5 stories registered in Storybook index.json and iframe renders HTTP 200.

Screenshot: browser was locked by another process; no screenshot taken. Verified via Storybook index.json and HTTP 200 responses.

### Task 3: Create cart-layout-menu.tsx + cart-layout-menu.stories.tsx

Created `apps/web/components/order/cart-layout-menu.tsx` — a dropdown menu component for switching cart layout modes. Features:

- Exported `CartLayoutMode` type union: `'flat' | 'folders' | 'by-supplier' | 'by-category' | 'by-team-member'`
- Dynamic trigger button icon that changes to reflect the active layout mode (List, FolderOpen, Store, Tag, Users)
- `DropdownMenuRadioGroup` with two sections:
  - "Organize" label with Flat (List icon) and Folders (FolderOpen icon) options
  - "Group by" label with Supplier (Store icon), Category (Tag icon), and Team Member (Users icon) options
- Props: `value` (current mode) and `onValueChange` callback
- Uses shadcn `DropdownMenu` components with `align="end"` positioning

Created `apps/web/components/order/cart-layout-menu.stories.tsx` with 5 stories:

- `Default` — interactive menu starting in flat mode
- `FoldersMode` — interactive menu starting in folders mode
- `BySupplier` — interactive menu starting in by-supplier mode
- `ByCategory` — interactive menu starting in by-category mode
- `ByTeamMember` — interactive menu starting in by-team-member mode

Verified: TypeScript compiles without errors (tsc exit code 0). All 5 stories registered in Storybook index.json and iframe renders HTTP 200.

Screenshot: browser was locked by another process; no screenshot taken. Verified via Storybook index.json and HTTP 200 responses.

### Task 4: Create cart-group-header.tsx + cart-group-header.stories.tsx

Created `apps/web/components/order/cart-group-header.tsx` — an auto-group collapsible header for by-supplier / by-category / by-team-member layout modes. Features:

- Exported `CartGroupHeaderProps` interface with `label`, `itemCount`, `subtotal`, `open`, `onOpenChange`, and `children`
- Collapsible group using shadcn `Collapsible` / `CollapsibleTrigger` / `CollapsibleContent`
- Chevron icon (`ChevronRight`) that rotates 90deg when expanded via `transition-transform`
- Group label (truncated, left-aligned, font-medium)
- Item count `Badge` (secondary variant)
- Subtotal display (`$X.XX` format, muted foreground)
- Full-width trigger with `hover:bg-accent` for interactive feedback
- `children` slot for rendering indented `CartItem` components inside the group

Created `apps/web/components/order/cart-group-header.stories.tsx` with 5 stories:

- `Default` — expanded group with 2 items ("Green Valley" supplier)
- `Collapsed` — same group starting collapsed (only header visible)
- `Ungrouped` — group labeled "Ungrouped" for items missing the grouping field
- `SingleItem` — group with a single item
- `MultipleGroups` — two groups rendered together ("Green Valley" + "Baker Bros")

Verified: TypeScript compiles without errors (turbo typecheck 8/8 tasks successful). All 5 stories registered in Storybook index.json and iframe renders HTTP 200.

Screenshot: browser was locked by another process; no screenshot taken. Verified via Storybook index.json and HTTP 200 responses.

### Task 5: Create cart-folder.tsx + cart-folder.stories.tsx

Created `apps/web/components/order/cart-folder.tsx` — a folder header component for the folders layout mode. Features:

- Exported `CartFolderProps` interface with `id`, `name`, `itemCount`, `subtotal`, `open`, `onOpenChange`, `onRename`, `onDelete`, and `children`
- Collapsible folder using shadcn `Collapsible` / `CollapsibleTrigger` / `CollapsibleContent`
- Chevron icon (`ChevronRight`) that rotates 90deg when expanded via `transition-transform`
- Inline rename on double-click: swaps folder name `span` for a compact `Input` (`h-6 text-xs`), commits on Enter/blur, reverts on Escape
- Item count `Badge` (secondary variant)
- Subtotal display (`$X.XX` format, muted foreground)
- Delete button (`Trash2` icon, ghost variant, `hover:text-destructive`)
- `children` slot for rendering indented `CartItem` components inside the folder

Created `apps/web/components/order/cart-folder.stories.tsx` with 5 stories:

- `Default` — expanded folder with 2 items, interactive rename + collapse
- `Collapsed` — same folder starting collapsed (only header visible)
- `EmptyFolder` — folder with zero items
- `LongName` — folder with a long truncated name
- `MultipleFolders` — two folders rendered together ("Dairy Order" + "Bakery Order")

Verified: TypeScript compiles without errors (turbo typecheck 8/8 tasks successful). All 5 stories registered in Storybook index.json and iframe renders HTTP 200.

Screenshot: browser was locked by another process; no screenshot taken. Verified via Storybook index.json and HTTP 200 responses.

### Task 6: Create use-cart-state.ts

Created `apps/web/hooks/use-cart-state.ts` — the central state management hook for the cart system. Features:

- Exported types: `CartFolder`, `CartState`, `CartGroup`
- Normalized state model: `items` (Record), `folders` (Record), `rootOrder` (interleaved ids), `folderContents` (folder id → item ids)
- Layout mode state (`CartLayoutMode`) with `setLayoutMode` setter
- `activeId` state for tracking the currently dragged element
- Item actions: `updateQuantity` (removes item when quantity reaches 0), `removeItem`
- Folder actions: `addFolder` (returns new id), `renameFolder`, `toggleFolderCollapse`, `removeFolder` (splices contained items back into rootOrder at folder position)
- Auto-grouping: computes `groups` array (sorted alphabetically, with "Ungrouped" at end) when layout mode is `by-supplier`, `by-category`, or `by-team-member`
- Group collapse tracking: `collapsedGroups` (Set) with `toggleGroupCollapse`
- DnD handlers (folders mode): `handleDragStart`, `handleDragOver` (cross-container moves), `handleDragEnd` (same-container reorder)
- Computed values: `allItems`, `itemCount`, `subtotal`, `folderSubtotal(id)`, `folderItemCount(id)`, `groupSubtotal(key)`, `groupItemCount(key)`
- All callbacks wrapped in `useCallback`; computed values use `useMemo`
- Imports `arrayMove` from `@dnd-kit/sortable` and DnD event types from `@dnd-kit/core`
- Re-uses `CartItemData` from `cart-item.tsx` and `CartLayoutMode` from `cart-layout-menu.tsx`

Verified: only TypeScript errors are TS2307 "Cannot find module" for `@dnd-kit/sortable` and `@dnd-kit/core` — packages declared in package.json but not yet installed (`bun install` required). No other type errors in the hook code.

Screenshot: browser was locked by another process; no screenshot taken. This is a state-only hook with no visual output.
