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

## 2026-02-06 — Task 3: Onboarding flow — Add URL and file upload steps

Expanded the onboarding flow from 2 steps (Type → Name) to 4 steps (Type → Name → URLs → Files). Created `UrlStep` component with a textarea for entering website URLs (one per line), with a dynamic "Skip"/"Continue" button. Created `FileUploadStep` component with drag-and-drop file upload area, file list with remove buttons, 5MB per-file size enforcement, and the final "Create organization" submit button. Updated `OrgNameStep` to show "Continue" instead of "Create organization" since submission now happens on step 4. Added file upload API route at `POST /api/organizations/[id]/files` that stores files as bytea in the `file` table. Updated the organization creation route to accept and store URLs in the `data` jsonb column. Created Storybook stories for both new components. All CI checks pass (typecheck, lint, knip, build).

**Files changed:**

- `apps/web/components/onboarding/types.ts` — added `urls` and `files` steps to `getSteps()`
- `apps/web/components/onboarding/url-step.tsx` — new URL input step component
- `apps/web/components/onboarding/url-step.stories.tsx` — new Storybook stories
- `apps/web/components/onboarding/file-upload-step.tsx` — new file upload step component
- `apps/web/components/onboarding/file-upload-step.stories.tsx` — new Storybook stories
- `apps/web/components/onboarding/org-name-step.tsx` — simplified to "Continue" button
- `apps/web/components/onboarding/org-name-step.stories.tsx` — updated for new props
- `apps/web/app/(app)/onboarding/page.tsx` — wired up all 4 steps with URLs and file upload
- `apps/web/app/api/organizations/route.ts` — accepts and stores URLs in data jsonb
- `apps/web/app/api/organizations/[id]/files/route.ts` — new file upload endpoint

**Screenshot:** `screenshots/task3-onboarding-flow.png`

## 2026-02-06 — Task 4: Active tasks card + scrape issues on organization page

Added an "Active Tasks" card and "Scrape Issues" table to the organization page. Created a new tRPC router (`triggerRunRouter`) with a `list` query that fetches running `trigger_run` rows for an org and retrieves fresh `publicAccessToken` from the Trigger.dev API server-side. The `ActiveTasksCard` component polls for active runs every 5 seconds and renders each run with a live streaming log line via the existing `useTriggerRun` hook, with status indicators (spinner/check/x). The card hides when there are no active runs. The `ScrapeIssuesTable` component displays scrape issues from the org's `data` jsonb column in a table with Source, Field, Raw Value, and Error columns; it hides when the array is empty. Both components have Storybook stories using static variants that avoid server-side dependencies. All CI checks pass (typecheck, lint, knip, build).

**Files changed:**

- `packages/api/src/routers/trigger-run.ts` — new tRPC router for active trigger runs
- `packages/api/src/index.ts` — added `triggerRun` router to appRouter
- `apps/web/components/active-tasks-card.tsx` — new ActiveTasksCard component (tRPC + live streaming)
- `apps/web/components/active-tasks-card-static.tsx` — static variant for Storybook
- `apps/web/components/active-tasks-card.stories.tsx` — Storybook stories
- `apps/web/components/active-task-row.tsx` — individual task row with useTriggerRun hook
- `apps/web/components/scrape-issues-table.tsx` — reusable scrape issues table component
- `apps/web/components/scrape-issues-table.stories.tsx` — Storybook stories
- `apps/web/app/(app)/orgs/[orgId]/page.tsx` — wired in ActiveTasksCard and ScrapeIssuesTable

**Screenshot:** `screenshots/task4-org-page-active-tasks-issues.png`

## 2026-02-06 — Task 5: Trigger.dev agent workflows

Created three agent workflows for scraping organization and product data. Built two AI agent tools (`readFile` for reading uploaded files from the database, `queryDatabase` for CRUD operations on organizations and products) in `packages/agents/src/tools/`. Created the `scrapeOrganizationAgent` which navigates URLs with browserbase tools, reads uploaded files, extracts company/contact/delivery data against the horecaSchema or supplierSchema, stores results in the organization's `data` jsonb column, records scrape issues, and discovers product listings to spawn sub-tasks. Created the `scrapeProductAgent` which scrapes individual product pages, deduplicates by article number or GTIN/EAN, and upserts into the product table. Both agents use the AI SDK v5 `Experimental_Agent` class with browserbase, readFile, and queryDatabase tools. Created corresponding Trigger.dev tasks (`scrape-organization` and `scrape-product`) that manage `trigger_run` rows for live progress tracking, initialize browser sessions via a new `createBrowserSession` helper in the browserbase package, and handle error/completion status updates. All CI checks pass (typecheck, lint, knip, build).

**Files changed:**

- `packages/agents/src/tools/read-file.ts` — new tool for reading uploaded files from the file table
- `packages/agents/src/tools/query-database.ts` — new tool for database CRUD operations on orgs and products
- `packages/agents/src/scrape-organization-agent.ts` — new agent for scraping organization data from URLs and files
- `packages/agents/src/scrape-product-agent.ts` — new agent for scraping and deduplicating product data
- `packages/agents/src/index.ts` — added barrel exports for new agents and tools
- `packages/agents/package.json` — added `@app/db` dependency
- `packages/browserbase/src/session.ts` — new helper to create browser sessions without importing Stagehand directly
- `packages/browserbase/src/index.ts` — added barrel export for session helper
- `apps/trigger/src/tasks/scrape-organization.ts` — new Trigger.dev task for org scraping workflow
- `apps/trigger/src/tasks/scrape-product.ts` — new Trigger.dev task for product scraping workflow
- `apps/trigger/src/index.ts` — added exports for new tasks
- `apps/trigger/package.json` — added `@app/browserbase` dependency

**Screenshot:** `screenshots/task5-agent-workflows.png`
