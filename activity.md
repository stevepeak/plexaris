# Activity Log

## 2026-02-23 — Steps 1 & 2: Backend Permission Helper + Order Submit Mutation

- Added `hasPermission()` function to `packages/api/src/lib/verify-access.ts` — checks if a user's role includes a specific permission string, with superAdmin bypass
- Added `'order.submitted'` to the `AuditAction` type union in `packages/api/src/lib/audit.ts`
- Added `order.submit` mutation to `packages/api/src/routers/order.ts` — validates membership, `place_order` permission, draft status, and item count before transitioning order to `submitted` status with audit logging
- All CI checks pass (typecheck, lint, knip, build)
- Screenshot: `screenshots/step1-backend-permission-helper.png`

## 2026-02-23 — Step 3: CSS Stamp Animation Keyframe

- Added `@keyframes stamp` animation to `apps/web/app/globals.css` inside the `@theme inline` block
- Animation: starts large (scale 2.5) and invisible, slams down to 0.9, bounces to 1.05, settles at 1.0 — all at -12deg rotation for a hand-stamped look
- Registered `--animate-stamp` CSS variable for Tailwind usage (`animate-stamp`)
- CI passes (typecheck, lint, knip, build)
- Screenshot: `screenshots/step3-stamp-animation-keyframe.png`

## 2026-02-23 — Step 4: CheckoutInvoice Component (Left Panel)

- Created `apps/web/components/order/checkout/checkout-invoice.tsx` — invoice display with header (INVOICE title, short order ID, date), line items table (item name, qty, unit price, line total), subtotal footer, and PAID stamp overlay with `animate-stamp` animation
- Background: subtle gradient with grid pattern overlay for a paper feel
- PAID stamp: absolutely positioned, red border/text, -12deg rotation, animated via the `stamp` keyframe from Step 3, shown when `isPaid` is true
- Created `apps/web/components/order/checkout/checkout-invoice.stories.tsx` with 4 stories: Default, Paid, SingleItem, ManyItems
- CI passes (typecheck, lint, knip, build)
- Screenshot: `screenshots/step4-checkout-invoice.png`

## 2026-02-23 — Step 5: CheckoutForm Component (Right Panel — Pre-Submit)

- Created `apps/web/components/order/checkout/checkout-form.tsx` — checkout form with delivery notes textarea, "Expected Delivery" and "Payment Method" coming-soon placeholder cards, order summary (item count + subtotal), and permission-gated "Place Order" button
- When `hasPlaceOrderPermission` is false: shows amber warning card ("Requires team approval") and disables Place Order button
- When `isSubmitting` is true: shows spinner on Place Order button and disables Back to Cart
- Created `apps/web/components/order/checkout/checkout-form.stories.tsx` with 3 stories: Default, NoPermission, Submitting
- CI passes (typecheck, lint, knip, build)
- Screenshot: `screenshots/step5-checkout-form.png`

## 2026-02-23 — Step 6: OrderTracking Component (Right Panel — Post-Submit)

- Created `apps/web/components/order/checkout/order-tracking.tsx` — post-submit tracking panel with vertical status timeline (Submitted → Confirmed → Delivered), delivery notes display, delivery updates placeholder, and action buttons
- Timeline: 3-step vertical stepper with colored dots, connecting lines (solid for completed, dashed for future), and pulse animation on current step. Cancelled state shows red alert card with XCircle icon
- Actions: "Request Modification" button (disabled with tooltip "Coming soon") and "Duplicate as New Order" button (functional, accepts onDuplicate callback)
- Created `apps/web/components/order/checkout/order-tracking.stories.tsx` with 4 stories: Submitted, Confirmed, Delivered, Cancelled
- CI passes (typecheck, lint, knip, build)
- Screenshot: `screenshots/step6-order-tracking.png`
