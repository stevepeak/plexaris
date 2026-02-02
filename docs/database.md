# Database

PostgreSQL database managed with Drizzle ORM. Migrations live in `packages/db/src/schema/`.

## Entity Relationship Overview

```
user ──< session
user ──< account (OAuth providers)
user ──< verification (tokens)
user ──< membership >── organization
organization ──< invitation
organization ──< product (supplier orgs only)
product ──< product_image
user ──< cart >── organization
cart ──< cart_item >── product
organization ──< order (horeca orgs only)
order ──< order_item >── product
order ──< order_item >── organization (supplier)
user ──< chat_conversation
chat_conversation ──< chat_message
user ──< audit_log (admin users)
```

Legend: `──<` = one-to-many, `>──` = many-to-one

---

## Tables

### Authentication (Phase 1) — Implemented

These tables exist today via Better Auth.

#### user

A person on the platform. Separated from organizations to support multi-org membership.

| Column        | Type      | Constraints      | Notes               |
| ------------- | --------- | ---------------- | ------------------- |
| id            | text      | PK               |                     |
| name          | text      | NOT NULL         |                     |
| email         | text      | NOT NULL, UNIQUE | Login identifier    |
| emailVerified | boolean   | NOT NULL         |                     |
| image         | text      |                  | Profile picture URL |
| createdAt     | timestamp | NOT NULL         |                     |
| updatedAt     | timestamp | NOT NULL         |                     |

#### session

| Column    | Type      | Constraints         | Notes               |
| --------- | --------- | ------------------- | ------------------- |
| id        | text      | PK                  |                     |
| token     | text      | NOT NULL, UNIQUE    |                     |
| expiresAt | timestamp | NOT NULL            |                     |
| userId    | text      | NOT NULL, FK → user |                     |
| ipAddress | text      |                     | Captured at login   |
| userAgent | text      |                     | Browser/device info |
| createdAt | timestamp | NOT NULL            |                     |
| updatedAt | timestamp | NOT NULL            |                     |

#### account

OAuth provider connections. Also stores password credentials for email/password auth.

| Column                | Type      | Constraints         | Notes                           |
| --------------------- | --------- | ------------------- | ------------------------------- |
| id                    | text      | PK                  |                                 |
| userId                | text      | NOT NULL, FK → user |                                 |
| providerId            | text      | NOT NULL            | e.g. google, github, credential |
| accountId             | text      | NOT NULL            | Provider's user ID              |
| accessToken           | text      |                     |                                 |
| refreshToken          | text      |                     |                                 |
| idToken               | text      |                     | OpenID token                    |
| accessTokenExpiresAt  | timestamp |                     |                                 |
| refreshTokenExpiresAt | timestamp |                     |                                 |
| scope                 | text      |                     |                                 |
| password              | text      |                     | Hashed, for email provider only |
| createdAt             | timestamp | NOT NULL            |                                 |
| updatedAt             | timestamp | NOT NULL            |                                 |

#### verification

Tokens for email verification, password resets, and account recovery.

| Column     | Type      | Constraints | Notes                                |
| ---------- | --------- | ----------- | ------------------------------------ |
| id         | text      | PK          |                                      |
| identifier | text      | NOT NULL    | What's being verified (email, phone) |
| value      | text      | NOT NULL    | Token/code                           |
| expiresAt  | timestamp | NOT NULL    |                                      |
| createdAt  | timestamp | NOT NULL    |                                      |
| updatedAt  | timestamp |             |                                      |

---

### Organizations & Memberships (Phase 1 extension)

#### organization

A business entity — either a supplier or a horeca buyer.

| Column          | Type      | Constraints                   | Notes                              |
| --------------- | --------- | ----------------------------- | ---------------------------------- |
| id              | text      | PK                            |                                    |
| name            | text      | NOT NULL                      | Business name                      |
| type            | text      | NOT NULL                      | `supplier` or `horeca`             |
| status          | text      | NOT NULL, DEFAULT `unclaimed` | `unclaimed`, `claimed`, `archived` |
| description     | text      |                               | Public-facing bio                  |
| logoUrl         | text      |                               |                                    |
| phone           | text      |                               |                                    |
| email           | text      |                               | Contact email (not login)          |
| address         | text      |                               | Business address                   |
| deliveryAddress | text      |                               | Horeca only: where orders ship     |
| createdAt       | timestamp | NOT NULL                      |                                    |
| updatedAt       | timestamp | NOT NULL                      |                                    |
| archivedAt      | timestamp |                               | Soft delete timestamp              |

Indexes: `type`, `status`

#### membership

Join table linking users to organizations with a role.

| Column         | Type      | Constraints                 | Notes               |
| -------------- | --------- | --------------------------- | ------------------- |
| id             | text      | PK                          |                     |
| userId         | text      | NOT NULL, FK → user         |                     |
| organizationId | text      | NOT NULL, FK → organization |                     |
| role           | text      | NOT NULL, DEFAULT `member`  | `owner` or `member` |
| createdAt      | timestamp | NOT NULL                    |                     |
| updatedAt      | timestamp | NOT NULL                    |                     |

Indexes: UNIQUE(`userId`, `organizationId`)

#### invitation

Pending invitations to join an organization.

| Column         | Type      | Constraints                 | Notes                 |
| -------------- | --------- | --------------------------- | --------------------- |
| id             | text      | PK                          |                       |
| organizationId | text      | NOT NULL, FK → organization |                       |
| email          | text      | NOT NULL                    | Invitee email         |
| token          | text      | NOT NULL, UNIQUE            | URL-safe invite token |
| expiresAt      | timestamp | NOT NULL                    |                       |
| acceptedAt     | timestamp |                             | Null until accepted   |
| createdAt      | timestamp | NOT NULL                    |                       |

---

### Supplier Profiles & Products (Phases 2–4)

#### product

Items listed for sale by supplier organizations.

| Column         | Type      | Constraints                 | Notes                                  |
| -------------- | --------- | --------------------------- | -------------------------------------- |
| id             | text      | PK                          |                                        |
| organizationId | text      | NOT NULL, FK → organization | Supplier org                           |
| name           | text      | NOT NULL                    |                                        |
| description    | text      |                             |                                        |
| price          | numeric   | NOT NULL                    | Unit price in EUR                      |
| unit           | text      | NOT NULL                    | `kg`, `piece`, `box`, `liter`, `bunch` |
| category       | text      |                             | e.g. dairy, produce, meat              |
| archivedAt     | timestamp |                             | Soft delete; preserves order history   |
| createdAt      | timestamp | NOT NULL                    |                                        |
| updatedAt      | timestamp | NOT NULL                    |                                        |

Indexes: `organizationId`, `category`

#### product_image

| Column    | Type    | Constraints            | Notes         |
| --------- | ------- | ---------------------- | ------------- |
| id        | text    | PK                     |               |
| productId | text    | NOT NULL, FK → product |               |
| url       | text    | NOT NULL               |               |
| order     | integer | NOT NULL, DEFAULT 0    | Display order |

#### product_embedding

Vector embeddings for semantic product search.

| Column    | Type         | Constraints                    | Notes                        |
| --------- | ------------ | ------------------------------ | ---------------------------- |
| id        | text         | PK                             |                              |
| productId | text         | NOT NULL, FK → product, UNIQUE |                              |
| embedding | vector(1536) | NOT NULL                       | OpenAI-compatible dimensions |
| createdAt | timestamp    | NOT NULL                       |                              |

Indexes: vector index on `embedding` (cosine similarity)

#### claim_token

Tokens sent to suppliers to claim their pre-seeded profiles (from Horecava scrape).

| Column         | Type      | Constraints                 | Notes              |
| -------------- | --------- | --------------------------- | ------------------ |
| id             | text      | PK                          |                    |
| organizationId | text      | NOT NULL, FK → organization |                    |
| email          | text      | NOT NULL                    |                    |
| token          | text      | NOT NULL, UNIQUE            |                    |
| expiresAt      | timestamp | NOT NULL                    |                    |
| usedAt         | timestamp |                             | Null until claimed |
| createdAt      | timestamp | NOT NULL                    |                    |

---

### AI Chat (Phase 5)

#### chat_conversation

| Column         | Type      | Constraints                 | Notes              |
| -------------- | --------- | --------------------------- | ------------------ |
| id             | text      | PK                          |                    |
| userId         | text      | NOT NULL, FK → user         |                    |
| organizationId | text      | NOT NULL, FK → organization | Active org context |
| createdAt      | timestamp | NOT NULL                    |                    |

Indexes: `userId`

#### chat_message

| Column         | Type      | Constraints                      | Notes                         |
| -------------- | --------- | -------------------------------- | ----------------------------- |
| id             | text      | PK                               |                               |
| conversationId | text      | NOT NULL, FK → chat_conversation |                               |
| role           | text      | NOT NULL                         | `user`, `assistant`, `system` |
| content        | text      | NOT NULL                         |                               |
| createdAt      | timestamp | NOT NULL                         |                               |

Indexes: `conversationId`

---

### Cart & Orders (Phase 6)

#### cart

Persistent cart per user per organization.

| Column         | Type      | Constraints                 | Notes      |
| -------------- | --------- | --------------------------- | ---------- |
| id             | text      | PK                          |            |
| userId         | text      | NOT NULL, FK → user         |            |
| organizationId | text      | NOT NULL, FK → organization | Horeca org |
| createdAt      | timestamp | NOT NULL                    |            |
| updatedAt      | timestamp | NOT NULL                    |            |

Indexes: UNIQUE(`userId`, `organizationId`)

#### cart_item

| Column    | Type      | Constraints            | Notes                 |
| --------- | --------- | ---------------------- | --------------------- |
| id        | text      | PK                     |                       |
| cartId    | text      | NOT NULL, FK → cart    |                       |
| productId | text      | NOT NULL, FK → product |                       |
| quantity  | numeric   | NOT NULL               | Respects product unit |
| createdAt | timestamp | NOT NULL               |                       |
| updatedAt | timestamp | NOT NULL               |                       |

Indexes: UNIQUE(`cartId`, `productId`)

#### order

A completed purchase by a horeca organization. One order can contain items from multiple suppliers.

| Column                | Type      | Constraints                 | Notes                                                       |
| --------------------- | --------- | --------------------------- | ----------------------------------------------------------- |
| id                    | text      | PK                          |                                                             |
| horecaOrgId           | text      | NOT NULL, FK → organization | Buying org                                                  |
| userId                | text      | NOT NULL, FK → user         | Who placed the order                                        |
| status                | text      | NOT NULL, DEFAULT `pending` | `pending`, `confirmed`, `shipped`, `delivered`, `cancelled` |
| totalAmount           | numeric   | NOT NULL                    | Sum of all order items                                      |
| stripeSessionId       | text      |                             | Stripe Checkout session                                     |
| stripePaymentIntentId | text      |                             | For refunds/lookups                                         |
| createdAt             | timestamp | NOT NULL                    |                                                             |
| updatedAt             | timestamp | NOT NULL                    |                                                             |

Indexes: `horecaOrgId`, `createdAt DESC`

#### order_item

Line items within an order. Captures supplier and price at time of purchase (denormalized for history).

| Column        | Type    | Constraints                 | Notes                     |
| ------------- | ------- | --------------------------- | ------------------------- |
| id            | text    | PK                          |                           |
| orderId       | text    | NOT NULL, FK → order        |                           |
| productId     | text    | NOT NULL, FK → product      |                           |
| supplierOrgId | text    | NOT NULL, FK → organization | Supplier at time of order |
| quantity      | numeric | NOT NULL                    |                           |
| unitPrice     | numeric | NOT NULL                    | Price at time of order    |
| totalPrice    | numeric | NOT NULL                    | quantity × unitPrice      |
| supplierFee   | numeric | NOT NULL                    | 3% of totalPrice          |

Indexes: `orderId`, `supplierOrgId`, `productId`

#### stripe_event

Idempotency log for Stripe webhook processing.

| Column    | Type      | Constraints      | Notes                             |
| --------- | --------- | ---------------- | --------------------------------- |
| id        | text      | PK               |                                   |
| eventId   | text      | NOT NULL, UNIQUE | Stripe event ID                   |
| eventType | text      | NOT NULL         | e.g. `checkout.session.completed` |
| status    | text      | NOT NULL         | `processed`, `failed`             |
| createdAt | timestamp | NOT NULL         |                                   |

---

### Admin (Phase 8)

#### audit_log

Records admin actions for compliance and debugging.

| Column      | Type      | Constraints         | Notes                                         |
| ----------- | --------- | ------------------- | --------------------------------------------- |
| id          | text      | PK                  |                                               |
| adminUserId | text      | NOT NULL, FK → user |                                               |
| action      | text      | NOT NULL            | e.g. `archive_organization`, `delete_product` |
| targetType  | text      | NOT NULL            | e.g. `organization`, `user`, `product`        |
| targetId    | text      | NOT NULL            | ID of the affected entity                     |
| details     | jsonb     |                     | Arbitrary metadata about the action           |
| createdAt   | timestamp | NOT NULL            |                                               |

Indexes: `createdAt DESC`, `targetType + targetId`

---

## Key Design Decisions

**User ≠ Organization.** A user is a person; an organization is a business. The `membership` table connects them. This supports multi-org ownership, team collaboration, and consultants managing multiple businesses without schema changes.

**Soft deletes everywhere.** Organizations, products, and users are archived via an `archivedAt` timestamp — never hard deleted. Order history references remain intact.

**Order items denormalize price and supplier.** `order_item` stores `unitPrice`, `totalPrice`, and `supplierOrgId` at time of purchase. If a product's price changes or a supplier is archived, historical orders remain accurate.

**One order, many suppliers.** A single order can contain products from multiple suppliers. `order_item.supplierOrgId` tracks which supplier fulfills each line item. The 3% fee is calculated and stored per item.

**Persistent cart per org.** A user has one cart per horeca organization. Switching orgs shows a different cart. Cart items reference products directly and are cleared on checkout.

**Vector search via pgvector.** `product_embedding` stores OpenAI-compatible embeddings for semantic search. Indexed with cosine similarity for nearest-neighbor queries.

**Stripe as payment rail.** Orders link to Stripe Checkout sessions. The `stripe_event` table provides idempotent webhook processing. Supplier payouts (via Stripe Connect) are a Phase 2 concern.

**Unclaimed supplier profiles.** Suppliers are pre-seeded from the Horecava exhibitor scrape with `status = 'unclaimed'`. Claim tokens let the real business owner take control of their profile.
