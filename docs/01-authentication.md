# 01 - Authentication & User Management

> **Phase:** 1 (Foundation)
> **Dependencies:** None
> **User Stories:** US-001, US-002, US-003, US-004, US-005, US-023

---

## Overview

Authentication is the foundation of the platform. It supports two user roles (Supplier and Horeca), email-based registration/login, and profile management. This must be built first as every other feature depends on knowing who the user is and what role they have.

## User Stories

### US-001: Supplier Registration

> As a supplier, I want to register an account so I can list my products and reach Horeca directly.

**Acceptance Criteria:**

- Registration form: company name, email, password, phone, address
- Email verification flow
- Redirect to supplier dashboard after verification
- Account created with `supplier` role

---

### US-002: Horeca Registration

> As a Horeca business owner, I want to register so I can order supplies directly from suppliers.

**Acceptance Criteria:**

- Registration form: business name, email, password, phone, address
- Email verification flow
- Redirect to Horeca dashboard after verification
- MVP: Single user account (no employee structure)

---

### US-003: User Login

> As a registered user, I want to log in to access my account.

**Acceptance Criteria:**

- Login form with email + password
- Supports both supplier and Horeca users
- Role-based redirect to appropriate dashboard
- Error handling for invalid credentials

---

### US-004: Horeca Settings & Profile

> As a Horeca user, I want to manage my account settings.

**Acceptance Criteria:**

- Edit business name, phone, address
- Change email (with verification)
- Reset/change password
- Update delivery address

---

### US-005: Supplier Settings & Profile

> As a supplier, I want to manage my account settings.

**Acceptance Criteria:**

- Edit company name, contact info, address
- Change email (with verification)
- Reset/change password
- Update logo and company description
- View transaction history

---

### US-023: Account Deletion (Horeca & Supplier)

> As a user, I want to delete my account so I can remove my data from the platform.

**Acceptance Criteria:**

- Delete account option in settings
- Confirmation prompt with warning about data loss
- Email confirmation required to proceed
- Soft delete (data retained for records)
- User logged out after deletion
- Cannot log in after deletion

---

## Technical Considerations

- **Auth approach:** Email + password with email verification (consider Supabase Auth, NextAuth, or similar)
- **Roles:** `supplier`, `horeca`, `admin` stored on user record
- **Password reset:** Standard forgot-password email flow
- **Session management:** JWT or session-based, persisted across browser sessions
- **Soft delete:** Deleted accounts marked as inactive, data retained for order history integrity
