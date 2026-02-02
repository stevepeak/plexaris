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

### 03-04 Supplier profile edit

Added supplier-specific editable fields to the organization settings page for supplier orgs.

- **New DB column**: Added `deliveryAreas` text column to the `organization` table with migration.
- **PATCH API update**: Extended `PATCH /api/organizations/[id]` to accept and persist `logoUrl` and `deliveryAreas` fields.
- **Supplier API update**: Extended `GET /api/supplier/[id]` to include `deliveryAreas` in the response.
- **Org settings form**: Added two supplier-only fields to `OrgSettingsFormFields`:
  - **Logo URL**: Input with live preview thumbnail (shows image when URL is set, placeholder icon otherwise).
  - **Delivery areas**: Textarea for specifying delivery regions.
  - These fields only appear when the organization type is `supplier`. The existing `deliveryAddress` field continues to appear only for `horeca` orgs.
  - All fields remain owner-only (disabled for non-owners).
- **Supplier profile card**: Updated `SupplierProfileCard` to display the logo image (instead of placeholder icon) when `logoUrl` is set, and to show a "Delivery Areas" section when `deliveryAreas` is populated.
- **Storybook**: Updated stories for both `OrgSettingsFormFields` and `SupplierProfileCard` to include the new fields.

Tested with "Bakkerij de Gouden Korst" supplier org — verified Logo URL and Delivery areas fields appear, save successfully, and success message displays.

Screenshot: `screenshots/03-04-supplier-profile-edit.png`

### 04-01 Product schema

Added `product` table to the database schema with Drizzle ORM.

- **Schema file**: Created `packages/db/src/product-schema.ts` defining the `product` table with columns: `id` (text PK), `organizationId` (FK to organization), `name`, `description`, `price` (numeric 10,2), `unit`, `category`, `status` (default `draft`), `images` (jsonb array), `createdAt`, `updatedAt`, `archivedAt`.
- **Migration**: Generated and applied migration `0006_small_doctor_spectrum.sql` creating the table with a foreign key constraint to the `organization` table.
- **Schema export**: Updated `packages/db/src/schema.ts` to re-export the product schema.
- **Verified**: Product table created in PostgreSQL with correct column types, constraints, and defaults. App dashboard loads without errors after migration.

Screenshot: `screenshots/04-01-product-schema.png`

### 04-02 Product CRUD API

Built full CRUD API routes for products.

- **POST /api/products**: Creates a new product. Requires authentication and owner role on the specified organization. Accepts `organizationId`, `name`, `description`, `price`, `unit`, `category`, and `images`. Returns 201 with the created product (default status `draft`).
- **GET /api/products?organizationId=**: Lists non-archived products for an organization. Public endpoint (no auth required). Returns products ordered by newest first. Returns 400 if `organizationId` is missing, 404 if the organization doesn't exist.
- **GET /api/products/[id]**: Returns a single product by ID. Public endpoint. Returns 404 if not found.
- **PATCH /api/products/[id]**: Updates a product. Requires authentication and owner role on the product's organization. Supports partial updates — only provided fields are changed. Returns 404 if product not found, 403 if not an owner.
- **POST /api/products/[id]/archive**: Toggles archive state. If the product is active, sets `status` to `archived` and populates `archivedAt`. If already archived, restores it to `draft` status and clears `archivedAt`. Requires authentication and owner role.

Tested all endpoints with "Bakkerij de Gouden Korst" supplier org — verified create (201), list (200), detail (200), update (200), archive (200), restore (200), 404 for missing products, and 400 for missing query params.

Screenshot: `screenshots/04-02-product-crud-api.png`
