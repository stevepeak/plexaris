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

### 3. Production Errors Are Invisible

Sentry is installed and configured in `trigger.config.ts` but never initialized in the Next.js web app. Production errors vanish into `console.error()`.

**Current state:**

- `trigger.config.ts:1-2` — Sentry works for background jobs
- `apps/web/app/error.tsx:15` — Only does `console.error(error)`
- No `instrumentation.ts` exists in `apps/web/`
- No `Sentry.captureException()` calls anywhere in the web app
- `.github/workflows/ci.yml:57-62` — Source maps are uploaded to Sentry (for an app that never reports errors)

**What needs to happen:**

- Create `apps/web/instrumentation.ts` with `Sentry.init()` for server-side
- Create `apps/web/app/sentry-provider.tsx` or use `@sentry/nextjs` client initialization
- Update `apps/web/app/error.tsx` to call `Sentry.captureException(error)`
- Verify Sentry DSN is configured in production environment variables

---

### 4. No Security Headers

`apps/web/next.config.js` is 12 lines with no security configuration. The middleware only handles auth.

**Missing headers:**

- `Content-Security-Policy` — Prevents XSS and data injection
- `X-Frame-Options: DENY` — Prevents clickjacking
- `X-Content-Type-Options: nosniff` — Prevents MIME-type sniffing
- `Strict-Transport-Security` — Enforces HTTPS
- `Referrer-Policy: strict-origin-when-cross-origin` — Limits referrer leakage

**What needs to happen:**

- Add a `headers()` function in `apps/web/next.config.js` that returns security headers for all routes
- Or add security headers in `apps/web/middleware.ts` alongside the auth logic

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

### 8. Missing Database Indexes

No indexes exist on commonly queried foreign key columns. This will cause full table scans as data grows.

**Columns that need indexes:**

| Table                     | Column(s)                | Used in                             |
| ------------------------- | ------------------------ | ----------------------------------- |
| `order`                   | `organizationId`         | `order.list`, `order.get`           |
| `order_item`              | `orderId`                | `order.duplicate`, `order.get`      |
| `product`                 | `organizationId`         | Product list, browse, search        |
| `suggestion`              | `organizationId`         | `suggestion.list`                   |
| `membership`              | `userId`                 | Auth checks, org membership queries |
| `notification_preference` | `userId, organizationId` | Notification queries                |
| `organization`            | `archivedAt`             | Filtered in many queries            |

**What needs to happen:**

- Create a new migration adding these indexes
- Use `CREATE INDEX CONCURRENTLY` if running against a live database

---

### 9. File Storage in Database

Binary file content is stored as `bytea` in the `file` table (`packages/db/src/file-schema.ts:18-28`). This bloats the database, slows backups, and hurts query performance.

**Current behavior:**

- `apps/web/app/api/organizations/[id]/files/route.ts:47` — Stores raw `buffer` in database column
- No MIME type whitelist on this endpoint (accepts any file type)
- Size limit is 5MB per file but content goes directly into Postgres

**What needs to happen:**

- Store files in cloud storage (Cloudinary is already used for product images, or use S3/R2)
- Store only metadata (name, type, size, URL) in the database
- Add MIME type whitelist (PDF, images, common document types)
- Migrate existing file data out of the database

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

---

### 11. Unsafe Non-null Assertions

`packages/api/src/routers/order.ts` has ~8 instances of `!` (non-null assertion) without null checks. If a query returns empty results, these throw unhandled runtime errors.

**Locations:**

- Line 129: `row!.id`
- Line 131: `row!.id`
- Lines 182-184: `orderData!`
- Line 219: `item!.id`
- Line 225: `item!.id`
- Line 389: `newOrder!.id`
- Lines 412-415: `newOrder!.id`

**Also in `packages/api/src/routers/suggestion.ts`:**

- Line 151: `as Record<string, unknown>` unsafe cast
- Line 339: `[s.field!]: s.proposedValue` non-null assertion on field name

**What needs to happen:**

- Replace `!` assertions with proper null checks
- Throw `TRPCError({ code: 'NOT_FOUND' })` when expected data is missing
- Validate field names against allowed list before dynamic property access

---

### 12. Inconsistent Error Types

`packages/api/src/index.ts` throws generic `Error()` instead of `TRPCError` in 3 places (lines 62, 128, 176). This prevents the frontend from properly handling error codes.

**What needs to happen:**

- Replace `throw new Error('Organization not found')` with `throw new TRPCError({ code: 'NOT_FOUND', message: 'Organization not found' })`
- Review all error throws across tRPC routers for consistency

---

## P2 — Medium Priority (Post-Launch Improvements)

### 13. Inconsistent User Feedback

Only 2 components use toast notifications. Most CRUD operations give no visible success/error feedback.

**Components WITH toast:**

- `apps/web/components/org-page/agents-schedules-tab.tsx` — Delete, run, create
- `apps/web/components/org-page/suggestions-tab.tsx` — Accept, dismiss

**Missing toast feedback:**

- Product create/update/delete/archive
- Member invitation sent/failed
- Settings changes saved
- Organization archived
- Order item add/remove/update
- Profile updates

**What needs to happen:**

- Add `toast.success()` / `toast.error()` to all mutation `onSuccess` / `onError` callbacks
- Pick one feedback pattern (toast vs inline message) and use it consistently

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

### 15. Products Not Cascaded on Org Archive

When a supplier organization is archived, their products remain active and visible in browse/search APIs.

**File:** `apps/web/app/api/organizations/[id]/archive/route.ts`

**What needs to happen:**

- When archiving an org, also soft-delete all products belonging to that org
- Add `archivedAt` filter to product browse endpoints if not already present

---

### 16. Missing Cascading Deletes

All foreign keys use `ON DELETE no action`. Deleting records leaves orphaned data.

**What needs to happen:**

- Add `ON DELETE CASCADE` to child tables where appropriate (session, account, passkey → user)
- Add `ON DELETE SET NULL` where references should be preserved (orderEvent.actorId → user)
- Or implement application-level cleanup in delete/archive operations

---

### 17. No Audit Trail

Only `orderEvent` tracks changes. No audit logging exists for:

- Product updates (versions exist but no diff tracking)
- Organization changes (name, settings, contact info)
- User and membership changes (role assignments, removals)
- Role changes (permission modifications)

**What needs to happen:**

- Add an `audit_log` table with: `id`, `organizationId`, `actorId`, `action`, `entityType`, `entityId`, `payload` (JSONB with before/after), `createdAt`
- Log writes to this table in critical mutation paths
- Add a UI to view audit history (referenced in `docs/todo.md` as "auditing page of user actions")

---

### 18. Large Component Files

Several components are overly large and should be decomposed.

| Component                                       | Lines | Recommendation                                                                                         |
| ----------------------------------------------- | ----- | ------------------------------------------------------------------------------------------------------ |
| `apps/web/components/product-form.tsx`          | 1,570 | Split into PhotosSection, IngredientsSection, AllergensSection, PricingSection, etc.                   |
| `apps/web/components/profile-form.tsx`          | ~900  | Split profile editing, password change, org memberships, and account deletion into separate components |
| `apps/web/components/org-page/settings-tab.tsx` | ~600  | Split general settings, contact info, and delivery areas                                               |

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

### 21. Incomplete `.env.example`

Only lists `DATABASE_URL` and `BETTER_AUTH_SECRET`. Missing 15+ required variables.

**What needs to happen:**

- Add all env vars from `packages/config/src/index.ts` to `.env.example` with descriptions and example values

---

### 22. TypeScript Strictness Inconsistency

`config/tsconfig/bun.json:10` has `noImplicitAny: false` while the web app uses `strict: true`. Backend packages allow implicit `any`.

**What needs to happen:**

- Set `noImplicitAny: true` in `config/tsconfig/bun.json`
- Fix resulting type errors in backend packages

---

### 23. Missing Storybook Stories

Per project rules: "All components must have corresponding Storybook stories." ~44 UI components and several order-related components lack stories.

**Missing stories (partial list):**

- `active-task-row.tsx`
- `scrape-issues-table.tsx`
- `browse-home.tsx`, `category-sidebar.tsx`, `cart-item.tsx`
- `keyboard-shortcuts-dialog.tsx`, `order-chat.tsx`
- `supplier-detail.tsx`, `tab-bar.tsx`

---

### 24. Accessibility Gaps

- Icon-only buttons lack `aria-label` attributes (rely on tooltips which are not accessible)
- Table rows use `onClick` without ARIA `role="button"` (`product-list.tsx:254-263`)
- No skip-to-content links
- Only ~31 aria attributes across the entire components directory

---

### 25. Timestamps Without Timezone

All timestamp columns use `timestamp` without `with time zone`. This can cause timezone confusion in multi-region deployments.

**What needs to happen:**

- Use `timestamp('column_name', { withTimezone: true, mode: 'date' })` for new columns
- Plan a migration to convert existing columns (requires careful testing)

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
