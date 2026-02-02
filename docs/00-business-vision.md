# Plexaris - Business Vision & Strategy

> **Purpose:** This document captures the high-level business goals, market opportunity, and strategic direction for Plexaris. Individual implementation details are covered in the numbered PRD documents (`01-` through `08-`).

---

## Vision

Plexaris is a B2B marketplace connecting Horeca businesses (Hotels, Restaurants, Cafes) directly with food suppliers, eliminating traditional distributor middlemen.

## Problem

The Dutch restaurant industry faces record bankruptcies (450 predicted in 2025) driven primarily by rising food costs. Restaurants overpay 20-30% due to distributor margins, with no price transparency and fragmented ordering across multiple suppliers.

## Solution

An AI-powered ordering platform where Horeca businesses can discover suppliers, order via natural chat/voice, and save 15-25% by going direct.

## Business Model

| User Type       | Pricing                |
| --------------- | ---------------------- |
| Horeca (buyers) | **Free**               |
| Suppliers       | **3% transaction fee** |

## Market Opportunity

- ~45,000 Horeca businesses in the Netherlands
- Average food spend: EUR 5,000-15,000/month per restaurant
- Market opportunity: EUR 2.7B+ annual food ordering volume

## Target Users

### Horeca Owner

- Spends thousands monthly on food supplies
- Orders from multiple suppliers via phone/email
- Wants lower costs, faster discovery, unified ordering

### Supplier

- Currently sells through distributors at squeezed margins (keeps 10-15%)
- No direct customer relationships or visibility
- Wants direct Horeca access, better margins, customer feedback

## Success Metrics

### North Star

**Gross Merchandise Value (GMV)** - Total value of orders through the platform

### 6-Month Targets

| Metric            | Target     |
| ----------------- | ---------- |
| Registered Horeca | 100        |
| Active Suppliers  | 50         |
| Monthly GMV       | EUR 50,000 |
| Avg order value   | EUR 500    |
| Repeat order rate | 60%        |

## Go-to-Market Strategy

### Supplier Acquisition

1. Scrape Horecava exhibitors (500+ profiles, partially done)
2. Outreach campaign: "Claim your profile, reach Horeca directly"
3. Value prop: Better margins, direct customer relationships

### Horeca Acquisition

1. Pilot with 10 restaurants in Amsterdam
2. Value prop: "Order directly, save 15-25%"
3. Smart reordering as retention driver

## Risks

| Risk                           | Mitigation                                          |
| ------------------------------ | --------------------------------------------------- |
| Suppliers don't claim profiles | Phone outreach, demonstrate Horeca demand           |
| Chicken-and-egg problem        | Pre-scrape suppliers, pilot restaurants first       |
| Logistics complexity           | MVP: Suppliers handle delivery, manual coordination |

## Implementation Roadmap

The MVP is broken into eight implementation phases, each with its own PRD:

| Doc                          | Phase                            | Dependencies |
| ---------------------------- | -------------------------------- | ------------ |
| `01-authentication.md`       | Authentication & User Management | None         |
| `02-supplier-data-import.md` | Supplier Data Import (Horecava)  | 01           |
| `03-supplier-profiles.md`    | Supplier Profiles & Claiming     | 01, 02       |
| `04-product-catalog.md`      | Product Catalog & Search         | 01, 03       |
| `05-ai-chat-voice.md`        | AI Chat & Voice Interface        | 04           |
| `06-cart-checkout.md`        | Cart & Checkout with Payments    | 01, 04       |
| `07-order-management.md`     | Order Management & Reordering    | 06           |
| `08-admin-dashboard.md`      | Admin Dashboard & Operations     | 01, 06       |

## Open Questions

- Minimum order amounts per supplier?
- Credit terms for Horeca (pay later)?
- How to handle delivery scheduling?
- Supplier catalog bulk upload support?

## Phase 2 (Post-MVP)

| Feature               | Description                      |
| --------------------- | -------------------------------- |
| Employee invites      | Multi-user per Horeca business   |
| Role management       | Owner/Manager/Employee roles     |
| Shared org cart       | Organization-level cart          |
| Recurring orders      | Scheduled reorders               |
| Inventory integration | Connect to POS/inventory systems |
| Price comparison      | Compare across suppliers         |
| Supplier ratings      | Reviews and ratings system       |
| Automated routing     | Auto-route orders to suppliers   |
