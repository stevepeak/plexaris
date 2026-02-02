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
