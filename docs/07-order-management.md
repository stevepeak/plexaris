# 07 - Order Management & Reordering

> **Phase:** 7
> **Dependencies:** 06-cart-checkout (needs completed orders)
> **User Stories:** US-018, US-019

---

## Overview

Once Horeca users are placing orders, they need visibility into their order history and a fast way to reorder. This phase builds the order history dashboard and frequently-ordered-products widget, which also feeds data into the AI suggestions system (US-013 in phase 05).

## User Stories

### US-018: Order History Dashboard

> As a Horeca user, I want to see my past orders so I can track purchases and reorder easily.

**Acceptance Criteria:**

- List of all past orders showing: date, total, status
- Click order to see full details (items, quantities, prices, supplier)
- Order statuses displayed: pending, paid, processing, delivered
- Search/filter orders by date range
- **Quick "Reorder" button** to add all items from a past order to cart
- Pagination for users with many orders

---

### US-019: Frequently Ordered Products

> As a Horeca user, I want to see my frequently ordered products for quick access.

**Acceptance Criteria:**

- Dashboard widget showing top 10 most ordered products
- One-click add to cart for each product
- Shows last order date and usual quantity
- Data feeds into AI suggestion engine (US-013)

---

## Technical Considerations

- **Order history query:** Ordered by date descending, with pagination
- **Reorder logic:** Copy all items from a past order into current cart; handle cases where products have been archived or prices changed (show notice to user)
- **Frequency calculation:** Count product occurrences across all orders, weighted by recency
- **Price change handling:** When reordering, use current product prices, not historical prices; notify user if prices differ from their last order
- **Dashboard placement:** Frequently ordered products widget on the Horeca home/dashboard page
