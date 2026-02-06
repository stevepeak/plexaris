# Activity Log

## 2026-02-06 — Task 1: Database schema changes

Added `data jsonb` columns to `organization` and `product` tables for storing structured scraped data and scrape issues. Created new `file` table (id, organizationId, name, mimeType, size, content as bytea, createdAt) for storing uploaded documents. Created new `trigger_run` table (id, organizationId, triggerRunId, taskType, label, status, createdAt, updatedAt) for tracking active Trigger.dev runs per organization. Generated and applied migration `0012_nervous_avengers.sql`. Typecheck and lint pass.

**Files changed:**

- `packages/db/src/org-schema.ts` — added `data jsonb` column
- `packages/db/src/product-schema.ts` — added `data jsonb` column
- `packages/db/src/file-schema.ts` — new file table with bytea content
- `packages/db/src/trigger-run-schema.ts` — new trigger run tracking table
- `packages/db/src/schema.ts` — added barrel exports for new schemas
- `packages/db/migrations/0012_nervous_avengers.sql` — migration

**Screenshot:** `screenshots/task1-database-schema.png`

## 2026-02-06 — Task 2: Move Zod schemas into packages/db

Moved all Zod validation schemas from `docs/schema.ts` into `packages/db/src/data-schemas.ts`. Removed `orderSchema` (out of scope per plan). Added `scrapeIssueSchema` for tracking validation failures during scraping. Created combined data schemas (`horecaDataSchema`, `supplierDataSchema`, `productDataSchema`) that wrap the entity schemas with a `scrapeIssues` array. Added `zod` as a dependency to `packages/db`. Exported everything from the barrel file. Deleted the original `docs/schema.ts`. All CI checks pass (typecheck, lint, knip, build).

**Files changed:**

- `packages/db/src/data-schemas.ts` — new, moved from `docs/schema.ts` with scrapeIssueSchema and combined data schemas
- `packages/db/src/schema.ts` — added barrel export for data-schemas
- `packages/db/package.json` — added `zod` dependency
- `bun.lock` — updated lockfile with zod for packages/db
- `docs/schema.ts` — deleted (moved to packages/db)

**Screenshot:** `screenshots/task2-zod-schemas.png`
