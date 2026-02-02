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

### 04-03 Supplier product dashboard

Added a product list view to the supplier dashboard.

- **ProductList component**: Created `components/product-list.tsx` — a presentational component that displays products in a table with Name, Category, Price, and Status columns. Shows loading skeleton while fetching, empty state with icon when no products exist, and an "Add Product" button for owners. Prices are formatted as EUR with unit suffix (e.g., "€ 2,75 / piece"). Status badges use appropriate variants: default (active), secondary (draft), outline (archived).
- **Dashboard integration**: Updated the dashboard page to fetch and display products when the active organization is a supplier. Uses the existing `GET /api/products?organizationId=` API endpoint. The product list only appears for supplier-type organizations and refreshes when switching orgs.
- **Storybook**: Full coverage with stories for loading, with products, empty owner, empty member, member view, and no prices states.

Tested with "Bakkerij de Gouden Korst" supplier org — verified product table displays 2 seeded products (Croissant and Artisan Sourdough Bread) with correct prices, categories, and status badges. Add Product button visible for owner.

Screenshot: `screenshots/04-03-supplier-product-dashboard.png`

### 04-04 Product add/edit form

Built a reusable product form component used for both creating and editing products.

- **ProductForm component**: Created `components/product-form.tsx` — a presentational form component with fields for name (required text input), description (textarea), price (EUR number input), unit (select: piece, kg, liter, box, bag, bunch), and category (select: Bread, Pastry, Dairy, Meat, Fish, Produce, Beverages, Ingredients, Other). Adapts title and submit button text based on whether a product is passed (edit mode) or not (add mode). Includes back arrow button, cancel button, loading spinner on submit, and error display. Pre-populates all fields when editing an existing product.
- **Dashboard integration**: Updated the dashboard page to manage a `productView` state that switches between list, add form, and edit form views. Clicking "Add Product" shows the empty form. Clicking a product row in the table opens the edit form pre-filled with that product's data. On successful create/edit, returns to the product list which auto-refreshes. Cancel returns to the list without changes.
- **ProductList update**: Added `onEditProduct` callback prop to `ProductList`. Product table rows are clickable for owners, showing a pointer cursor and triggering the edit flow.
- **Storybook**: Full coverage with stories for add product, edit product, edit minimal product, loading, with error, and no cancel button states.

Tested with "Bakkerij de Gouden Korst" supplier org — verified add form displays correctly, created "Volkoren Brood" product with all fields populated, verified it appears in the list, clicked to edit, renamed to "Volkoren Brood (Groot)", confirmed update persisted.

Screenshots: `screenshots/04-04-product-form-add.png`, `screenshots/04-04-product-form-edit.png`, `screenshots/04-04-product-form.png`

### 04-05 Product archive/restore

Added archive and restore functionality to the product list.

- **API update**: Extended `GET /api/products` to accept an `archived=true` query parameter. When set, returns only archived products (where `archivedAt` is not null) instead of active ones.
- **ProductList component**: Refactored into two sub-components:
  - `ProductTable`: Renders the product table with an actions column. For active products, shows an archive icon button that opens a confirmation dialog. For archived products, shows a restore icon button.
  - `ProductList`: The outer component that conditionally renders tabs (Active/Archived) when there are archived products, or just the active table when there are none. Tab headers show product counts. Tabs only appear for owners.
- **Confirmation dialog**: Archive action shows an `AlertDialog` with the product name, warning that archived products won't be visible to customers, and offering Cancel/Archive buttons.
- **Restore**: Clicking the restore icon on an archived product immediately restores it to `draft` status (no confirmation needed). Uses the existing `POST /api/products/[id]/archive` toggle endpoint.
- **Dashboard integration**: Updated the dashboard to fetch both active and archived products in parallel. Added `handleArchiveRestore` handler that calls the archive toggle API and refreshes both lists.
- **Storybook**: Updated stories with new `archivedProducts` prop. Added `WithArchivedProducts` story showing the tabbed view with both active and archived products.

Tested with "Bakkerij de Gouden Korst" supplier org — archived "Croissant", verified it moved to the Archived tab with status badge, restored it back to active list with draft status.

Screenshots: `screenshots/04-05-archive-dialog.png`, `screenshots/04-05-archived-tab.png`, `screenshots/04-05-product-archive-restore.png`

### 04-06 Public product display

Added product display with category filtering to the supplier profile page (`/supplier/[id]`).

- **Supplier API update**: Extended `GET /api/supplier/[id]` to also return the supplier's non-archived products alongside the supplier profile data. Uses the existing `product` table with an `archivedAt IS NULL` filter.
- **ProductCard component**: Inline presentational component within `SupplierProfileCard` showing product name, price with unit (formatted as EUR, e.g. "€ 3,95 / piece"), description (clamped to 2 lines), and category badge.
- **ProductsSection component**: Wraps product cards with a category filter. Shows filter buttons (All + each unique category) when there are multiple categories. Clicking a category button filters the displayed products. Shows total product count in the section heading.
- **SupplierProfileCard update**: Replaced the "No products listed yet" placeholder with the new `ProductsSection` when products exist. Falls back to an empty state with a Package icon when no products are available. Added `products` prop to the component.
- **Supplier profile page update**: Updated `/supplier/[id]` page to pass products from the API response to the `SupplierProfileCard`.
- **Storybook**: Updated stories with product data — added `WithProducts` (multiple categories with filter), `SingleCategory` (one category, no filter buttons), `NoProducts` (empty state), and updated `FullProfile` and `UnclaimedProfile` to include products.

Tested with "Bakkerij de Gouden Korst" supplier org — verified 3 products display with name, description, price, and category badges. Category filter buttons (All, Bread, bakery) filter correctly.

Screenshots: `screenshots/04-06-public-product-display.png`, `screenshots/04-06-product-filter.png`, `screenshots/04-06-all-products.png`
