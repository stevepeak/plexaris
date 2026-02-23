# Checkout Flow Implementation Plan

## Context

The order page (`/order/[orderId]`) currently only supports the shopping experience — a 3-panel layout for browsing products, adding to cart, and managing items. The "Checkout" button in the cart sidebar does nothing. There is no way to submit an order, view an invoice, or track a submitted order.

This plan introduces a full checkout experience designed for B2B supplier-to-restaurant ordering:

- A 2-panel checkout layout (invoice on left, form/tracking on right)
- Permission-gated order submission (`place_order` permission)
- A post-checkout animation (PAID stamp on invoice)
- Order tracking view for submitted orders
- Seamless navigation: clicking a non-draft order from the orders list goes directly to the checkout/tracking view

---

## Architecture Decision

No new routes are needed. The existing `/order/[orderId]` page gains a `checkoutMode` boolean state:

- `checkoutMode = false` → existing 3-panel shopping layout (browse, content, cart)
- `checkoutMode = true` → new 2-panel checkout layout (invoice, form/tracking)

This mode is set automatically for non-draft orders (submitted, confirmed, delivered) and manually when the user clicks "Checkout" on a draft order.

---

## Step 1: Backend — Permission Helper

> passes: true

**File:** `packages/api/src/lib/verify-access.ts`

Currently, `verifyAccess()` only checks org membership (is the user a member?). We need a complementary function that checks specific permissions.

Add `hasPermission()`:

```typescript
export async function hasPermission(
  db: DB,
  userId: string,
  organizationId: string,
  superAdmin: boolean,
  permission: string,
): Promise<boolean> {
  if (superAdmin) return true

  const [row] = await db
    .select({ permissions: schema.role.permissions })
    .from(schema.membership)
    .innerJoin(schema.role, eq(schema.membership.roleId, schema.role.id))
    .where(
      and(
        eq(schema.membership.userId, userId),
        eq(schema.membership.organizationId, organizationId),
      ),
    )
    .limit(1)

  return row?.permissions.includes(permission) ?? false
}
```

This returns a boolean rather than throwing, so the caller decides the behavior. The `order.submit` mutation will throw `FORBIDDEN` if this returns false.

**Why not a new tRPC query for permissions?** The client already has `activeOrg.permissions: string[]` from `useActiveOrg()` (populated by `/api/organizations/mine`). The client uses this for UI gating (show/hide "Place Order" button). The server enforces via the `submit` mutation.

---

## Step 2: Backend — `order.submit` Mutation

> passes: true

**File:** `packages/api/src/routers/order.ts`

New procedure added to `orderRouter`:

```typescript
submit: protectedProcedure
  .input(
    z.object({
      orderId: z.string().uuid(),
      deliveryNotes: z.string().optional(),
    }),
  )
  .mutation(async ({ ctx, input }) => {
    // 1. Verify membership
    const orderRow = await verifyOrderAccess(
      ctx.db,
      ctx.session.user.id,
      input.orderId,
      ctx.session.user.superAdmin,
    )

    // 2. Verify place_order permission
    const canPlace = await hasPermission(
      ctx.db,
      ctx.session.user.id,
      orderRow.organizationId,
      ctx.session.user.superAdmin,
      'place_order',
    )
    if (!canPlace)
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'Missing place_order permission',
      })

    // 3. Verify order is draft
    const [order] = await ctx.db
      .select()
      .from(schema.order)
      .where(eq(schema.order.id, input.orderId))
      .limit(1)
    if (order?.status !== 'draft')
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Order is not a draft',
      })

    // 4. Verify order has items
    const [itemCount] = await ctx.db
      .select({ count: count() })
      .from(schema.orderItem)
      .where(
        and(
          eq(schema.orderItem.orderId, input.orderId),
          isNull(schema.orderItem.removedAt),
        ),
      )
    if (!itemCount?.count)
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Order has no items',
      })

    // 5. Update order status
    const now = new Date()
    await ctx.db
      .update(schema.order)
      .set({
        status: 'submitted',
        submittedAt: now,
        updatedAt: now,
        notes: input.deliveryNotes ?? order.notes,
      })
      .where(eq(schema.order.id, input.orderId))

    // 6. Log events
    await logEvent(
      ctx.db,
      input.orderId,
      'order_submitted',
      ctx.session.user.id,
    )
    await trackEvent(ctx.db, {
      organizationId: orderRow.organizationId,
      actorId: ctx.session.user.id,
      action: 'order.submitted',
      entityType: 'order',
      entityId: input.orderId,
    })

    return { success: true }
  })
```

**File:** `packages/api/src/lib/audit.ts` — Add `'order.submitted'` to the `AuditAction` type union.

---

## Step 3: CSS — Stamp Animation Keyframe

> passes: true

**File:** `apps/web/app/globals.css`

Add a `@keyframes stamp` animation that mimics a rubber stamp being pressed down:

```css
@keyframes stamp {
  0% {
    opacity: 0;
    transform: rotate(-12deg) scale(2.5);
  }
  60% {
    opacity: 1;
    transform: rotate(-12deg) scale(0.9);
  }
  80% {
    transform: rotate(-12deg) scale(1.05);
  }
  100% {
    transform: rotate(-12deg) scale(1);
  }
}
```

Starts large and invisible, slams down to slightly small (0.9), bounces back (1.05), settles at 1.0. The `-12deg` rotation gives it that authentic hand-stamped look. Duration: 0.5s ease-out.

---

## Step 4: `CheckoutInvoice` Component (Left Panel)

> passes: true

**New file:** `apps/web/components/order/checkout/checkout-invoice.tsx`
**Story:** `apps/web/components/order/checkout/checkout-invoice.stories.tsx`

### Props

```typescript
interface CheckoutInvoiceProps {
  orderId: string
  items: CartItemData[]
  subtotal: number
  isPaid: boolean // controls PAID stamp visibility
  createdAt?: Date
  submittedAt?: Date | null
}
```

### Layout

The left panel occupies roughly 60% of the checkout layout width (`flex-[3]`).

**Background layer:**

- Subtle gradient background (`bg-gradient-to-br from-muted/30 to-muted/10`) similar to the existing `ContentViewer` empty state pattern
- Optional subtle grid pattern overlay for a "paper" feel

**Invoice card (centered on the background):**

- White card (`bg-card rounded-xl shadow-lg`) with generous padding
- **Header section:**
  - "INVOICE" in large, bold uppercase text
  - Order ID (first 8 chars of UUID, formatted like `#a1b2c3d4`)
  - Date (created date for drafts, submitted date for submitted orders)
- **Line items table:**
  - Columns: Item Name | Qty | Unit Price | Line Total
  - Each row shows: `productName`, `quantity`, `$unitPrice`, `$quantity * unitPrice`
  - Clean table with subtle row separators
- **Footer:**
  - Separator line
  - Subtotal row right-aligned, bold
  - Potential tax/total row (placeholder for future)

**PAID stamp overlay:**

- Absolutely positioned over the invoice card
- `border-4 border-red-500 text-red-500 font-bold text-5xl uppercase rounded-lg px-8 py-3`
- `rotate(-12deg)` transform
- When `isPaid` is false: `opacity-0 pointer-events-none`
- When `isPaid` becomes true: animate in using the `stamp` keyframe from Step 3
- Slightly transparent (`opacity-80`) when settled for a realistic rubber stamp look

### Storybook Stories

- `Default` — items displayed, no PAID stamp
- `Paid` — items with PAID stamp visible
- `SingleItem` — minimal invoice with one line
- `ManyItems` — 10+ items to test scrolling

---

## Step 5: `CheckoutForm` Component (Right Panel — Pre-Submit)

> passes: true

**New file:** `apps/web/components/order/checkout/checkout-form.tsx`
**Story:** `apps/web/components/order/checkout/checkout-form.stories.tsx`

### Props

```typescript
interface CheckoutFormProps {
  hasPlaceOrderPermission: boolean
  isSubmitting: boolean
  onSubmit: (deliveryNotes: string) => void
  onBack: () => void
  subtotal: number
  itemCount: number
}
```

### Layout

The right panel occupies roughly 40% (`flex-[2]`) with a scroll area for overflow.

**Section 1 — Delivery Instructions:**

- Label: "Delivery Notes"
- `<Textarea>` (shadcn) for free-form delivery instructions
- Placeholder: "Add any special delivery instructions, gate codes, or notes for the supplier..."
- Full width, 4 rows default

**Section 2 — Expected Delivery Date:**

- Label: "Expected Delivery"
- A card-like area with a `<Calendar>` icon and "Coming soon" `<Badge>` overlay
- Disabled/dimmed appearance (`opacity-50`)
- Brief description: "Schedule delivery windows and set expected dates"

**Section 3 — Payment Method:**

- Label: "Payment Method"
- A card with `<CreditCard>` icon and "Coming soon" `<Badge>`
- Disabled/dimmed appearance
- Brief description: "Configure payment terms and methods"

**Section 4 — Order Summary:**

- Small summary card showing:
  - Item count: `{itemCount} items`
  - Subtotal: `${subtotal.toFixed(2)}`

**Section 5 — Actions:**

If `hasPlaceOrderPermission` is **true**:

- "Place Order" primary `<Button>` (full width, shows spinner when `isSubmitting`)
- "Back to Cart" ghost `<Button>` below it (calls `onBack`)

If `hasPlaceOrderPermission` is **false**:

- Info card with `<ShieldAlert>` icon:
  - Title: "Requires team approval"
  - Description: "You don't have permission to place orders. A team admin will need to review and submit this order."
- "Place Order" button — disabled
- "Back to Cart" ghost button still functional

### Storybook Stories

- `Default` — with `place_order` permission
- `NoPermission` — shows approval card, disabled button
- `Submitting` — loading state with spinner

---

## Step 6: `OrderTracking` Component (Right Panel — Post-Submit)

> passes: true

**New file:** `apps/web/components/order/checkout/order-tracking.tsx`
**Story:** `apps/web/components/order/checkout/order-tracking.stories.tsx`

### Props

```typescript
interface OrderTrackingProps {
  orderId: string
  status: 'submitted' | 'confirmed' | 'delivered' | 'cancelled'
  submittedAt: Date | null
  deliveryNotes?: string | null
}
```

### Layout

**Section 1 — Status Timeline:**
A vertical stepper with 3 steps:

1. **Submitted** — `CheckCircle2` icon, timestamp
2. **Confirmed** — `PackageCheck` icon, "Awaiting confirmation" or timestamp
3. **Delivered** — `Truck` icon, "Pending" or timestamp

Visual approach:

- Each step is a row: colored dot + vertical connecting line + label + timestamp
- Completed steps: green dot, solid line, normal text
- Current step: green dot with pulse animation, bold text
- Future steps: gray dot, dashed line, muted text
- Cancelled: red styling with `XCircle` icon

All built with Tailwind — divs with `rounded-full` dots, `border-l-2` connecting lines.

**Section 2 — Delivery Notes:**

- If notes exist, display them in a muted card
- Read-only display of what was entered during checkout

**Section 3 — Delivery Updates:**

- "Delivery Updates" heading
- "Coming soon" placeholder card with `<Truck>` icon
- Description: "Track real-time delivery status and updates from your suppliers"

**Section 4 — Actions:**

- "Request Modification" outline button — disabled, with `<Tooltip>` saying "Coming soon"
- "Duplicate as New Order" outline button — functional, uses existing `order.duplicate` mutation pattern and navigates to the new order

### Storybook Stories

- `Submitted` — first step active
- `Confirmed` — second step active
- `Delivered` — all steps complete, green checkmarks
- `Cancelled` — cancelled state with red styling

---

## Step 7: `CheckoutLayout` Orchestrator Component

> passes: true

**New file:** `apps/web/components/order/checkout/checkout-layout.tsx`
**Story:** `apps/web/components/order/checkout/checkout-layout.stories.tsx`

### Props

```typescript
interface CheckoutLayoutProps {
  orderId: string
  items: CartItemData[]
  subtotal: number
  itemCount: number
  orderStatus: string
  submittedAt: Date | null
  createdAt?: Date
  notes: string | null
  hasPlaceOrderPermission: boolean
  onBack: () => void
}
```

### Internal State Machine

```typescript
type CheckoutPhase =
  | 'form'
  | 'submitting'
  | 'slide-out'
  | 'stamp'
  | 'slide-in'
  | 'tracking'
```

**Initialization logic:**

- If `orderStatus !== 'draft'` → start at `'tracking'` with `isPaid: true`
- If `orderStatus === 'draft'` → start at `'form'`

**Transition sequence after successful submit:**

1. `'form'` → `'submitting'` — user clicks Place Order, mutation fires
2. `'submitting'` → `'slide-out'` — mutation succeeds, right panel begins sliding out
3. After 300ms: `'slide-out'` → `'stamp'` — right panel gone, PAID stamp animates onto invoice
4. After 800ms: `'stamp'` → `'slide-in'` — tracking panel begins sliding in from right
5. After 500ms: `'slide-in'` → `'tracking'` — animation complete, tracking panel fully visible

Implementation uses `useEffect` + `setTimeout` chain with cleanup:

```typescript
useEffect(() => {
  if (phase !== 'slide-out') return
  const t1 = setTimeout(() => setPhase('stamp'), 300)
  const t2 = setTimeout(() => setPhase('slide-in'), 1100)
  const t3 = setTimeout(() => setPhase('tracking'), 1600)
  return () => {
    clearTimeout(t1)
    clearTimeout(t2)
    clearTimeout(t3)
  }
}, [phase])
```

### Animation CSS Classes

**Right panel slide-out** (form disappearing):

```
translate-x-0 opacity-100 → translate-x-full opacity-0
transition-all duration-300 ease-in
```

**Right panel slide-in** (tracking appearing):

```
translate-x-full opacity-0 → translate-x-0 opacity-100
transition-all duration-500 ease-out
```

**PAID stamp**: Uses the `stamp` keyframe from Step 3 via `animate-[stamp_0.5s_ease-out_forwards]`

### Layout Structure

```tsx
<div className="flex min-h-0 flex-1">
  {/* Left panel — Invoice */}
  <div className="flex-[3] border-r">
    <CheckoutInvoice
      orderId={orderId}
      items={items}
      subtotal={subtotal}
      isPaid={phase === 'stamp' || phase === 'slide-in' || phase === 'tracking'}
    />
  </div>

  {/* Right panel — Form or Tracking */}
  <div className="flex-[2] overflow-hidden">
    {(phase === 'form' || phase === 'submitting') && (
      <CheckoutForm ... />
    )}
    {(phase === 'slide-in' || phase === 'tracking') && (
      <OrderTracking ... />
    )}
  </div>
</div>
```

### Uses `useOrderSubmit` Hook

Calls the hook from Step 8 to handle the mutation. On `isSuccess`, triggers the animation sequence.

### Storybook Stories

- `DraftWithPermission` — form view, place order enabled
- `DraftNoPermission` — form view, approval required
- `Submitted` — tracking view with paid stamp
- `Delivered` — tracking view, all steps complete

---

## Step 8: `useOrderSubmit` Hook

> passes: true

**New file:** `apps/web/hooks/use-order-submit.ts`

Thin wrapper around `trpc.order.submit`:

```typescript
export function useOrderSubmit(orderId: string) {
  const utils = trpc.useUtils()

  const mutation = trpc.order.submit.useMutation({
    onSuccess: () => {
      void utils.order.get.invalidate({ orderId })
      void utils.order.list.invalidate()
      void utils.order.getEvents.invalidate({ orderId })
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to submit order')
    },
  })

  const submit = useCallback(
    (deliveryNotes: string) => {
      mutation.mutate({ orderId, deliveryNotes: deliveryNotes || undefined })
    },
    [orderId, mutation],
  )

  return {
    submit,
    isSubmitting: mutation.isPending,
    isSuccess: mutation.isSuccess,
  }
}
```

---

## Step 9: Wire Up `OrderCart` Checkout Button

> passes: false

**File:** `apps/web/components/order/order-cart.tsx`

**Change 1:** Add `onCheckout` to props:

```typescript
interface OrderCartProps {
  cart: CartStateReturn
  onCheckout?: () => void  // NEW
  onOpenProduct?: ...
  ...
}
```

**Change 2:** Wire the existing Checkout button:

```tsx
<Button
  className={onOpenCartTab ? 'flex-1' : 'w-full'}
  disabled={cart.allItems.length === 0}
  onClick={onCheckout} // NEW
>
  Checkout
</Button>
```

**Change 3:** Update the story file to include `onCheckout` in args.

---

## Step 10: Wire Up `OrderPage` — Conditional Rendering

> passes: false

**File:** `apps/web/app/(app)/order/[orderId]/page.tsx`

This is the main integration point. Changes:

**1. Add checkout state:**

```typescript
const [checkoutMode, setCheckoutMode] = useState(false)
```

**2. Auto-enter checkout for non-draft orders:**

```typescript
useEffect(() => {
  if (cart.isLoading) return
  const order = cart.orderData?.order // from the order.get query
  if (order && order.status !== 'draft') {
    setCheckoutMode(true)
  }
}, [cart.isLoading, cart.orderData?.order?.status])
```

Note: `useOrderCart` currently doesn't expose `orderData` directly — we'll need to either:

- Expose `orderQuery.data` from the hook (minimal change), OR
- Use a separate `trpc.order.get.useQuery({ orderId })` in the page (already called inside useOrderCart, would be deduplicated by tRPC)

Recommended: Add `orderData` to the return of `useOrderCart`.

**3. Conditional rendering in the body:**

```tsx
{
  checkoutMode ? (
    <CheckoutLayout
      orderId={orderId}
      items={cart.allItems}
      subtotal={cart.subtotal}
      itemCount={cart.itemCount}
      orderStatus={orderData?.order.status ?? 'draft'}
      submittedAt={orderData?.order.submittedAt ?? null}
      createdAt={orderData?.order.createdAt}
      notes={orderData?.order.notes ?? null}
      hasPlaceOrderPermission={
        activeOrg?.permissions?.includes('place_order') ?? false
      }
      onBack={() => setCheckoutMode(false)}
    />
  ) : (
    <div className="flex min-h-0 flex-1 flex-col md:flex-row">
      {/* existing 3-panel layout unchanged */}
    </div>
  )
}
```

**4. Pass `onCheckout` to `OrderCart`:**

```tsx
<OrderCart
  ref={cartRef}
  cart={cart}
  onCheckout={() => setCheckoutMode(true)}  // NEW
  onOpenProduct={handleOpenProduct}
  ...
/>
```

**5. Header adjustments in checkout mode:**

- Hide `PanelToggleBar` when in checkout mode (panels aren't relevant)
- For draft orders in checkout mode: show a "Back to Cart" button in the header
- For non-draft orders: show a "Back to Orders" link instead (navigates to `/orgs/${orgId}/orders`)

---

## Files Summary

### Modified Files

| File                                               | Change                                                                 |
| -------------------------------------------------- | ---------------------------------------------------------------------- |
| `packages/api/src/lib/verify-access.ts`            | Add `hasPermission()` function                                         |
| `packages/api/src/lib/audit.ts`                    | Add `'order.submitted'` to `AuditAction` union                         |
| `packages/api/src/routers/order.ts`                | Add `submit` procedure                                                 |
| `apps/web/app/globals.css`                         | Add `@keyframes stamp` animation                                       |
| `apps/web/components/order/order-cart.tsx`         | Add `onCheckout` prop, wire button                                     |
| `apps/web/components/order/order-cart.stories.tsx` | Add `onCheckout` to story args                                         |
| `apps/web/hooks/use-order-cart.ts`                 | Expose `orderData` in return value                                     |
| `apps/web/app/(app)/order/[orderId]/page.tsx`      | Add `checkoutMode` state, conditional rendering, auto-detect non-draft |

### New Files

| File                                                              | Purpose                                            |
| ----------------------------------------------------------------- | -------------------------------------------------- |
| `apps/web/components/order/checkout/checkout-invoice.tsx`         | Invoice display with PAID stamp                    |
| `apps/web/components/order/checkout/checkout-invoice.stories.tsx` | Stories                                            |
| `apps/web/components/order/checkout/checkout-form.tsx`            | Delivery notes, payment placeholder, submit button |
| `apps/web/components/order/checkout/checkout-form.stories.tsx`    | Stories                                            |
| `apps/web/components/order/checkout/order-tracking.tsx`           | Status timeline, delivery tracking placeholder     |
| `apps/web/components/order/checkout/order-tracking.stories.tsx`   | Stories                                            |
| `apps/web/components/order/checkout/checkout-layout.tsx`          | Orchestrator with animation state machine          |
| `apps/web/components/order/checkout/checkout-layout.stories.tsx`  | Stories                                            |
| `apps/web/hooks/use-order-submit.ts`                              | Submit mutation hook                               |

---

## Verification

1. `bun run fix && bun run knip:fix`
2. `bun run ci` (typecheck, lint, knip, build)
3. Manual testing at `http://localhost:3000/`:
   - Create an order, add items, click Checkout → see 2-panel layout with invoice on left, form on right
   - Fill in delivery notes, click Place Order → watch right panel slide out, PAID stamp animate onto invoice, tracking panel slide in
   - Navigate to orders list → click the submitted order → see checkout view with tracking directly (not the shopping view)
   - Test with a user role that lacks `place_order` → see "Requires team approval" card with disabled Place Order button
   - Test "Back to Cart" from checkout form → returns to shopping view
   - Test "Duplicate as New Order" from tracking view → creates new draft and navigates to it
4. Storybook: verify all 8 new story files render correctly
