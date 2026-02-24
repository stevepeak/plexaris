# Plan: Reduce Redundant API Calls on Page Load

## Context

A single page refresh triggers 6 API calls, with both `/api/auth/get-session` and `/api/organizations/mine` called twice — once in middleware (server-side loopback) and once client-side. The root cause is that the middleware results aren't shared with the client, and `useActiveOrg()` uses raw `fetch` with zero caching or deduplication.

**Current call waterfall:**

```
GET /api/auth/get-session         # Middleware loopback (9ms, blocks SSR)
GET /api/organizations/mine       # Middleware loopback (8ms, blocks SSR)
GET /orgs/.../agents/schedules    # Page SSR (170ms)
GET /api/auth/get-session         # Client: authClient.useSession() (5ms)
GET /api/organizations/mine       # Client: useActiveOrg() (16ms)
GET /api/trpc/...batch            # Client: tRPC batched (14ms)
```

**Target call waterfall (after changes):**

```
GET /orgs/.../agents/schedules    # Page SSR (middleware checks cookie + session inline)
GET /api/auth/get-session         # Client: authClient.useSession() (5ms, needed for UI)
GET /api/trpc/organization.mine,suggestion.pendingCount,agentSchedule.list  # Single batched tRPC
```

**Result:** 6 HTTP calls → 3. Middleware blocking time reduced from ~17ms to ~0ms (cookie read).

---

## Phase 1: Move org data to tRPC (eliminates duplicate `/api/organizations/mine`) <!-- passes: true -->

This is the highest-impact change. The `useActiveOrg()` hook uses raw `fetch('/api/organizations/mine')` in a `useEffect` — no caching, no deduplication. Every page that calls it triggers an independent request. Moving to tRPC gives us React Query's automatic deduplication + caching + batching with other tRPC calls.

### Step 1.1: Create `organization` tRPC router

**New file:** `packages/api/src/routers/organization.ts`

- Create `mine` procedure using `protectedProcedure`
- Move the DB query logic from `apps/web/app/api/organizations/mine/route.ts` (lines 17-79)
- The tRPC context already has `ctx.session.user.id` and `ctx.session.user.superAdmin` (set in `apps/web/app/api/trpc/[trpc]/route.ts:30-33`), eliminating the redundant session check + superAdmin lookup the current REST route does

### Step 1.2: Register the router

**Edit:** `packages/api/src/index.ts`

- Add `organization: organizationRouter` to the `appRouter` at line 217

### Step 1.3: Rewrite `useActiveOrg` hook

**Edit:** `apps/web/components/org-switcher.tsx`

- Replace the `useEffect` + raw `fetch` (lines 57-77) with `trpc.organization.mine.useQuery()`
- Keep the localStorage-based `activeOrg` selection logic
- Replace the `refreshKey` prop pattern with `trpc.useUtils().organization.mine.invalidate()`
- Set a longer `staleTime` (e.g. 30s) since org membership rarely changes mid-session

### Step 1.4: Update consumers that use `refreshKey` pattern

**Edit:** `apps/web/app/(app)/orgs/[orgId]/layout.tsx`

- Replace `refreshKey` state + `setRefreshKey(k => k + 1)` with calling `invalidate()` on the tRPC query

### Step 1.5: Update profile page

**Edit:** `apps/web/app/(app)/settings/profile/page.tsx`

- Has its own separate `fetchUserOrgs()` calling the same endpoint — replace with the shared tRPC query

### Step 1.6: Delete REST route

**Delete:** `apps/web/app/api/organizations/mine/route.ts` (after Phase 2 removes middleware dependency)

**Impact:** All 7 pages calling `useActiveOrg()` share one cached query. The org fetch also batches with `suggestion.pendingCount` and page-specific tRPC calls via `httpBatchLink`, so it adds near-zero marginal latency.

---

## Phase 2: Optimize middleware org check (eliminates middleware `/api/organizations/mine` call) <!-- passes: true -->

The middleware calls `userHasOrganizations()` on every protected route to decide whether to redirect to `/onboarding`. This only needs a boolean — not the full org list.

### Step 2.1: Set a `has_orgs` cookie from the client

**Edit:** `apps/web/components/org-switcher.tsx`

- After the tRPC query resolves successfully, set: `document.cookie = 'has_orgs=1; path=/; max-age=86400; SameSite=Lax'`
- If orgs array is empty, set `has_orgs=0`

### Step 2.2: Update middleware to use the cookie

**Edit:** `apps/web/middleware.ts`

- Replace `userHasOrganizations()` calls (lines 52, 69, 77) with a cookie check:
  ```
  const hasOrgs = request.cookies.get('has_orgs')?.value === '1'
  ```
- Fall back to the API call only if the cookie is absent (first visit)
- Delete the `userHasOrganizations()` function once cookie is primary

### Step 2.3: Delete the REST route

**Delete:** `apps/web/app/api/organizations/mine/route.ts` (now fully unused)

**Impact:** Middleware org check goes from ~8ms (HTTP loopback + 3 DB queries) to ~0ms (cookie read). Trade-off: cookie could be stale if user leaves all orgs, but onboarding page handles this gracefully.

---

## Phase 3: Accept single client session call (no code change) <!-- passes: true -->

`authClient.useSession()` (5ms) is needed client-side for user avatar, name, email in `AppHeader`. better-auth's React hook deduplicates internally — multiple `useSession()` calls share one underlying fetch. The middleware session check (9ms loopback) is a known pattern and difficult to eliminate without edge runtime concerns. Leave as-is for now.

**Future option:** If middleware latency becomes a concern, investigate `auth.api.getSession({ headers })` directly in middleware (avoids loopback but requires Node.js runtime, not edge).

---

## Files to modify

| File                                           | Action                                        |
| ---------------------------------------------- | --------------------------------------------- |
| `packages/api/src/routers/organization.ts`     | **Create** — new tRPC router                  |
| `packages/api/src/index.ts`                    | **Edit** — register router                    |
| `apps/web/components/org-switcher.tsx`         | **Edit** — rewrite `useActiveOrg` to use tRPC |
| `apps/web/app/(app)/orgs/[orgId]/layout.tsx`   | **Edit** — update refresh pattern             |
| `apps/web/app/(app)/settings/profile/page.tsx` | **Edit** — use shared tRPC query              |
| `apps/web/middleware.ts`                       | **Edit** — cookie-based org check             |
| `apps/web/app/api/organizations/mine/route.ts` | **Delete** — replaced by tRPC                 |

---

## Verification

1. `bun run fix && bun run knip:fix` then `bun run ci` — all checks pass
2. Hard refresh `/orgs/{id}/agents/schedules` — verify in Network tab:
   - No `/api/organizations/mine` calls (replaced by tRPC batch)
   - Single `/api/auth/get-session` (client only)
   - `organization.mine` appears in the tRPC batch call
3. Navigate between org pages — verify org data is cached (no new org fetch within 30s)
4. Test onboarding redirect — clear `has_orgs` cookie, verify middleware still redirects correctly
5. Test org switching — switching orgs in the dropdown correctly updates the UI and localStorage
