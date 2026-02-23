# Activity Log

## 2026-02-23 — Steps 1 & 2: Backend Permission Helper + Order Submit Mutation

- Added `hasPermission()` function to `packages/api/src/lib/verify-access.ts` — checks if a user's role includes a specific permission string, with superAdmin bypass
- Added `'order.submitted'` to the `AuditAction` type union in `packages/api/src/lib/audit.ts`
- Added `order.submit` mutation to `packages/api/src/routers/order.ts` — validates membership, `place_order` permission, draft status, and item count before transitioning order to `submitted` status with audit logging
- All CI checks pass (typecheck, lint, knip, build)
- Screenshot: `screenshots/step1-backend-permission-helper.png`
