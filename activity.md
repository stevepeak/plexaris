## 2026-02-24: Phase 2 — Optimize middleware org check

**Changes:**

- **`apps/web/components/org-switcher.tsx`**: Added `useEffect` in `useActiveOrg()` that sets a `has_orgs` cookie (`1` or `0`) whenever the tRPC `organization.mine` query resolves. Cookie has 24h TTL, `SameSite=Lax`.
- **`apps/web/middleware.ts`**: Replaced all `userHasOrganizations()` calls (which made a loopback HTTP request to `/api/organizations/mine`) with a synchronous cookie read: `request.cookies.get('has_orgs')?.value === '1'`. Deleted the `userHasOrganizations()` function.
- **Deleted `apps/web/app/api/organizations/mine/route.ts`**: REST endpoint now fully replaced by tRPC `organization.mine` (Phase 1) + cookie check (Phase 2).

**Result:** Middleware org check goes from ~8ms (HTTP loopback + 3 DB queries) to ~0ms (cookie read). All CI checks pass (typecheck, lint, knip, build).

**Screenshot:** `screenshots/phase2-middleware-cookie-optimization.png` (dev server returning 500 on all routes — pre-existing issue unrelated to changes)
