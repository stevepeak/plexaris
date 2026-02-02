# Plexaris - Product Requirements Document

> **Status:** ðŸš§ MVP Definition Complete
> **Owner:** Swatantra
> **Last Updated:** 2026-01-31
> **Version:** 2.1

---

## 1. Executive Summary

### 1.1 Vision

Plexaris is a B2B marketplace connecting Horeca businesses (Hotels, Restaurants, CafÃ©s) directly with food suppliers, cutting out traditional distributors like Sligro, Hanos, and Bidfood.

### 1.2 Problem Statement

**The Dutch restaurant industry is facing a crisis:**

- **450 bankruptcies predicted in 2025** (record high) - ABN AMRO
- **Rising food costs** are the #1 cause of restaurant failures
- Restaurants overpay by **20-30%** due to distributor margins
- No price transparency across suppliers
- Ordering is fragmented and time-consuming

### 1.3 Solution

An AI-powered ordering/inventory management platform where Horeca can:

- Find products from their suppliers and add to cart with payment checkout
- Order via natural chat/voice interface
- Save 15-25% by bypassing distributors

### 1.4 Business Model

| User Type       | Pricing                |
| --------------- | ---------------------- |
| Horeca (buyers) | **FREE**               |
| Suppliers       | **3% transaction fee** |

---

## 2. Market Research

### 2.1 The 80/20 Insight

**One problem = 80% of the value:**

> **RISING FOOD COSTS** â†’ Causing 450 bankruptcies in 2025

**One feature = 80% of the solution:**

> **Order Directly from Suppliers** â†’ "I want to order Apple pie from supplier Beukappeltarten"

### 2.2 Market Size (Netherlands)

- ~45,000 Horeca businesses
- Average food spend: â‚¬5,000-15,000/month per restaurant
- 10% savings = â‚¬500-1,500/month per customer
- Market opportunity: â‚¬2.7B+ annual food ordering volume

### 2.3 Supplier Pain Points (Why They'll Join)

| Pain Point                 | Description                                                                   |
| -------------------------- | ----------------------------------------------------------------------------- |
| **Margin Squeeze**         | Suppliers keep 10-15% while middleman takes 35-40% of their hard work         |
| **Hidden Fees**            | Fixed fees, marketing contributions, payment fees - add up to 10%+ of revenue |
| **No Customer Visibility** | No idea who buys products, at what price, or customer satisfaction            |
| **Private Label Threat**   | When product succeeds, distributors copy it with their own label              |

### 2.4 Horeca Pain Points (Why They'll Use It)

| Pain Point              | Description                                                 |
| ----------------------- | ----------------------------------------------------------- |
| **High Food Costs**     | Overpaying 20-30% through distributors                      |
| **Fragmented Ordering** | Multiple suppliers, multiple phone calls, multiple invoices |
| **No Smart Reordering** | Have to remember what to order each time                    |
| **Time Consuming**      | Hours spent on ordering every week                          |

---

## 3. User Personas

### 3.1 Horeca Owner (Primary)

**"Restaurant Romy"**

- Runs a 40-seat restaurant in Amsterdam
- Spends â‚¬8,000/month on food supplies
- Currently orders from Sligro + 3 local suppliers

**Pains:**

- Cost of food is high
- Need to find quality products faster
- Want easy restocking via chat/voice interface
- Want to order directly from suppliers

**Goals:**

- Save money on food costs
- Find quality products faster
- All from one smart interface
- System remembers previous orders
- Products ranked by order history
- Proactive suggestions based on past orders

### 3.2 Supplier (Primary)

**"Beukappeltarten Bakery"**

- Artisan bakery currently supplying to wholesale only
- Wants to reach Horeca directly

**Pains:**

- Can't supply directly to restaurants
- Sligro squeezing margins with bad prices
- No visibility on who buys products
- No knowledge of customer satisfaction
- Risk of private label copies

**Goals:**

- More direct Horeca customers
- Direct relationships with buyers
- Better margins (keep more than 10-15%)
- Customer visibility and feedback

**Note:** Some supplier info already scraped from Horecava: https://www.horecava.nl/en/exhibitors

---

## 4. Feature Specifications

### 4.1 MVP Epics (Phase 1)

| Epic | Name              | Description                                   |
| ---- | ----------------- | --------------------------------------------- |
| E1   | Authentication    | Registration, login, profile management       |
| E2   | Supplier Profiles | Claiming, editing, product management         |
| E3   | Product Catalog   | Listings, smart search, order history ranking |
| E4   | AI Interface      | Chat, voice input, natural language ordering  |
| E5   | Cart & Checkout   | Cart, Stripe payment, order confirmation      |
| E6   | Smart Reordering  | Order history, proactive suggestions          |
| E7   | Supplier Scraping | Horecava import, claim tokens                 |

### 4.2 User Stories (MVP)

---

#### Epic 1: Authentication & User Management

**US-001: Supplier Registration**

> As a supplier, I want to register an account so I can list my products and reach Horeca directly.

Acceptance Criteria:

- Registration form: company name, email, password, phone, address
- Email verification flow
- Redirect to supplier dashboard after verification
- Account created with 'supplier' role

---

**US-002: Horeca Registration**

> As a Horeca business owner, I want to register so I can order supplies directly from suppliers.

Acceptance Criteria:

- Registration form: business name, email, password, phone, address
- Email verification flow
- Redirect to Horeca dashboard after verification
- MVP: Single user account (no employee structure)

---

**US-003: User Login**

> As a registered user, I want to log in to access my account.

Acceptance Criteria:

- Login form with email + password
- Supports both supplier and Horeca users
- Role-based redirect to appropriate dashboard
- Error handling for invalid credentials

---

**US-004: Horeca Settings & Profile**

> As a Horeca user, I want to manage my account settings.

Acceptance Criteria:

- Edit business name, phone, address
- Change email (with verification)
- Reset/change password
- Update delivery address

---

**US-005: Supplier Settings & Profile**

> As a supplier, I want to manage my account settings.

Acceptance Criteria:

- Edit company name, contact info, address
- Change email (with verification)
- Reset/change password
- Update logo and company description
- View transaction history

---

#### Epic 2: Supplier Profiles & Claiming

**US-006: Supplier Profile Claim Flow** â­ KEY FEATURE

> As a supplier with a pre-created profile (from Horecava), I want to claim it so I can manage my products.

Acceptance Criteria:

- Claim page accessible via unique token/link
- Shows pre-filled company info from scraped data
- Supplier sets password and verifies email
- Profile status changes from 'unclaimed' to 'claimed'
- Supplier gains full access to edit profile

Notes: Outreach email - "We already have your profile, claim it!"

---

**US-007: Supplier Profile Management**

> As a supplier, I want to edit my company profile so buyers have accurate information.

Acceptance Criteria:

- Edit company name, description, logo, contact info
- Edit address and delivery areas
- Save changes with confirmation
- Public profile visible to Horeca users

---

#### Epic 3: Product Catalog & Search

**US-008: Supplier Product Listing**

> As a supplier, I want to add products so Horeca businesses can order them directly.

Acceptance Criteria:

- Add product form: name, description, price, unit, images
- Product categories/tags
- Edit and delete products
- Products visible in search after adding

---

**US-009: Smart Product Search** â­ CORE FEATURE

> As a Horeca user, I want to search products intelligently so I find what I need quickly.

Acceptance Criteria:

- Search bar with text input
- Semantic search - "apple pie" finds "Beukappeltarten Apple Pie", etc.
- Results show: IMAGE, DESCRIPTION, PRICE, SUPPLIER NAME
- **Previously ordered products ranked FIRST** â­
- Filter by category, supplier
- Real-time results as user types

---

**US-010: Search by Supplier**

> As a Horeca user, I want to search products from a specific supplier.

Acceptance Criteria:

- "Show me products from Beukappeltarten"
- Supplier filter in search
- View all products from one supplier
- Quick reorder from known suppliers

---

#### Epic 4: AI Chat & Voice Interface

**US-011: AI Chat Interface** â­ KEY DIFFERENTIATOR

> As a Horeca user, I want to chat with AI to find and order products naturally.

Acceptance Criteria:

- Chat UI with message input
- AI understands: "I need apple pies from Beukappeltarten"
- AI searches products and shows results inline as cards
- Each card shows: IMAGE, DESCRIPTION, PRICE, SUPPLIER
- User can say "add to cart" and AI adds item
- Conversation history preserved in session

---

**US-012: Voice Input for Ordering** â­ KEY DIFFERENTIATOR

> As a Horeca user, I want to speak my order so I can order hands-free.

Acceptance Criteria:

- Microphone button in chat interface
- Speech-to-text converts voice to text
- Transcribed text sent to AI chat
- Works on mobile and desktop browsers
- Visual feedback while recording

---

**US-013: Proactive Suggestions**

> As a Horeca user, I want the AI to suggest products I usually order.

Acceptance Criteria:

- AI says "You usually order apple pies on Thursdays. Want me to add them?"
- Suggestions based on order history patterns
- Quick "Yes, add to cart" response
- Learn from user preferences over time

---

#### Epic 5: Cart & Checkout

**US-014: Shopping Cart**

> As a Horeca user, I want to add products to my cart so I can order multiple items.

Acceptance Criteria:

- Add to cart from search/chat
- Cart icon shows item count
- View cart with all items, quantities, prices
- Edit quantities and remove items
- Cart persists across sessions
- Shows items grouped by supplier

---

**US-015: Checkout & Order Placement**

> As a Horeca user, I want to checkout so I can place my order.

Acceptance Criteria:

- Review order summary before payment
- Confirm delivery address
- One order to Plexaris (even if multiple suppliers)
- Order created with status 'pending payment'
- Order confirmation shown after payment

---

**US-016: Stripe Payment Integration**

> As a Horeca user, I want to pay via Stripe so my order is confirmed.

Acceptance Criteria:

- Stripe checkout session created
- Redirect to Stripe payment page
- Handle successful payment - order status 'paid'
- Handle failed payment - show error, order stays pending
- 3% fee calculated and recorded for supplier billing

---

**US-017: Order Confirmation Emails**

> As a Horeca user, I want to receive an order confirmation email.

Acceptance Criteria:

- Email sent to Horeca user after successful payment
- Email contains: order number, items, quantities, prices, total
- Email contains: delivery address
- Email sent to Plexaris team for manual supplier coordination (MVP)

---

#### Epic 6: Smart Reordering & History

**US-018: Order History Dashboard**

> As a Horeca user, I want to see my past orders so I can track purchases and reorder easily.

Acceptance Criteria:

- View list of all past orders with date, total, status
- Click order to see full details (items, quantities, supplier)
- Order statuses: pending, paid, processing, delivered
- Search/filter orders by date range
- **Quick "Reorder" button** to add all items from past order to cart

---

**US-019: Frequently Ordered Products**

> As a Horeca user, I want to see my frequently ordered products for quick access.

Acceptance Criteria:

- Dashboard widget showing top 10 most ordered products
- One-click add to cart
- Shows last order date and quantity
- Feeds into AI suggestions

---

#### Epic 7: Supplier Scraping & Import

**US-020: Horecava Supplier Scraper**

> As an admin, I want to scrape Horecava exhibitors so we have supplier profiles ready.

Acceptance Criteria:

- Scrape exhibitor list from https://www.horecava.nl/en/exhibitors
- Extract: company name, email, phone, website, description
- Store as unclaimed supplier profiles
- Generate unique claim tokens
- Export list for outreach campaign

Notes: Some suppliers already scraped, continue scraping remaining.

---

**US-021: Admin Order Notification for Manual Logistics**

> As an admin, I want to receive an email with complete order details after payment so I can arrange logistics manually.

Acceptance Criteria:

- Email sent to admin email address after successful payment
- Email contains complete order details (items, quantities, prices, total)
- Email contains full Horeca info (business name, contact, delivery address, phone)
- Email contains full Supplier info (company name, contact, email, phone) for each supplier in order
- Clear formatting for easy manual coordination
- Sent immediately after payment confirmation

Notes: MVP approach - Plexaris team manually coordinates with suppliers for delivery.

---

**US-022: Supplier Product Deletion**

> As a supplier, I want to delete my products so I can remove items I no longer sell.

Acceptance Criteria:

- Delete button on each product in supplier dashboard
- Confirmation prompt before deletion
- Product removed from catalog and search results
- Historical order data retained (for records)

---

**US-023: Account Deletion (Horeca & Supplier)**

> As a Horeca or Supplier user, I want to delete my account so I can remove my data from the platform.

Acceptance Criteria:

- Delete account option in settings
- Confirmation prompt with warning about data loss
- Email confirmation required to proceed
- Account marked as deleted (soft delete for records)
- User logged out after deletion
- Cannot log in after deletion

---

**US-024: Admin Account Management**

> As an admin, I want to delete Horeca and Supplier accounts so I can manage the platform.

Acceptance Criteria:

- Admin dashboard with list of all Horeca accounts
- Admin dashboard with list of all Supplier accounts
- Delete option for each account
- Confirmation prompt before deletion
- Soft delete (data retained for records)
- Audit log of admin actions

---

### 4.3 Phase 2 Features (Post-MVP)

| Story     | Description                              |
| --------- | ---------------------------------------- |
| US-P2-001 | Employee invites (multi-user per Horeca) |
| US-P2-002 | Role management (Owner/Manager/Employee) |
| US-P2-003 | Shared organization cart                 |
| US-P2-004 | Recurring orders / scheduled reorders    |
| US-P2-005 | Inventory integration                    |
| US-P2-006 | Price comparison across suppliers        |
| US-P2-007 | Supplier ratings and reviews             |
| US-P2-008 | Automated supplier order routing         |

---

## 5. Technical Considerations

### 5.1 Key Technology Choices (TBD)

- **Frontend:** TBD (React/Next.js recommended)
- **Backend:** TBD
- **AI/RAG:** Vector database + LLM for smart search
- **Voice:** Web Speech API or Whisper
- **Payments:** Stripe Connect (marketplace model)
- **Database:** TBD

### 5.2 Integrations

- Stripe (payments, 3% fee handling)
- Email service (transactional emails)
- Speech-to-text API
- LLM API (Claude/GPT for chat)

---

## 6. Success Metrics

### 6.1 North Star Metric

**Gross Merchandise Value (GMV)** - Total value of orders through platform

### 6.2 Key Metrics

| Metric            | Target (6 months) |
| ----------------- | ----------------- |
| Registered Horeca | 100               |
| Active Suppliers  | 50                |
| Monthly GMV       | â‚¬50,000         |
| Avg order value   | â‚¬500            |
| Repeat order rate | 60%               |

---

## 7. Go-to-Market Strategy

### 7.1 Supplier Acquisition

1. **Scrape Horecava exhibitors** â†’ 500+ supplier profiles (partially done)
2. **Outreach campaign** â†’ "Claim your profile, reach Horeca directly"
3. **Value prop:** Keep more margin, direct customer relationships

### 7.2 Horeca Acquisition

1. **Pilot with 10 restaurants** â†’ Amsterdam focus
2. **Value prop:** "Order from your suppliers directly, save 15-25%"
3. **Smart reordering** â†’ "Never forget what to order"

---

## 8. Risks & Mitigations

| Risk                           | Mitigation                                          |
| ------------------------------ | --------------------------------------------------- |
| Suppliers don't claim profiles | Phone outreach, demonstrate Horeca demand           |
| Chicken-and-egg                | Pre-scrape suppliers, pilot restaurants first       |
| Logistics complexity           | MVP: Suppliers handle delivery, manual coordination |

---

## 9. Open Questions

- [ ] Minimum order amounts per supplier?
- [ ] Credit terms for Horeca (pay later)?
- [ ] How to handle delivery scheduling?
- [ ] Supplier catalog upload support?

---

## Changelog

| Date       | Version | Changes                                                                                           |
| ---------- | ------- | ------------------------------------------------------------------------------------------------- |
| 2026-01-30 | 1.0     | Initial PRD                                                                                       |
| 2026-01-31 | 2.0     | Added market research, competitor analysis                                                        |
| 2026-01-31 | 2.1     | Updated focus: direct supplier ordering, smart reordering, updated personas, supplier pain points |
