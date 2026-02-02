# 03 - Supplier Profiles & Claiming

> **Phase:** 3
> **Dependencies:** 01-authentication, 02-supplier-data-import
> **User Stories:** US-006, US-007

---

## Overview

With supplier data imported and claim tokens generated, suppliers need the ability to claim their pre-created profiles and manage their company information. Claiming a profile creates (or links to) a **Supplier organization** in the system, following the user/organization model from 01-authentication. The claiming user becomes the organization `owner`.

## User Stories

### US-006: Supplier Profile Claim Flow

> As a supplier with a pre-created profile (from Horecava), I want to claim it so I can manage my products.

**Acceptance Criteria:**

- Claim page accessible via unique token/link (e.g., `/claim/<token>`)
- Shows pre-filled company info from scraped data
- Two paths depending on auth state:
  - **New user:** registers a personal account, then the scraped profile becomes their Supplier organization (owner role)
  - **Existing user:** logs in, scraped profile is added as a new Supplier organization on their account (owner role)
- Organization status changes from `unclaimed` to `claimed`
- User gains full access to edit the organization's profile and products
- Invalid or expired tokens show appropriate error

**Notes:** Outreach email template: "We already have your profile, claim it!"

---

### US-007: Supplier Profile Management

> As a supplier organization member, I want to edit my company profile so buyers have accurate information.

**Acceptance Criteria:**

- Edit company name, description, logo, contact info
- Edit address and delivery areas
- Save changes with confirmation
- Public profile visible to Horeca users
- Profile page shows the organization's products (once product catalog is built)
- Only `owner` role can edit profile in MVP

---

## Technical Considerations

- **Claim flow:** Token in URL -> show profile preview -> register or login -> create organization from scraped data -> assign owner membership -> mark as claimed
- **Token security:** Tokens are single-use, expire after a set period
- **Logo upload:** Image upload to cloud storage (S3, Cloudflare R2, or similar)
- **Delivery areas:** Simple text field for MVP, structured geo data for Phase 2
- **Public profiles:** Read-only view accessible to Horeca users, showing company info and products
- **Scraped data migration:** When claimed, the scraped supplier record becomes a full Organization record with type `supplier`
