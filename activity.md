## 2026-02-02

### Add `claim_token` table to database schema

Added the `claim_token` table to `packages/db/src/org-schema.ts` per the spec in `docs/database.md`. The table stores tokens sent to suppliers to claim their pre-seeded profiles from the Horecava scrape.

**Fields:** id (PK), organizationId (FK to organization), email, token (unique), expiresAt, usedAt, createdAt.

**Changes:**

- `packages/db/src/org-schema.ts` — added `claimToken` table definition
- `packages/db/migrations/0004_puzzling_the_liberteens.sql` — generated migration (CREATE TABLE + FK constraint)

**Note:** Migration needs to be applied with `bun --cwd packages/db db:migrate` (sandbox blocked .env access during development).

**Screenshot:** `screenshots/claim-token-schema.png` (dashboard showing app is running)
