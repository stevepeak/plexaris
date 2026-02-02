## 2026-02-02

### 03-01 Claim API endpoint

Added `GET /api/claim/[token]` and `POST /api/claim/[token]` API routes for supplier profile claiming.

- **GET** returns an organization preview (name, type, status, description, contact info) without requiring authentication. Returns 404 for invalid/used tokens and 410 for expired tokens.
- **POST** requires authentication. Validates the token, creates an owner membership linking the authenticated user to the organization, marks the token as used, and updates the organization status from `unclaimed` to `claimed`. Returns 409 if the organization was already claimed.

Tested with seeded data: created an unclaimed "Beukappeltarten B.V." supplier org with a claim token, verified GET preview, POST claim, and re-use prevention (used tokens return 404).

Screenshot: `screenshots/03-01-claim-api-endpoint.png`
