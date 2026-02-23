# Launch Readiness Plan

Comprehensive review of the codebase ahead of customer launch. Findings organized by priority with specific file locations and recommended fixes.

---

## P0 — Launch Blockers

### 1. Order Submission Flow is Missing

The core business flow is incomplete. Orders can be created and items managed, but there is no way to submit an order to a supplier or for a supplier to confirm/cancel it.

**Current state:**

- `packages/db/src/order-schema.ts:30-35` — Event types `order_submitted`, `order_confirmed`, `order_cancelled` are defined but never used
- `packages/db/src/org-schema.ts:17` — `place_order` permission exists and is assignable to roles
- `packages/api/src/routers/order.ts` — No `submit()`, `confirm()`, or `cancel()` mutations exist
- `apps/web/components/order/activity-log.tsx` — Renders `order_submitted` event but it is never triggered

**What needs to happen:**

- Add `order.submit` tRPC mutation that:
  - Checks `place_order` permission
  - Validates the order has items
  - Creates `order_submitted` event
  - Updates order status
- Add `order.confirm` and `order.cancel` mutations for suppliers
- Add `order.updateNotes` mutation (event type `note_updated` is defined but unused)
- Add UI for submitting orders and for suppliers to act on received orders
- Add notification triggers for submitted/confirmed/cancelled events

---

### 2. No Rate Limiting

Zero rate limiting on any endpoint. Auth brute-force, data scraping, and abuse are all possible.

**Affected endpoints (highest risk first):**

- `/api/auth/[...all]` — Login, password reset, signup
- `/api/claim/[token]` — Token claiming
- `/api/invitations/[id]/accept` — Invitation acceptance
- `/api/products/browse` — Public product enumeration
- `/api/suppliers/browse` — Public supplier enumeration
- All tRPC endpoints via `/api/trpc`

**What needs to happen:**

- Add rate limiting middleware (e.g. `@unkey/ratelimit`, Vercel's built-in, or Upstash `@upstash/ratelimit`)
- Auth endpoints: 5 attempts per 15 minutes per IP
- Public browse endpoints: 100 requests per minute per IP
- Authenticated API endpoints: 60 requests per minute per user

---

---

### 5. No Database Transactions

Multi-step mutations are not wrapped in transactions. If any step fails, data is left in an inconsistent state.

**Affected operations:**

| Operation           | File                                             | Steps                                               | Risk                                         |
| ------------------- | ------------------------------------------------ | --------------------------------------------------- | -------------------------------------------- |
| Duplicate order     | `packages/api/src/routers/order.ts:358-416`      | Insert order + insert N items                       | Orphaned order with no items                 |
| Accept suggestion   | `packages/api/src/routers/suggestion.ts:154-431` | Insert version + update product + update suggestion | Product updated but suggestion still pending |
| Create organization | `apps/web/app/api/organizations/route.ts:51-98`  | Insert org + insert roles + insert membership       | Org exists without admin                     |
| Product versioning  | `packages/api/src/routers/suggestion.ts:350-381` | SELECT MAX(version) + INSERT                        | Race condition: duplicate version numbers    |

**What needs to happen:**

- Wrap each multi-step mutation in `db.transaction(async (tx) => { ... })`
- For product versioning, use `FOR UPDATE` locking or database sequences to prevent race conditions
- Verify all transaction operations use the `tx` object, not the outer `db`

---

### 6. Missing Permission Checks in tRPC Order Router

HTTP API routes properly check permissions, but tRPC procedures only verify membership. Any org member can create, edit, and manage orders regardless of their role permissions.

**Current state in `packages/api/src/routers/order.ts`:**

- `verifyMembership()` (lines 8-30) only checks the user is a member of the org
- `order.create` — No `create_order` permission check
- `order.addItem`, `order.removeItem`, `order.updateQuantity`, `order.updateSupplier` — No `edit_order` permission check
- `order.archive`, `order.duplicate` — No permission check at all

**Contrast with HTTP API routes** which properly use `checkPermission()`:

- `POST /api/products` checks `manage_products`
- `PATCH /api/organizations/[id]` checks `edit_org_details`
- `POST /api/invitations` checks `invite_members`

**What needs to happen:**

- Replace `verifyMembership()` with a version that also accepts a required permission
- Check `create_order` on `order.create`
- Check `edit_order` on `order.addItem`, `order.removeItem`, `order.updateQuantity`, `order.updateSupplier`
- Decide and document what permission is needed for `order.archive` and `order.duplicate`

---

## P1 — High Priority (Before Scaling)

### 7. Incomplete Tenant Isolation

Several queries do not fully verify data belongs to the requesting user's organization.

**Specific gaps:**

- `packages/api/src/routers/suggestion.ts:157` — `suggestion.accept()` looks up `product.id` without verifying it belongs to the same org as the suggestion:
  ```ts
  // Current
  const draft = await ctx.db.query.product.findFirst({
    where: eq(schema.product.id, s.targetId),
  })
  // Should be
  where: and(
    eq(schema.product.id, s.targetId),
    eq(schema.product.organizationId, s.organizationId),
  )
  ```
- `apps/web/app/api/products/route.ts:100-136` — GET does not verify the user is a member of the product's organization before returning data
- File access has no organization-level filtering — guessing a file UUID could expose another org's files

**What needs to happen:**

- Audit every database query that accepts an ID parameter and verify org-level scoping
- Add `organizationId` check to product GET endpoint
- Add org-level filtering to file access endpoints

---

---

---

### 10. Input Validation Gaps

Several REST API endpoints accept request bodies without Zod schema validation.

**Unvalidated endpoints:**

| Endpoint                        | File                                                 | Issue                                                           |
| ------------------------------- | ---------------------------------------------------- | --------------------------------------------------------------- |
| `POST /api/invitations`         | `apps/web/app/api/invitations/route.ts:23-31`        | Email, orgId, roleId taken from `request.json()` without schema |
| `PATCH /api/organizations/[id]` | `apps/web/app/api/organizations/[id]/route.ts:76-86` | Accepts arbitrary fields without validation                     |
| `POST /api/products`            | `apps/web/app/api/products/route.ts:63`              | `images` array stored without type validation                   |
| `PATCH /api/products/[id]`      | Various fields                                       | `targetType` typecast without enum validation                   |

**What needs to happen:**

- Define Zod schemas for every POST/PATCH request body
- Parse request bodies through schemas before processing
- Return 400 with clear validation error messages

ALL endpoints must use ZOD. make sure this is a rule updated in the .claude/rules too.
find all the endpionts and apply ZOD schema to them

---

---

---

## P2 — Medium Priority (Post-Launch Improvements)

---

### 14. Background Job Error Visibility

Trigger.dev tasks store `status: 'failed'` but not the error message. Users cannot see why a task failed.

**Affected files:**

- `apps/trigger/src/tasks/scrape-product.ts:99-109` — Catches error, sets status to failed, discards message
- `apps/trigger/src/tasks/discover-products.ts:111-123` — Same issue

**What needs to happen:**

- Add an `errorMessage` column to the `trigger_run` table (or use existing JSONB field)
- Store `error.message` when catching task failures
- Display error messages in the agent runs UI

---

### 16. Missing Cascading Deletes

All foreign keys use `ON DELETE no action`. Deleting records leaves orphaned data.

**What needs to happen:**

- Add `ON DELETE CASCADE` to child tables where appropriate (session, account, passkey → user)
- Add `ON DELETE SET NULL` where references should be preserved (orderEvent.actorId → user)
- Or implement application-level cleanup in delete/archive operations

---

---

---

### 19. Claim Token Leaks Organization Details

`GET /api/claim/[token]` is a public endpoint that reveals organization name, type, email, phone, and address to anyone with the token URL.

**File:** `apps/web/app/api/claim/[token]/route.ts:13-67`

**What needs to happen:**

- Reduce the data returned in the GET preview (only show org name, not full contact details)
- Consider requiring POST with token in body instead of GET with token in URL (URLs are logged in browser history, server logs, and referrer headers)

---

### 20. Responsive Grid Issue

`apps/web/components/product-list.tsx:133` uses `grid grid-cols-3` without responsive breakpoints. This renders 3 columns on mobile phones.

**What needs to happen:**

- Change to `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3` or similar responsive pattern

---

## P3 — Low Priority (Quality of Life)

---

### 22. TypeScript Strictness Inconsistency

`config/tsconfig/bun.json:10` has `noImplicitAny: false` while the web app uses `strict: true`. Backend packages allow implicit `any`.

**What needs to happen:**

- Set `noImplicitAny: true` in `config/tsconfig/bun.json`
- Fix resulting type errors in backend packages

---

---

### 24. Accessibility Gaps

- Icon-only buttons lack `aria-label` attributes (rely on tooltips which are not accessible)
- Table rows use `onClick` without ARIA `role="button"` (`product-list.tsx:254-263`)
- No skip-to-content links
- Only ~31 aria attributes across the entire components directory

---

---

### 26. Missing `updatedAt` on Some Tables

| Table        | File                                       | Has `updatedAt`? |
| ------------ | ------------------------------------------ | ---------------- |
| `claimToken` | `packages/db/src/org-schema.ts:99-109`     | No               |
| `invitation` | `packages/db/src/org-schema.ts:111-128`    | No               |
| `favorite`   | `packages/db/src/favorite-schema.ts:11-25` | No               |

---

## Feature Completeness Summary

| Area                          | Status                     | Completeness |
| ----------------------------- | -------------------------- | ------------ |
| Authentication & signup       | Working                    | 85%          |
| Team management & permissions | Working                    | 90%          |
| Product management            | Working                    | 95%          |
| Order management              | Incomplete — cannot submit | 60%          |
| AI agents & automations       | Partially working          | 70%          |
| Billing & subscriptions       | Not started                | 0%           |
| Monitoring & observability    | Installed, not wired up    | 20%          |
| Test coverage                 | Not started                | 0%           |
