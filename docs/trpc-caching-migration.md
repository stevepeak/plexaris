# Reduce duplicate API calls via tRPC migration + caching

## Context

Navigating between pages (e.g. to the Settings tab) triggers 12+ API calls, many duplicates:

- `/api/auth/get-session` x3
- `/api/organizations/mine` x2
- `/api/organizations/:id` x2
- `/api/uploadthing` x2

Root causes:

1. Tab components use raw `fetch()` — bypasses React Query entirely, no caching or deduplication
2. `useActiveOrg()` uses raw `fetch()` — re-fetches on every page mount
3. `staleTime` is only 5s — tRPC queries go stale almost instantly
4. Middleware fetches session + orgs server-side, then client components re-fetch the same data

## Plan

### Step 1: Increase React Query `staleTime`

**File:** `apps/web/app/providers/trpc-provider.tsx`

Change `staleTime` from `5 * 1000` (5s) to `30 * 1000` (30s). This means data fetched via tRPC won't be re-fetched for 30 seconds when navigating between pages.

### Step 2: Create an `organization` tRPC router

**New file:** `packages/api/src/routers/organization.ts`

Add 4 query procedures that mirror the existing REST endpoints:

- `mine` — user's orgs (mirrors `GET /api/organizations/mine`)
- `getById` — org details + role (mirrors `GET /api/organizations/:id`)
- `members` — org members list (mirrors `GET /api/organizations/:id/members`)
- `products` — org products list (mirrors `GET /api/products?organizationId=`)

Reuse the `verifyMembership` helper pattern from `packages/api/src/routers/suggestion.ts`.

**File:** `packages/api/src/index.ts`

Register the new `organizationRouter` in the `appRouter`.

### Step 3: Convert `useActiveOrg()` to use tRPC

**File:** `apps/web/components/org-switcher.tsx`

Replace the raw `fetch('/api/organizations/mine')` with `trpc.organization.mine.useQuery()`. This gives automatic caching — navigating from Dashboard to Org page won't re-fetch orgs.

### Step 4: Convert tab components to use tRPC

**File:** `apps/web/components/org-page/dashboard-tab.tsx`

- Replace `fetch(/api/organizations/${id})` with `trpc.organization.getById.useQuery({ organizationId })`

**File:** `apps/web/components/org-page/settings-tab.tsx`

- Replace the GET `fetch(/api/organizations/${id})` with `trpc.organization.getById.useQuery({ organizationId })`
- Keep the PATCH/POST mutations as raw `fetch()` (mutations don't benefit from query caching, and there are only 3 of them for save/leave/archive)
- After successful PATCH, invalidate the `organization.getById` query so dashboard-tab picks up the change

**File:** `apps/web/components/org-page/members-tab.tsx`

- Replace `fetch(/api/organizations/${id}/members)` with `trpc.organization.members.useQuery({ organizationId })`

**File:** `apps/web/components/org-page/products-tab.tsx`

- Replace `fetch(/api/products?organizationId=)` with `trpc.organization.products.useQuery({ organizationId })`

### Step 5: Add cache invalidation where needed

In `settings-tab.tsx`, after a successful PATCH update, call `utils.organization.getById.invalidate()` so the dashboard-tab shows fresh data (same pattern used in suggestions-tab).

## Files to modify

| File                                             | Change                                                    |
| ------------------------------------------------ | --------------------------------------------------------- |
| `apps/web/app/providers/trpc-provider.tsx`       | Increase `staleTime` to 30s                               |
| `packages/api/src/routers/organization.ts`       | **New** — organization tRPC router                        |
| `packages/api/src/index.ts`                      | Register organization router                              |
| `apps/web/components/org-switcher.tsx`           | Use `trpc.organization.mine.useQuery()`                   |
| `apps/web/components/org-page/dashboard-tab.tsx` | Use `trpc.organization.getById.useQuery()`                |
| `apps/web/components/org-page/settings-tab.tsx`  | Use `trpc.organization.getById.useQuery()` + invalidation |
| `apps/web/components/org-page/members-tab.tsx`   | Use `trpc.organization.members.useQuery()`                |
| `apps/web/components/org-page/products-tab.tsx`  | Use `trpc.organization.products.useQuery()`               |

## What this does NOT change

- Middleware session/org fetches — these are server-side for auth guard purposes and will remain
- `authClient.useSession()` — better-auth manages its own client-side session cache
- REST mutation endpoints (PATCH, POST for leave/archive) — kept as-is since mutations don't cache
- REST `POST /api/products` and `PATCH /api/products/:id` — only the list query is migrated
- `/api/uploadthing` — these are uploadthing SDK calls, not easily cacheable

## Expected result

After this change, navigating from Dashboard to Org Settings should produce roughly:

- `GET /api/auth/get-session` x1 (middleware) — client-side session cached by better-auth
- `GET /api/trpc/organization.mine,organization.getById?batch=1` x1 (batched, cached for 30s)
- No duplicate calls on tab switches within the same org page (React Query serves from cache)

## Verification

1. `bun run fix && bun run knip:fix`
2. `bun run ci` (typecheck, lint, knip, build)
3. Open browser, navigate between pages, check network tab for reduced/batched API calls
