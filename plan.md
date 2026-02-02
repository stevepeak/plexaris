@docs/02-supplier-data-import.md

Work on this epic.

## Tasks

- [x] **Add `claim_token` table to database schema** — Create the `claim_token` table in `packages/db/src/org-schema.ts` per the spec in `docs/database.md`, generate and apply the Drizzle migration. Fields: id, organizationId (FK), email, token (unique), expiresAt, usedAt, createdAt.
  - passes: true

- [x] **Create Horecava exhibitor scraper task** — Build a Trigger.dev task in `apps/trigger/src/tasks/` that scrapes the Horecava exhibitors page, extracts company name, email, phone, website, and description for each exhibitor.
  - passes: true

- [x] **Create supplier seeding task** — Build a Trigger.dev task that takes scraped exhibitor data and inserts unclaimed supplier organization records into the database, with deduplication on company name + email.
  - passes: true

- [x] **Create claim token generation task** — Build a Trigger.dev task that generates unique claim tokens (UUID, 90-day expiry) for all unclaimed supplier organizations and stores them in the `claim_token` table.
  - passes: true

- [ ] **Create CSV export for outreach** — Build a Trigger.dev task (or utility script) that exports unclaimed supplier profiles with their claim tokens to CSV format (columns: company name, email, claim URL) for the outreach team.
  - passes: false
