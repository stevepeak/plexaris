Work on these epics:

- @docs/03-supplier-profiles.md
- @docs/04-product-catalog.md

## Tasks

### Epic 03 — Supplier Profiles & Claiming

- [x] **03-01 Claim API endpoint**: Build `POST /api/claim/[token]` that validates token, checks expiry/usage, returns org preview for GET and processes claim for POST (creates membership, marks token used, sets org status to claimed).
  - passes: true

- [x] **03-02 Claim page UI**: Build `/claim/[token]` page that shows org preview (name, description, address), handles auth (redirect to signup/login if unauthenticated, then return), and calls claim API on confirmation.
  - passes: true

- [x] **03-03 Supplier profile page**: Build `/supplier/[id]` public read-only profile page showing org name, description, logo, contact info, address, and placeholder for products list.
  - passes: true

- [x] **03-04 Supplier profile edit**: Add edit functionality to org settings for supplier orgs — editable fields: name, description, logo URL, phone, email, address, delivery areas. Owner-only access.
  - passes: true

### Epic 04 — Product Catalog

- [ ] **04-01 Product schema**: Add `product` table to DB schema (id, organizationId, name, description, price, unit, category, status, images JSON, createdAt, updatedAt, archivedAt). Generate and run migration.
  - passes: false

- [ ] **04-02 Product CRUD API**: Build API routes for products — `POST /api/products` (create), `GET /api/products?organizationId=` (list), `GET /api/products/[id]` (detail), `PATCH /api/products/[id]` (update), `POST /api/products/[id]/archive` (archive).
  - passes: false

- [ ] **04-03 Supplier product dashboard**: Build product list view in supplier dashboard showing all products with name, price, unit, category, status. Add "Add Product" button.
  - passes: false

- [ ] **04-04 Product add/edit form**: Build product form (name, description, price, unit selector, category selector). Used for both create and edit. Include Storybook story.
  - passes: false

- [ ] **04-05 Product archive/restore**: Add archive button with confirmation dialog to product list. Show archived products in separate tab. Add restore functionality.
  - passes: false

- [ ] **04-06 Public product display**: Show products on supplier profile page (`/supplier/[id]`). Product cards with name, description, price, unit. Filter by category.
  - passes: false
