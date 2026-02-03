# 01 - Authentication & User Management

> **Phase:** 1 (Foundation)
> **Dependencies:** None
> **User Stories:** US-001, US-002, US-003, US-004, US-005, US-025, US-026, US-023

---

## Overview

Authentication is the foundation of the platform. The core architectural decision is the separation of **user accounts** from **organizations** (businesses). A user is a person. An organization is a Supplier or Horeca business. Users create a personal account, then create or join organizations. A single user can belong to multiple organizations (e.g., a consultant managing two restaurants, or someone who runs both a supplier business and a restaurant).

### Data Model

```
User (person)
  ├── has personal profile (name, email, password)
  └── has many Memberships
        ├── each links to an Organization
        └── each has a role (owner, admin, member)

Organization (business)
  ├── type: 'supplier' or 'horeca'
  ├── has business profile (company name, address, logo, etc.)
  └── has many Memberships (users)
```

This model future-proofs for:

- Multiple locations per business
- Employees joining/leaving
- Users switching roles or companies
- Consultants or accountants managing multiple businesses
- Phase 2 role management without schema changes

## User Stories

### US-001: User Registration

> As a person, I want to create an account so I can use the Plexaris platform.

**Acceptance Criteria:**

- Registration form: full name, email, password
- Email verification flow
- After verification, redirect to organization creation/join screen
- Account is role-agnostic (no supplier/horeca choice at this step)

---

### US-002: Organization Creation

> As a registered user, I want to create a Supplier or Horeca organization so I can operate on the platform.

**Acceptance Criteria:**

- Choose organization type: Supplier or Horeca
- **Horeca org:** business name, phone, address, delivery address
- **Supplier org:** company name, phone, address, description, logo
- Creator is assigned `owner` role on the organization
- User is redirected to the organization's dashboard after creation
- A user can create multiple organizations

---

### US-003: User Login

> As a registered user, I want to log in to access my account.

**Acceptance Criteria:**

- Login form with email + password
- After login, land on last-used organization's dashboard
- If user has no organizations, redirect to organization creation
- If user has multiple organizations, show last-used (with switcher accessible)
- Error handling for invalid credentials

---

### US-004: Organization Switching

> As a user belonging to multiple organizations, I want to switch between them.

**Acceptance Criteria:**

- Organization switcher accessible from any page (e.g., header dropdown)
- Shows list of organizations the user belongs to, with type label (Supplier/Horeca)
- Switching changes the active context (dashboard, data, permissions)
- Last-used organization remembered for next login

---

### US-005: User Invitation

> As an organization owner, I want to invite others to join my organization.

**Acceptance Criteria:**

- Invite by email from organization settings
- Invited user receives email with join link
- If invitee has an account, they accept and are added to the organization
- If invitee has no account, link leads to registration then auto-joins the organization
- MVP roles: `owner` and `member` (expand in Phase 2)
- Owner can remove members from the organization

---

### US-025: User Profile Settings

> As a user, I want to manage my personal account settings.

**Acceptance Criteria:**

- Edit full name
- Change email (with verification)
- Reset/change password
- View list of organizations I belong to

---

### US-026: Organization Settings

> As an organization owner, I want to manage my organization's settings.

**Acceptance Criteria:**

- **Horeca org:** edit business name, phone, address, delivery address
- **Supplier org:** edit company name, contact info, address, logo, description
- View members and their roles
- Manage invitations (send, revoke pending)
- View transaction history (for supplier orgs)

---

### US-023: Account & Membership Management

> As a user, I want to leave an organization or archive my account.

**Acceptance Criteria:**

**Leave organization:**

- User can leave any organization they belong to
- If user is the sole owner, they must transfer ownership or archive the organization first
- Confirmation prompt before leaving

**Archive organization:**

- Owner can archive their organization
- Confirmation prompt with warning about deactivation
- Organization marked as archived (data retained for order history integrity)
- All members removed from the organization

**Archive personal account:**

- Archive account option in personal settings
- Must leave or transfer all organizations first
- Confirmation prompt + email confirmation required
- Account marked as archived (data retained for records)
- User logged out, cannot log in again

---

## Technical Considerations

- **Tables:** `users`, `organizations`, `memberships` (join table with role column)
- **Auth approach:** Email + password with email verification (Supabase Auth, NextAuth, or similar)
- **Roles:** MVP has `owner` and `member` on the membership. Phase 2 adds `admin`, `manager`, etc.
- **Active org context:** Stored in session/cookie. All API requests scoped to active organization.
- **Invitation tokens:** UUID, stored with org ID and email, expire after a set period
- **Session management:** JWT or session-based, includes active organization ID
- **Archiving:** Users and organizations are archived (never deleted), marked inactive with data retained for order history
- **Authorization pattern:** Every data-access endpoint checks that the authenticated user has a membership in the relevant organization
