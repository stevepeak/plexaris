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

### 3. Unauthenticated Product Endpoint

`GET /api/products/[id]` has no authentication check and returns full product details including `organizationId` to any caller.

**File:** `apps/web/app/api/products/[id]/route.ts:10-63`

**Impact:** Anyone can enumerate product IDs and retrieve complete product information, pricing, and organizational data without logging in.

**What needs to happen:**

- Add session authentication check at the start of the GET handler
- Verify the requesting user is a member of the product's organization (or the product is explicitly public)

---

### 4. Cross-Organization Data Leak in Favorites

`GET /api/favorites` accepts an `organizationId` query parameter without verifying the requesting user is a member of that organization.

**File:** `apps/web/app/api/favorites/route.ts:70-102`

**Impact:** Any authenticated user can request the favorites list for any organization, revealing what products and suppliers other organizations have bookmarked.

**What needs to happen:**

- Add membership verification before querying favorites: confirm the authenticated user belongs to the requested `organizationId`

---

### 5. No Database Transactions

Multi-step mutations are not wrapped in transactions. If any step fails, data is left in an inconsistent state.

**Affected operations:**

| Operation                  | File                                                 | Steps                                                                       | Risk                                      |
| -------------------------- | ---------------------------------------------------- | --------------------------------------------------------------------------- | ----------------------------------------- |
| Duplicate order            | `packages/api/src/routers/order.ts:431-506`          | Insert order + insert N items + log event + audit                           | Orphaned order with no items              |
| Accept suggestion (create) | `packages/api/src/routers/suggestion.ts:313-365`     | Insert product + insert version + update product + update suggestion        | Product without currentVersionId          |
| Accept suggestion (update) | `packages/api/src/routers/suggestion.ts:383-428`     | Update product + get max version + insert version + update currentVersionId | Inconsistent version chain                |
| Create organization        | `apps/web/app/api/organizations/route.ts:51-98`      | Insert org + insert roles + insert membership                               | Org exists without admin                  |
| Create agent schedule      | `packages/api/src/routers/agent-schedule.ts:155-186` | Create Trigger.dev schedule + insert DB record + audit                      | Orphaned Trigger.dev schedule             |
| Product versioning         | `packages/api/src/routers/suggestion.ts:397-424`     | SELECT MAX(version) + INSERT                                                | Race condition: duplicate version numbers |

**What needs to happen:**

- Wrap each multi-step mutation in `db.transaction(async (tx) => { ... })`
- For product versioning, use `FOR UPDATE` locking or database sequences to prevent race conditions
- Verify all transaction operations use the `tx` object, not the outer `db`

---

### 6. Missing Granular Permission Checks in tRPC Routers

All tRPC procedures verify organization membership via `verifyAccess()`, but none check granular permissions (`create_order`, `edit_order`, etc.). Any org member can perform any action regardless of their assigned role permissions.

**Current state in `packages/api/src/routers/order.ts`:**

- `order.create` — No `create_order` permission check
- `order.addItem`, `order.removeItem`, `order.updateQuantity`, `order.updateSupplier` — No `edit_order` permission check
- `order.archive`, `order.duplicate` — No specific permission check

**Contrast with HTTP API routes** which properly use `checkPermission()`:

- `POST /api/products` checks `manage_products`
- `PATCH /api/organizations/[id]` checks `edit_org_details`
- `POST /api/invitations` checks `invite_members`

**What needs to happen:**

- Extend `verifyAccess()` to accept a required permission parameter
- Check `create_order` on `order.create`
- Check `edit_order` on `order.addItem`, `order.removeItem`, `order.updateQuantity`, `order.updateSupplier`
- Decide and document what permission is needed for `order.archive` and `order.duplicate`

---

### 7. Products List Missing Authorization

`GET /api/products?organizationId=` checks that the organization exists but does **not** verify the requesting user is a member.

**File:** `apps/web/app/api/products/route.ts:100-136`

**Impact:** Any authenticated user can list all products for any organization by supplying an arbitrary `organizationId`.

**What needs to happen:**

- Add membership check before returning products: verify the authenticated user belongs to the requested organization

---

## P1 — High Priority (Before Scaling)

### 8. Incomplete Tenant Isolation

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
- `apps/web/app/api/products/[id]/versions/route.ts:7-20` — GET has no authentication at all; anyone can view version history for any product
- File access has no organization-level filtering — guessing a file UUID could expose another org's files

**What needs to happen:**

- Audit every database query that accepts an ID parameter and verify org-level scoping
- Add auth + `organizationId` check to product versions endpoint
- Add org-level filtering to file access endpoints

---

### 9. Input Validation Gaps

Multiple REST API endpoints accept request bodies without Zod schema validation, and tRPC schemas lack string length constraints.

**Unvalidated REST endpoints:**

| Endpoint                             | File                                                       | Issue                                                                                       |
| ------------------------------------ | ---------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| `POST /api/invitations`              | `apps/web/app/api/invitations/route.ts:23-31`              | Email, orgId, roleId taken from `request.json()` without schema; no email format validation |
| `POST /api/favorites`                | `apps/web/app/api/favorites/route.ts:18-22`                | Body destructured without any validation                                                    |
| `PATCH /api/organizations/[id]`      | `apps/web/app/api/organizations/[id]/route.ts:76-86`       | Accepts arbitrary fields; name has no max length                                            |
| `POST /api/organizations`            | `apps/web/app/api/organizations/route.ts:22-49`            | Name only checks non-empty; no email/phone/URL format validation                            |
| `POST /api/products`                 | `apps/web/app/api/products/route.ts:63`                    | `images` array stored without type validation; price has loose conversion                   |
| `PATCH /api/products/[id]`           | Various fields                                             | `targetType` typecast without enum validation                                               |
| `POST /api/organizations/[id]/roles` | `apps/web/app/api/organizations/[id]/roles/route.ts:64-86` | Name has no max length                                                                      |

**tRPC schemas missing constraints:**

| Procedure                         | File                                                 | Issue                                                                      |
| --------------------------------- | ---------------------------------------------------- | -------------------------------------------------------------------------- |
| `admin.listOrganizations`         | `packages/api/src/routers/admin.ts:12`               | `search` string has no length limit                                        |
| `triggerRun.getPublicAccessToken` | `packages/api/src/routers/trigger-run.ts:73`         | `triggerRunId: z.string()` accepts any string; should validate UUID format |
| `order.updateQuantity`            | `packages/api/src/routers/order.ts:312`              | `.positive()` allows very large numbers; no upper bound                    |
| `agentSchedule.create`            | `packages/api/src/routers/agent-schedule.ts:107-115` | URLs not validated with `.url()`; no max length on name                    |

**What needs to happen:**

- Define Zod schemas for every POST/PATCH request body
- Parse request bodies through schemas before processing
- Add `.max()` length constraints to all `z.string()` fields in tRPC
- Return 400 with clear validation error messages

---

### 11. Invitation Token Exposed in List Response

`GET /api/invitations?organizationId=` returns the `token` field in the invitation list response.

**File:** `apps/web/app/api/invitations/route.ts:110`

**Impact:** Anyone with org member access can see invitation tokens and share/use them outside the intended email flow.

**What needs to happen:**

- Only return the token on creation (POST response), not on list queries
- Strip `token` from GET responses

---

### 13. Forms Missing Disabled State and Feedback

Multiple forms allow double-submission and lack consistent success/error feedback.

**Affected forms:**

| Component      | File                                                        | Issue                                                           |
| -------------- | ----------------------------------------------------------- | --------------------------------------------------------------- |
| Invite members | `apps/web/components/invite-members.tsx:82-93`              | No disabled state during submission; no success toast           |
| Product form   | `apps/web/components/product-form/product-form.tsx:176-195` | No client-side validation for required fields before submission |
| Profile form   | `apps/web/app/(app)/settings/profile/page.tsx:155-167`      | Some handlers don't disable form during submission              |

**What needs to happen:**

- Add `disabled={isPending}` to all submit buttons during form submission
- Show toast notifications for both success and error states on all forms
- Add client-side validation before submission where applicable

---

## P2 — Medium Priority (Post-Launch Improvements)

---

### 16. Background Job Error Visibility

Trigger.dev tasks store `status: 'failed'` but not the error message. Users cannot see why a task failed.

**Affected files:**

- `apps/trigger/src/tasks/scrape-product.ts:99-109` — Catches error, sets status to failed, discards message
- `apps/trigger/src/tasks/discover-products.ts:111-123` — Same issue

**What needs to happen:**

- Add an `errorMessage` column to the `trigger_run` table (or use existing JSONB field)
- Store `error.message` when catching task failures
- Display error messages in the agent runs UI

---

### 17. Missing Cascading Deletes

All foreign keys use `ON DELETE no action`. Deleting records leaves orphaned data.

**Highest risk areas:**

- `orderItem.productId` → `product.id` — Deleting a product leaves orphaned order items
- `session`, `account`, `passkey` → `user.id` — Archiving a user leaves active sessions
- Organization deletion leaves products, orders, memberships, roles, audit logs

**Current workaround:** Code uses soft deletes (archiving) in some places (`apps/web/app/api/organizations/[id]/archive/route.ts:42-55`) but this is not consistent or enforced at the DB level.

**What needs to happen:**

- Add `ON DELETE CASCADE` to child tables where appropriate (session, account, passkey → user)
- Add `ON DELETE SET NULL` where references should be preserved (orderEvent.actorId → user)
- Standardize on soft delete vs hard delete per entity type and document the policy

---

### 19. Agent Schedule URLs Lack Validation (SSRF Risk)

`agentSchedule.create` accepts URLs without format validation. Malicious URLs (`file://`, `data://`, internal IPs) could trigger SSRF if the agent fetches them.

**File:** `packages/api/src/routers/agent-schedule.ts:115`

```ts
urls: z.array(z.string().min(1)).default([])
```

**What needs to happen:**

- Validate with `z.string().url()` and restrict to `https://` protocol
- Consider a URL allowlist or blocklist for internal network ranges

---

---

### 21. Claim Token Leaks Organization Details

`GET /api/claim/[token]` is a public endpoint that reveals organization name, type, email, phone, and address to anyone with the token URL.

**File:** `apps/web/app/api/claim/[token]/route.ts:13-67`

**What needs to happen:**

- Reduce the data returned in the GET preview (only show org name, not full contact details)
- Consider requiring POST with token in body instead of GET with token in URL (URLs are logged in browser history, server logs, and referrer headers)

---

### 22. Missing Suspense Boundaries

Most pages use client-side data fetching with manual state management. Only auth pages use Suspense boundaries.

**Impact:** No streaming/progressive rendering; users see nothing or broken layouts until all data loads.

**What needs to happen:**

- Add Suspense boundaries around data-fetching components
- Consider converting key pages to server components with streaming where appropriate

---

### 23. Race Condition in Product Duplicate Check

The article number duplicate check uses separate SELECT then INSERT without transaction locking.

**File:** `packages/api/src/routers/suggestion.ts:260-292`

**Risk:** Two concurrent requests can both pass the duplicate check and insert products with the same article number.

**What needs to happen:**

- Add a composite unique constraint on `(organizationId, data->>'articleNumber')` at the database level
- Use `ON CONFLICT` in INSERT statement as a safety net
- Wrap in transaction (overlaps with item 5)

---

## P3 — Low Priority (Quality of Life)

### 24. Accessibility Gaps

- Icon-only buttons lack `aria-label` attributes (`product-list.tsx:447-459` — print and view toggle buttons)
- Clickable Cards and TableRows use `onClick` without `role="button"` or keyboard accessibility (`product-list.tsx:143-147, 254-262`)
- No skip-to-content links
- Search input in product list has placeholder but no visible label (`product-list.tsx:475`)
- Only ~31 ARIA attributes and ~12 role attributes across 100+ components

**What needs to happen:**

- Add `aria-label` to all icon-only buttons
- Convert clickable Cards/TableRows to use semantic elements (`<button>` or `<Link>`)
- Add skip-to-content links to main layout

---

### 25. TypeScript Strictness Inconsistency

`config/tsconfig/bun.json:10` has `noImplicitAny: false` while the web app uses `strict: true`. Backend packages allow implicit `any`.

Additionally, ESLint disables unsafe type rules globally:

```js
// eslint.config.js:41-42
'@typescript-eslint/no-unsafe-assignment': 'off',
'@typescript-eslint/no-unsafe-call': 'off',
```

**What needs to happen:**

- Set `noImplicitAny: true` in `config/tsconfig/bun.json`
- Re-enable ESLint unsafe type rules (or scope the overrides to specific files that need them)
- Fix resulting type errors in backend packages

---

### 26. Missing `updatedAt` on Some Tables

| Table            | File                                       | Has `updatedAt`? |
| ---------------- | ------------------------------------------ | ---------------- |
| `claimToken`     | `packages/db/src/org-schema.ts:99-109`     | No               |
| `invitation`     | `packages/db/src/org-schema.ts:111-128`    | No               |
| `favorite`       | `packages/db/src/favorite-schema.ts:11-25` | No               |
| `productVersion` | `packages/db/src/product-schema.ts:44-65`  | No               |
| `file`           | `packages/db/src/file-schema.ts:5-19`      | No               |

---

### 27. Missing NOT NULL Constraints

Several columns should have NOT NULL constraints but don't:

| Column                      | Table        | File                                         | Issue                                                |
| --------------------------- | ------------ | -------------------------------------------- | ---------------------------------------------------- |
| `currentVersionId`          | `product`    | `packages/db/src/product-schema.ts:22`       | Should be NOT NULL for active products               |
| `createdBy`                 | `triggerRun` | `packages/db/src/trigger-run-schema.ts:16`   | Nullable but needed for audit trail                  |
| `reviewedBy` / `reviewedAt` | `suggestion` | `packages/db/src/suggestion-schema.ts:50-51` | Should be both null or both non-null (no constraint) |

---

### 28. Env Variable Validation Bypassed in Some Packages

- `packages/db/src/index.ts:52` uses `process.env.DATABASE_URL` directly instead of `getConfig()`, bypassing Zod validation
- `apps/trigger/src/telemetry.ts:23` checks `process.env.SENTRY_DSN` directly instead of using config

**What needs to happen:**

- All env access should go through `getConfig()` from `@app/config`

---

### 29. No Code Splitting

No `dynamic()` or `React.lazy()` imports found. All components are statically imported, resulting in larger initial JavaScript bundles.

**What needs to happen:**

- Use `next/dynamic` for heavy components (charts, editors, modals)
- Consider route-level code splitting for pages not on the critical path

---

### 30. Root Package.json Kill Script Syntax Error

**File:** `package.json:54`

```json
"kill": "&& lsof -i :3000 -t | xargs -r kill && ..."
```

Starts with `&&` which will fail.

---

## Feature Completeness Summary

| Area                          | Status                                    | Completeness |
| ----------------------------- | ----------------------------------------- | ------------ |
| Authentication & signup       | Working                                   | 85%          |
| Team management & permissions | Working (granular checks missing in tRPC) | 80%          |
| Product management            | Working                                   | 95%          |
| Order management              | Incomplete — cannot submit                | 60%          |
| AI agents & automations       | Partially working                         | 70%          |
| Billing & subscriptions       | Not started                               | 0%           |
| Monitoring & observability    | Installed, not wired up                   | 20%          |
| Input validation              | Partial (tRPC only, REST gaps)            | 60%          |
| Responsive design             | Desktop-first, mobile issues              | 50%          |
| Accessibility                 | Minimal                                   | 25%          |
| Test coverage                 | Not started                               | 0%           |
