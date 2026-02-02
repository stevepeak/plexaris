# 02 - Supplier Data Import

> **Phase:** 2 (Data Seeding)
> **Dependencies:** 01-authentication (need user/supplier schema)
> **User Stories:** US-020

---

## Overview

Before suppliers can claim profiles or Horeca can browse products, the platform needs supplier data. This phase covers scraping Horecava exhibitors to pre-populate **unclaimed Supplier organizations** and generating claim tokens for outreach. This is an operational/admin task that seeds the marketplace. Each scraped entry becomes an Organization record with type `supplier` and status `unclaimed`, ready to be claimed by a real user (see 03-supplier-profiles).

## User Stories

### US-020: Horecava Supplier Scraper

> As an admin, I want to scrape Horecava exhibitors so we have supplier profiles ready.

**Acceptance Criteria:**

- Scrape exhibitor list from Horecava exhibitors page
- Extract: company name, email, phone, website, description
- Store as unclaimed supplier profiles in the database
- Generate unique claim tokens per profile
- Export list for outreach campaign (CSV or similar)

**Notes:**

- Some suppliers already scraped; continue with remaining
- Claim tokens should be single-use and expire (e.g., 90 days)
- Scraped profiles should be flagged as `unclaimed`

---

## Technical Considerations

- **Scraping approach:** Server-side script (Node.js or Python), can be run manually or as a one-time job
- **Data storage:** Creates Organization records with `type: supplier`, `status: unclaimed | claimed`
- **Claim tokens:** UUID or short hash, stored alongside the organization record, linked to outreach emails
- **Outreach integration:** Export to CSV with columns: company name, email, claim URL
- **Rate limiting:** Respect Horecava's robots.txt and rate limits
- **Deduplication:** Match on company name + email to avoid duplicates from re-runs

## Deliverables

1. Scraper script that extracts exhibitor data
2. Database seeding script that creates unclaimed supplier profiles
3. Claim token generation
4. CSV export for outreach team
