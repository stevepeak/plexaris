# 08 - Admin Dashboard & Operations

> **Phase:** 8
> **Dependencies:** 01-authentication, 06-cart-checkout
> **User Stories:** US-021, US-024

---

## Overview

The admin dashboard gives the Plexaris team operational control over the marketplace. In the MVP, the most critical admin function is receiving order notifications with full details so they can manually coordinate delivery between suppliers and Horeca buyers. It also includes account management for both user types.

## User Stories

### US-021: Admin Order Notification for Manual Logistics

> As an admin, I want to receive an email with complete order details after payment so I can arrange logistics manually.

**Acceptance Criteria:**

- Email sent to admin email address after successful payment
- Email contains complete order details: items, quantities, prices, total
- Email contains full Horeca info: business name, contact, delivery address, phone
- Email contains full Supplier info: company name, contact, email, phone (for each supplier in the order)
- Clear formatting for easy manual coordination
- Sent immediately after payment confirmation

**Notes:** This is the MVP logistics approach. Plexaris team manually contacts suppliers to arrange delivery. Automated supplier order routing is a Phase 2 feature.

---

### US-024: Admin Account Management

> As an admin, I want to manage Horeca and Supplier accounts on the platform.

**Acceptance Criteria:**

- Admin dashboard with list of all Horeca accounts
- Admin dashboard with list of all Supplier accounts
- Search and filter accounts
- Delete option for each account (soft delete)
- Confirmation prompt before deletion
- Audit log of admin actions (who did what, when)

---

## Technical Considerations

- **Admin access:** Separate admin role, protected routes; initial admin accounts created via seed/migration
- **Order notification email:** Triggered by the same Stripe webhook that confirms payment (shared with US-017 confirmation email)
- **Email formatting:** Clear sections for order details, buyer info, and per-supplier info so the admin can forward relevant parts to each supplier
- **Audit log:** Simple append-only table recording admin actions (action type, target, timestamp, admin user)
- **Account list:** Paginated, searchable, with status indicators (active, claimed, unclaimed, deleted)
- **Future:** This dashboard will expand to include order management, analytics, supplier onboarding tools, and automated routing controls in Phase 2
