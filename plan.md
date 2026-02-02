@docs/01-authentication.md

Work on this epic.

## Tasks

- [x] **signup-page** — Create `/signup` page with registration form (name, email, password) and "Enter Demo User" button. After signup, redirect to `/dashboard`. <!-- passes: true -->
- [x] **login-page** — Create `/login` page with login form (email, password) and link to signup. After login, redirect to `/dashboard`. <!-- passes: true -->
- [x] **dashboard-page** — Create `/dashboard` page showing authenticated user info with sign-out. Protected route. <!-- passes: true -->
- [x] **auth-redirects** — Update middleware: unauthenticated users go to `/login` (not `/`), authenticated users on `/login`/`/signup` go to `/dashboard`. Home page `/` redirects based on auth state. <!-- passes: true -->
- [x] **org-schema** — Add `organizations` and `memberships` tables to DB schema per the data model. Generate and apply migration. <!-- passes: true -->
- [ ] **org-creation** — Create organization creation flow after signup (choose Supplier or Horeca, enter business details). <!-- passes: false -->
- [ ] **org-switcher** — Add organization switcher in dashboard header for users with multiple orgs. <!-- passes: false -->
- [ ] **user-invitation** — Invite users by email to join an organization. Accept/reject flow. <!-- passes: false -->
- [ ] **user-profile** — Create `/settings/profile` page for editing name, email, password. <!-- passes: false -->
- [ ] **org-settings** — Create `/settings/organization` page for editing org details, viewing members. <!-- passes: false -->
- [ ] **account-management** — Leave org, archive org, archive account flows. <!-- passes: false -->
