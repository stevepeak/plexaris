# Onboarding & Scraping Workflow

Onboard new Horeca/Supplier organizations by collecting URLs and documents, then use AI agents to scrape and structure data into the database using the Zod schemas defined in `docs/schema.ts`.

---

## Task 1: Database — Add JSON data field and file storage table

**passes:** true

**Goal:** Store structured scraped data on organizations and products, and store uploaded files in the database. Scrape issues are stored alongside the data in the same jsonb column.

1. Add a `data jsonb` column to the `organization` table to hold the parsed `horecaSchema` or `supplierSchema` payload **plus** a `scrapeIssues` array (see `scrapeIssueSchema` in Task 2).
2. Add a `data jsonb` column to the `product` table to hold the parsed `productSchema` payload **plus** a `scrapeIssues` array.
3. Create a new `file` table with columns: `id`, `organizationId`, `name`, `mimeType`, `size` (integer, max 5MB enforced at upload), `content` (bytea), `createdAt`.
4. Create a new `trigger_run` table to track active Trigger.dev runs per organization:
   - `id` (uuid, PK)
   - `organizationId` (uuid, FK → organization)
   - `triggerRunId` (text, unique) — the Trigger.dev run ID
   - `taskType` (text) — e.g. `"scrape-organization"`, `"scrape-product"`
   - `label` (text) — human-readable description (e.g. `"Scraping example.com"`, `"Processing product: Heinz Ketchup"`)
   - `status` (text, default `"running"`) — `"running"` | `"completed"` | `"failed"`
   - `createdAt`, `updatedAt`
   - **Note:** No `publicAccessToken` column — tokens are ephemeral and fetched on demand from the Trigger.dev API (see Task 4a).
5. Generate and apply migrations, regenerate types, typecheck.

**Files:**

- `packages/db/src/schema/org-schema.ts`
- `packages/db/src/schema/product-schema.ts`
- `packages/db/src/schema/file-schema.ts` (new)
- `packages/db/src/schema/trigger-run-schema.ts` (new)

---

## Task 2: Move Zod schemas into `packages/db`

**passes:** false

**Goal:** The `docs/schema.ts` schemas need to live alongside the database code so both the API and agents can import them for `zod.parse()` on insert and select.

1. Move `docs/schema.ts` → `packages/db/src/data-schemas.ts` (or similar).
2. Export from the `packages/db` package index.
3. Remove the `orderSchema` for now (out of scope per caveats).
4. Add a `scrapeIssueSchema` to the data schemas:
   ```ts
   scrapeIssueSchema = z.object({
     source: z.string(), // URL or filename where the issue occurred
     field: z.string(), // schema field path (e.g. "unit.gtin")
     rawValue: z.unknown(), // the value that failed validation
     error: z.string(), // human-readable reason
     timestamp: z.string().datetime(),
   })
   ```
5. Wrap each top-level entity schema with its issues in a combined shape, e.g.:
   ```ts
   organizationDataSchema = z.object({
     ...horecaSchema.shape, // or supplierSchema, based on org type
     scrapeIssues: z.array(scrapeIssueSchema).default([]),
   })
   ```

**Files:**

- `packages/db/src/data-schemas.ts` (new, moved from docs)
- `packages/db/src/index.ts`

---

## Task 3: Onboarding flow — Add URL and file upload steps

**passes:** false

**Goal:** Expand the current 2-step onboarding (type → name) to 4 steps.

**Current flow:** Type Selection → Name Entry → Done
**New flow:** Type Selection → Name Entry → URLs → File Upload → Submit

1. **Step 3 — URLs:** Text area for the user to enter one or more URLs (one per line). Prompt: "Provide URLs to your website, product catalogs, or any pages we can scrape for product and company details."
2. **Step 4 — File Upload:** Drag-and-drop or file picker to upload documents (CSV, Excel, PDF, images — all types accepted). 5MB max per file, enforced client-side and server-side. Files are stored in the new `file` table.
3. **Submit:** Create the organization, store files, and trigger the scraping workflow (Task 5).
4. Update `getSteps()` in `apps/web/components/onboarding/types.ts`.

**Files:**

- `apps/web/components/onboarding/types.ts`
- `apps/web/components/onboarding/url-step.tsx` (new)
- `apps/web/components/onboarding/file-upload-step.tsx` (new)
- `apps/web/app/(app)/onboarding/page.tsx`
- API route or tRPC mutation to handle file uploads

---

## Task 4: Active tasks card + scrape issues on the organization page

**passes:** false

**Goal:** Show live agent progress and scrape issues inline on the existing org page.

### 4a: Active tasks card

1. New tRPC query: fetch all `trigger_run` rows for an org where `status = 'running'`. For each run, call the Trigger.dev API server-side to retrieve a fresh `publicAccessToken`. Return `triggerRunId`, `publicAccessToken`, `taskType`, and `label` to the client.
2. New card on the org page: "Active Tasks". For each running task, render a row with:
   - `label` (e.g. "Scraping example.com")
   - Latest streaming log line from the `progress` stream (via `useTriggerRun` hook from `apps/web/app/hooks/use-trigger-run.ts`)
   - Status indicator (spinner while running, check on complete, x on failed)
3. When a run completes or fails, the card updates in realtime. The card hides when there are no active runs.
4. Agents must insert a `trigger_run` row when they start and update `status` to `"completed"` or `"failed"` when done. Sub-agents (product scrape) also insert their own rows so they appear in the card.

### 4b: Scrape issues section

5. Below the active tasks card, show a "Scrape Issues" section that renders the `scrapeIssues` array from the org's `data` jsonb column.
6. Display as a table with columns: **Source** (URL or filename), **Field**, **Raw Value**, **Error**.
7. Same pattern for products — show per-product issues on the product detail view if issues exist.
8. Section is hidden when `scrapeIssues` is empty.

**Files:**

- `packages/api/src/router/` — new tRPC query for active trigger runs
- `apps/web/app/(app)/orgs/[orgId]/page.tsx` (add both sections)
- `apps/web/components/active-tasks-card.tsx` (new)
- `apps/web/components/scrape-issues-table.tsx` (new, reusable for org and product)

---

## Task 5: Trigger.dev agent workflows

**passes:** false

**Goal:** Three agent workflows that scrape URLs and documents, then insert structured data.

All agents follow the pattern in `packages/agents/src/example-agent.ts` and use tools from `packages/browserbase`.

### Agent 1: Organization Discovery

- **Input:** `organizationId`, `urls[]`, `fileIds[]`
- **Behavior:**
  1. **Insert a `trigger_run` row** with `taskType: "scrape-organization"`, `status: "running"`, and a descriptive `label`.
  2. Scrape each URL using browserbase `extract` tool for company details (address, VAT, contacts, etc.).
  3. Read uploaded files for additional org-level data.
  4. Parse results against `horecaSchema` or `supplierSchema`.
  5. Update the organization's `data` jsonb field with parsed data.
  6. Append any fields that failed validation to the `scrapeIssues` array in the org's `data` column.
  7. Discover product listings/pages; for each product found, spawn Agent 2.
  8. **Update `trigger_run` status** to `"completed"` or `"failed"` on exit.

### Agent 2: Product Discovery (sub-agent, fire-and-forget)

- **Input:** `organizationId`, `productUrl` or `fileId`, `productHint` (name or identifier)
- **Behavior:**
  1. **Insert a `trigger_run` row** with `taskType: "scrape-product"`, `status: "running"`, and label from `productHint`.
  2. Scrape the product page or extract from the relevant file section.
  3. Parse against `productSchema`.
  4. Upsert into the `product` table using the deduplication strategy below.
  5. Store parsed data in the product's `data` jsonb field.
  6. Append any fields that failed validation to the `scrapeIssues` array in the product's `data` column.
  7. **Update `trigger_run` status** to `"completed"` or `"failed"` on exit.

### Product deduplication strategy

Products are **universal** — the same physical product can be supplied by multiple organizations. The agent should use `articleNumber` (distributor article number) and/or `unit.gtin` (EAN code) as the primary match keys. The AI determines the best identifier available from the scraped data, but hard identifiers (article number, GTIN) are always preferred over soft ones (name).

- **Match found (same article number or GTIN across any org):** Update the existing product's `data` jsonb with any new/richer fields. Link the product to the current organization as an additional supplier.
- **No match:** Insert a new product row.
- **Same name but different numbers:** Treat as distinct products — name alone is not sufficient for deduplication since different orgs may have identically named but different products.

### Tools needed in `packages/agents`:

- `readFile` — read an uploaded file from the `file` table by ID, return contents.
- Browserbase tools — already exist: `goto`, `extract`, `observe`, `act`, `agent`.
- `queryDatabase` — select/insert/update against the DB via Drizzle.

**Files:**

- `apps/trigger/src/tasks/scrape-organization.ts` (new)
- `apps/trigger/src/tasks/scrape-product.ts` (new)
- `packages/agents/src/scrape-organization-agent.ts` (new)
- `packages/agents/src/scrape-product-agent.ts` (new)
- `packages/agents/src/tools/read-file.ts` (new)
- `packages/agents/src/tools/query-database.ts` (new)

---

## Task 6: Wire it all together

**passes:** false

1. Onboarding submit triggers the `scrape-organization` task via tRPC → Trigger.dev (returns `runId`).
2. The tRPC mutation inserts the initial `trigger_run` row (with the `triggerRunId`) before returning, so the active tasks card picks it up immediately. The frontend uses the Task 4a query to fetch a fresh public access token from the Trigger.dev API when it needs to subscribe.
3. Redirect user to the org page. The active tasks card shows the running agent(s) with live streaming logs. As sub-agents spawn for products, new rows appear in the card automatically.
4. When all runs complete, the active tasks card hides and the scrape issues section shows any problems.

---

## Out of Scope

- **Orders** — focus is onboarding and scraping org/product data only.
- **File hosting migration** — files stored as bytea in Postgres for now; will move to object storage later.
- **File type restrictions / security** — accept all types now, restrict later.
- **Production hardening** — no backwards-compat shims, deprecation paths, or migration logic needed.

---

## Task Dependencies

```
Task 1 (DB schema) ──┐
                      ├──→ Task 3 (Onboarding UI)
Task 2 (Zod schemas) ┤
                      ├──→ Task 4 (Org page: active tasks + issues)
                      │
                      └──→ Task 5 (Agent workflows)
                                │
Task 3 + 4 + 5 ────────────────┴──→ Task 6 (Wire together)
```

Tasks 1 and 2 are prerequisites — everything else depends on them. Tasks 3, 4, and 5 can be built in parallel after that. Task 6 is the integration pass once 3–5 are done.
