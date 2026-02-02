## 2026-02-02

### Add `claim_token` table to database schema

Added the `claim_token` table to `packages/db/src/org-schema.ts` per the spec in `docs/database.md`. The table stores tokens sent to suppliers to claim their pre-seeded profiles from the Horecava scrape.

**Fields:** id (PK), organizationId (FK to organization), email, token (unique), expiresAt, usedAt, createdAt.

**Changes:**

- `packages/db/src/org-schema.ts` — added `claimToken` table definition
- `packages/db/migrations/0004_puzzling_the_liberteens.sql` — generated migration (CREATE TABLE + FK constraint)

**Note:** Migration needs to be applied with `bun --cwd packages/db db:migrate` (sandbox blocked .env access during development).

**Screenshot:** `screenshots/claim-token-schema.png` (dashboard showing app is running)

### Create Horecava exhibitor scraper task

Built a Trigger.dev task (`scrape-horecava`) in `apps/trigger/src/tasks/scrape-horecava.ts` that scrapes the Horecava 2026 exhibitors page. The scraper:

1. Fetches all 664 exhibitors in a single call via the Horecava JSON API (`/api/events/75/exhibitors?limit=1000`)
2. For each exhibitor, fetches the detail page HTML and extracts company data from the embedded `__NEXT_DATA__` JSON (website, address, long description, email, phone)
3. Processes detail pages in batches of 10 with 500ms rate-limiting between batches
4. Returns a typed array of exhibitor objects with: id, slug, name, description, longDescription, website, email, phone, address, countryCode, logo, stands

**Fields extracted per exhibitor:** id, slug, name, description (short), longDescription, website, email (null — not exposed by Horecava), phone (null — not exposed), address, countryCode, logo URL, stand numbers.

**Changes:**

- `apps/trigger/src/tasks/scrape-horecava.ts` — new scraper task
- `apps/trigger/src/index.ts` — export the new task

**Screenshot:** `screenshots/horecava-scraper-task.png` (dashboard showing app is running)

### Create supplier seeding task

Built a Trigger.dev task (`seed-suppliers`) in `apps/trigger/src/tasks/seed-suppliers.ts` that takes scraped exhibitor data and inserts unclaimed supplier organization records into the database.

The task:

1. Accepts an array of exhibitors (matching the scraper's output shape) as payload
2. For each exhibitor, checks for duplicates by matching on company name + type `supplier` (plus email when available)
3. Creates an organization record with `type: 'supplier'`, `status: 'unclaimed'`, mapping exhibitor fields to the org schema
4. Processes exhibitors in batches of 50 with per-record error handling
5. Returns statistics: `{ created, skipped, failed }`

**Deduplication:** Matches on `name` + `type='supplier'` + `email` (when present) to prevent duplicate orgs on re-runs.

**Changes:**

- `apps/trigger/src/tasks/seed-suppliers.ts` — new seeding task
- `apps/trigger/src/index.ts` — export the new task
- `apps/trigger/package.json` — added `@app/db` workspace dependency

**Note:** Run `bun install` to link the `@app/db` workspace dependency in the trigger app's node_modules.

**Screenshot:** `screenshots/seed-suppliers-task.png` (dashboard showing app is running)

### Create claim token generation task

Built a Trigger.dev task (`generate-claim-tokens`) in `apps/trigger/src/tasks/generate-claim-tokens.ts` that generates unique claim tokens (UUID, 90-day expiry) for all unclaimed supplier organizations and stores them in the `claim_token` table.

The task:

1. Queries all organizations with `type: 'supplier'` and `status: 'unclaimed'`
2. Skips suppliers without an email address (no way to send them a claim link)
3. Skips suppliers that already have an unused claim token (prevents duplicates on re-runs)
4. Generates a UUID token with 90-day expiry for each eligible supplier
5. Processes in batches of 50 with per-record error handling
6. Returns statistics: `{ generated, skipped, failed }`

**Changes:**

- `apps/trigger/src/tasks/generate-claim-tokens.ts` — new claim token generation task
- `apps/trigger/src/index.ts` — export the new task

**Screenshot:** `screenshots/generate-claim-tokens-task.png` (dashboard showing app is running)
