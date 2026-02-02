# 04 - Product Catalog & Search

> **Phase:** 4
> **Dependencies:** 01-authentication, 03-supplier-profiles
> **User Stories:** US-008, US-009, US-010, US-022

---

## Overview

The product catalog is the core of the marketplace. Suppliers add and manage products; Horeca users search and discover them. Search must be smart: semantic matching, order-history ranking, and filtering by supplier or category. This phase delivers the primary browsing/discovery experience.

## User Stories

### US-008: Supplier Product Listing

> As a supplier, I want to add products so Horeca businesses can order them directly.

**Acceptance Criteria:**

- Add product form: name, description, price, unit (kg, piece, box, etc.), images
- Product categories/tags
- Edit and archive products
- Products visible in search after adding
- Supplier dashboard shows all their products

---

### US-009: Smart Product Search

> As a Horeca user, I want to search products intelligently so I find what I need quickly.

**Acceptance Criteria:**

- Search bar with text input
- Semantic search: "apple pie" finds "Beukappeltarten Apple Pie", etc.
- Results show: image, description, price, supplier name
- **Previously ordered products ranked first**
- Filter by category, supplier
- Real-time results as user types

---

### US-010: Search by Supplier

> As a Horeca user, I want to search products from a specific supplier.

**Acceptance Criteria:**

- Natural queries like "Show me products from Beukappeltarten"
- Supplier filter in search interface
- View all products from one supplier
- Quick reorder from known suppliers

---

### US-022: Supplier Product Archiving

> As a supplier, I want to archive my products so I can remove items I no longer sell from the active catalog while preserving data relationships to previously sold items.

**Acceptance Criteria:**

- Archive button on each product in supplier dashboard
- Confirmation prompt before archiving
- Archived product removed from catalog and search results
- Archived product remains accessible in order history and reporting
- Supplier can view and restore archived products from their dashboard

---

## Technical Considerations

- **Search infrastructure:** Vector database (Pinecone, Weaviate, or pgvector) for semantic search, combined with traditional text search
- **Embeddings:** Generate embeddings for product name + description on create/update
- **Order-history ranking:** For authenticated Horeca users, boost products they've ordered before in search results
- **Image storage:** Cloud storage for product images, support multiple images per product
- **Categories:** Predefined category list for MVP (bakery, dairy, meat, produce, beverages, etc.)
- **Units:** Standardized unit types (kg, piece, box, liter, case)
- **Archiving:** Products are archived (never deleted) to preserve order history references and data relationships
