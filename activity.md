## 2026-02-02

### 03-01 Claim API endpoint

Added `GET /api/claim/[token]` and `POST /api/claim/[token]` API routes for supplier profile claiming.

- **GET** returns an organization preview (name, type, status, description, contact info) without requiring authentication. Returns 404 for invalid/used tokens and 410 for expired tokens.
- **POST** requires authentication. Validates the token, creates an owner membership linking the authenticated user to the organization, marks the token as used, and updates the organization status from `unclaimed` to `claimed`. Returns 409 if the organization was already claimed.

Tested with seeded data: created an unclaimed "Beukappeltarten B.V." supplier org with a claim token, verified GET preview, POST claim, and re-use prevention (used tokens return 404).

Screenshot: `screenshots/03-01-claim-api-endpoint.png`

### 03-02 Claim page UI

Built `/claim/[token]` page with full claim flow:

- **Preview state**: Fetches org details via `GET /api/claim/[token]` and displays name, type badge, description, contact email/phone, and address. Shows loading skeleton while fetching.
- **Auth handling**: If the user is authenticated, shows a "Claim organization" button. If unauthenticated, shows a sign-in-required alert with links to sign up or log in, both passing a `redirect` query param so the user returns to the claim page after auth.
- **Claim flow**: Clicking "Claim organization" calls `POST /api/claim/[token]`, then shows a success card with green checkmark and "Go to dashboard" button.
- **Error states**: Handles 404 (token not found/used), 410 (expired), and 409 (already claimed) with descriptive error cards and a "Go home" button.
- **Redirect support**: Updated login and signup pages to honour a `redirect` query parameter. Updated middleware to redirect authenticated users on auth routes to `/claim/*` paths when the redirect param is present.
- **Component extraction**: Extracted `ClaimCard` presentational component with full Storybook coverage (loading, preview authenticated/unauthenticated, claiming, claimed, error not found/expired/already claimed, minimal details).

Tested with seeded data: created "Bakkerij de Gouden Korst" supplier org, verified preview display, successful claim, and error on re-use.

Screenshots: `screenshots/03-02-claim-page-preview.png`, `screenshots/03-02-claim-page-success.png`, `screenshots/03-02-claim-page-error.png`

### 03-03 Supplier profile page

Built `/supplier/[id]` public read-only profile page for suppliers.

- **API route**: Added `GET /api/supplier/[id]` that returns supplier details (name, type, status, description, logo URL, phone, email, address) without authentication. Returns 404 for non-existent orgs or non-supplier orgs.
- **SupplierProfileCard component**: Presentational component with three states — loading (skeleton), loaded (full profile), and error. Shows org name with type badge, description, contact information section (email, phone, address with icons), and a products placeholder section.
- **Page**: `/supplier/[id]` client page that fetches from the API and renders the card. Centered layout matching the claim page pattern.
- **Storybook**: Full coverage with stories for loading, full profile, unclaimed profile, minimal profile (no optional fields), and error state.

Tested with seeded "Bakkerij de Gouden Korst" supplier org — verified profile display with all fields and error handling for invalid IDs.

Screenshot: `screenshots/03-03-supplier-profile-page.png`
