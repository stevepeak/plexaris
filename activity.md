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
