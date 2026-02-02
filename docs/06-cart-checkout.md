# 06 - Cart & Checkout

> **Phase:** 6
> **Dependencies:** 01-authentication, 04-product-catalog
> **User Stories:** US-014, US-015, US-016, US-017

---

## Overview

The cart and checkout flow is the revenue-generating core of the platform. Horeca users add products to a persistent cart, review their order, and pay via Stripe. Orders are placed to Plexaris as a single transaction even when items come from multiple suppliers. The 3% supplier fee is calculated at checkout. For MVP, order fulfillment is coordinated manually by the Plexaris team.

## User Stories

### US-014: Shopping Cart

> As a Horeca user, I want to add products to my cart so I can order multiple items.

**Acceptance Criteria:**

- Add to cart from search results and AI chat
- Cart icon shows item count (visible globally)
- View cart with all items, quantities, prices
- Edit quantities and remove items
- Cart persists across sessions (database-backed for logged-in users)
- Items grouped by supplier in cart view
- Show subtotal per supplier and grand total

---

### US-015: Checkout & Order Placement

> As a Horeca user, I want to checkout so I can place my order.

**Acceptance Criteria:**

- Review order summary before payment (items, quantities, prices, totals)
- Confirm delivery address (pre-filled from profile, editable)
- Single order to Plexaris (even if multiple suppliers)
- Order created with status `pending_payment`
- Order confirmation shown after successful payment

---

### US-016: Stripe Payment Integration

> As a Horeca user, I want to pay via Stripe so my order is confirmed.

**Acceptance Criteria:**

- Stripe Checkout session created for the order
- Redirect to Stripe payment page
- Successful payment: order status changes to `paid`
- Failed payment: show error, order remains `pending_payment`
- 3% fee calculated and recorded for supplier billing
- Webhook handler for payment confirmation (don't rely solely on redirect)

---

### US-017: Order Confirmation Emails

> As a Horeca user, I want to receive an order confirmation email.

**Acceptance Criteria:**

- Email sent to Horeca user after successful payment
- Email contains: order number, items, quantities, prices, total
- Email contains: delivery address
- Email sent to Plexaris admin team for manual supplier coordination (MVP)

---

## Technical Considerations

- **Cart storage:** Database-backed cart for logged-in users, keyed by user ID
- **Stripe integration:** Stripe Checkout (hosted payment page) for MVP simplicity; Stripe Connect for marketplace fee splitting in future
- **Fee model:** 3% calculated on supplier subtotals, recorded in order for billing
- **Webhooks:** Stripe webhook endpoint to handle `checkout.session.completed` events
- **Order model:** Order has many OrderItems, each linked to a product and supplier
- **Order statuses:** `pending_payment` -> `paid` -> `processing` -> `delivered`
- **Email service:** Transactional email via Resend, SendGrid, or similar
- **Idempotency:** Handle duplicate webhook events and prevent double-processing
