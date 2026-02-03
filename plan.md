Work on epics:

1. @docs/cart-organization.md

## Tasks

- [x] 1. Install @dnd-kit packages (`@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities`) into `apps/web` — passes: true
- [x] 2. Create `cart-item.tsx` + `cart-item.stories.tsx` — extract presentational item with clickable name + supplier badge — passes: true
- [x] 3. Create `cart-layout-menu.tsx` + `cart-layout-menu.stories.tsx` — layout mode dropdown with dynamic icon — passes: true
- [x] 4. Create `cart-group-header.tsx` + `cart-group-header.stories.tsx` — auto-group collapsible header — passes: true
- [x] 5. Create `cart-folder.tsx` + `cart-folder.stories.tsx` — folder header component — passes: true
- [x] 6. Create `use-cart-state.ts` — state hook with all logic + DnD handlers + layout mode + auto-grouping — passes: true
- [x] 7. Create `sortable-cart-item.tsx` — useSortable wrapper — passes: true
- [x] 8. Create `sortable-cart-folder.tsx` — useSortable + Collapsible + inner SortableContext — passes: true
- [ ] 9. Refactor `order-cart.tsx` — wire up DndContext + layout modes + all sub-components; accept `onOpenProduct`/`onOpenSupplier` props — passes: false
- [ ] 10. Update `order/new/page.tsx` — pass `onOpenProduct`/`onOpenSupplier` to `OrderCart` — passes: false
- [ ] 11. Update `order-cart.stories.tsx` — add stories for all layout modes — passes: false
- [ ] 12. Run `bun run fix && bun run knip:fix` then `bun run ci` — passes: false
