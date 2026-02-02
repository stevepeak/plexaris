# Activity Log

## 2026-02-02 — signup-page

Created the signup page and supporting auth flow:

- **`/signup`** page with registration form (full name, email, password) and "Enter Demo User" button
- **`/login`** page with sign-in form and link to signup
- **`/dashboard`** page showing authenticated user info with sign-out button
- Updated middleware to redirect unauthenticated users to `/login` and authenticated users on auth routes to `/dashboard`
- Home page `/` now redirects based on auth state
- Created `plexaris` database and ran initial auth migration (user, session, account, verification tables)
- Demo user flow: click "Enter Demo User" on signup, auto-creates `demo@plexaris.com` account and redirects to dashboard

Screenshots: `screenshots/signup-page.png`, `screenshots/signup-page-demo-flow.png`

## 2026-02-02 — login-page

Verified and improved the login page:

- **`/login`** page with email and password form, error handling for invalid credentials, and redirect to `/dashboard` on success
- Replaced plain `<a>` tag with Next.js `<Link>` for client-side navigation to `/signup`
- Tested full login flow: sign out → enter credentials → sign in → dashboard redirect
- Tested error handling: invalid credentials display "Invalid email or password" message

Screenshots: `screenshots/login-page.png`

## 2026-02-02 — dashboard-page

Improved the dashboard page with authenticated user info and sign-out:

- **Header bar** with "Plexaris" branding, user name, and avatar with initials fallback
- **User profile card** showing avatar, name, email with icons, and welcome message
- **Sign-out button** that clears the session and redirects to `/login`
- **Skeleton loading state** while session data is being fetched
- **Protected route** via middleware — unauthenticated access to `/dashboard` redirects to `/login`

Screenshots: `screenshots/dashboard-page.png`

## 2026-02-02 — auth-redirects

Updated middleware to handle all auth redirects server-side:

- **Middleware** now intercepts `/` (home page) in addition to protected and auth routes
- Unauthenticated users visiting `/` or any protected route (`/dashboard`, `/settings`, `/profile`) are redirected to `/login`
- Authenticated users visiting `/login` or `/signup` are redirected to `/dashboard`
- Authenticated users visiting `/` are redirected to `/dashboard`
- **Home page** (`app/page.tsx`) simplified to a server component with a fallback `redirect('/login')` — all real redirect logic lives in middleware
- Removed client-side `useSession` + `useEffect` redirect pattern from home page, eliminating the "Redirecting..." flash

Screenshots: `screenshots/auth-redirects.png`

## 2026-02-02 — org-schema

Added `organization`, `membership`, and `invitation` tables to the database schema:

- **`organization`** table with columns: id, name, type (supplier/horeca), status (unclaimed/claimed/archived), description, logoUrl, phone, email, address, deliveryAddress, createdAt, updatedAt, archivedAt (soft delete)
- **`membership`** table linking users to organizations with role (owner/member), unique constraint on (userId, organizationId)
- **`invitation`** table for pending org invitations with token (unique), expiresAt, and acceptedAt
- Created Drizzle schema in `packages/db/src/org-schema.ts` and exported from `packages/db/src/schema.ts`
- Generated migration `0001_flawless_paper_doll.sql` and applied it to the database
- All foreign keys reference `user.id` and `organization.id` as appropriate
- Verified all 7 tables exist in the database: user, session, account, verification, organization, membership, invitation

Screenshots: `screenshots/org-schema.png`

## 2026-02-02 — org-creation

Created organization creation flow after signup:

- **`/onboarding`** page with two-step flow: (1) choose org type (Supplier or Horeca), (2) enter business details
- **Type selection** step with descriptive cards for Supplier and Horeca, each with icon and description
- **Details form** with fields: business name (required), description, phone, contact email, business address, and delivery address (Horeca only)
- **API route** `POST /api/organizations` creates organization with status `claimed` and membership with role `owner` in a single request
- **API route** `GET /api/organizations/mine` returns the current user's organizations (used by middleware)
- **Middleware** updated to check org membership: authenticated users without orgs are redirected to `/onboarding`, users with orgs on `/onboarding` are redirected to `/dashboard`
- **Signup page** updated to redirect to `/onboarding` after account creation
- Full flow: signup → onboarding (type select → details form → submit) → dashboard

Screenshots: `screenshots/org-creation.png`

## 2026-02-02 — org-switcher

Added organization switcher to the dashboard header:

- **`OrgSwitcher` component** (`components/org-switcher.tsx`) with dropdown menu showing all user organizations, active org indicator (checkmark), org type and role labels, and "Create organization" link
- **`useActiveOrg` hook** fetches orgs from `/api/organizations/mine`, persists active org selection in localStorage (`plexaris:activeOrgId`), and restores it on reload
- **Dashboard header** updated with org switcher between "Plexaris" branding and user profile, separated by a vertical divider
- **Trigger button** displays active org name, type badge, building icon, and chevron indicator
- **Dropdown items** show org name, type, role, and checkmark for the currently active org
- **"Create organization"** option at the bottom navigates to `/onboarding`
- **Storybook story** (`components/org-switcher.stories.tsx`) with Default (multiple orgs), SingleOrg, and Loading variants

Screenshots: `screenshots/org-switcher.png`, `screenshots/org-switcher-open.png`

## 2026-02-02 — user-invitation

Added user invitation flow to invite members by email and accept/reject from the dashboard:

- **Schema update**: Added `invited_by`, `role`, and `rejected_at` columns to the `invitation` table. Generated and applied migration `0002_yielding_captain_marvel.sql`
- **Exported `isNull`** from `@app/db` for null-checking queries
- **API route** `POST /api/invitations` — create an invitation (org owners only), with checks for duplicate members and pending invites
- **API route** `GET /api/invitations?organizationId=xxx` — list all invitations for an org (members can view)
- **API route** `GET /api/invitations/pending` — list pending invitations for the current user's email
- **API route** `POST /api/invitations/[id]/accept` — accept an invitation (creates membership, marks invite accepted)
- **API route** `POST /api/invitations/[id]/reject` — reject an invitation (marks invite rejected)
- **`InviteMembers` component** (`components/invite-members.tsx`) with invite dialog, invitation list, status badges (pending/accepted/rejected/expired), and success banner
- **`PendingInvitations` component** (`components/pending-invitations.tsx`) with accept/reject buttons per invitation, org name/type display, and auto-refresh on action
- **Dashboard** updated to show pending invitations at the top and org invitation management at the bottom
- **`useActiveOrg` hook** updated to accept a `refreshKey` parameter for re-fetching orgs after accepting an invitation
- **Storybook stories** for `InviteMembersList` (WithInvitations, Empty, MemberView, Loading) and `PendingInvitationsList` (WithInvitations, SingleInvitation)

Screenshots: `screenshots/user-invitation.png`

## 2026-02-02 — user-profile

Created `/settings/profile` page for editing name, email, and password:

- **`/settings/profile`** page with back button to dashboard, profile edit form, and password change form
- **`ProfileFormFields` component** (`components/profile-form.tsx`) with two card sections:
  - **Profile card**: editable name field, read-only email field (with "Email cannot be changed" note), save button that disables when name hasn't changed, success/error feedback
  - **Password card**: current password, new password, confirm new password fields with client-side validation (match check, min 8 chars), success/error feedback
- **Name updates** via `authClient.updateUser({ name })` (better-auth built-in)
- **Password changes** via `authClient.changePassword({ currentPassword, newPassword })` (better-auth built-in)
- **Dashboard updated** with two navigation paths to profile settings: clickable avatar in header and "Profile settings" button in user card
- **Storybook stories** (`components/profile-form.stories.tsx`) with Default, Loading, and ReadOnly variants
- No custom API routes needed — leverages better-auth's built-in endpoints

Screenshots: `screenshots/user-profile.png`

## 2026-02-02 — org-settings

Created `/settings/organization` page for editing org details and viewing members:

- **`/settings/organization`** page with back button to dashboard, org details form, and member list
- **`OrgSettingsFormFields` component** (`components/org-settings-form.tsx`) with two card sections:
  - **Organization details card**: business name, description, phone, contact email, business address, delivery address (horeca only), org type badge, save button (owners only), disabled fields for non-owners
  - **Members card**: list of all org members with name, email, and role badge (owner badge with crown icon)
- **API route** `GET /api/organizations/[id]` — fetch org details with membership authorization check, returns org + user role
- **API route** `PATCH /api/organizations/[id]` — update org details (owners only), validates name required
- **API route** `GET /api/organizations/[id]/members` — list org members with user names and emails
- **Dashboard updated** with "Organization settings" button linking to `/settings/organization`
- **`OrgSettings` container component** fetches org details and members in parallel, passes data to presentational component
- **Storybook stories** (`components/org-settings-form.stories.tsx`) with OwnerView, MemberView, HorecaOrg, and Loading variants

Screenshots: `screenshots/org-settings.png`

## 2026-02-02 — account-management

Added leave org, archive org, and archive account flows:

- **Schema update**: Added `archivedAt` column to the `user` table for soft-delete support. Generated and applied migration `0003_wide_makkari.sql`
- **API route** `POST /api/organizations/[id]/leave` — leave an organization (members only; owners must archive instead)
- **API route** `POST /api/organizations/[id]/archive` — soft-delete an organization (owners only), sets `status = 'archived'` and `archivedAt` timestamp
- **API route** `POST /api/account/archive` — archive the current user's account (must archive owned orgs first), removes all memberships, soft-deletes user, revokes all sessions
- **`/api/organizations/mine`** updated to filter out archived organizations (by `status` and `archivedAt`)
- **Organization settings** (`/settings/organization`) updated with a "Danger zone" card:
  - **Owners** see "Archive organization" button with AlertDialog confirmation
  - **Members** see "Leave organization" button with AlertDialog confirmation
  - Both actions redirect to `/dashboard` after completion and clear the active org from localStorage
- **Profile settings** (`/settings/profile`) updated with a "Danger zone" card:
  - "Archive account" button with AlertDialog confirmation
  - Shows error if user still owns organizations
  - Redirects to `/login` after successful archival
- **Storybook stories** updated for `OrgSettingsFormFields` (OwnerView and MemberView now include danger zone actions) and `ProfileFormFields` (Default now includes archive account)

Screenshots: `screenshots/account-management.png`, `screenshots/account-management-org-settings.png`, `screenshots/account-management-archive-org-dialog.png`, `screenshots/account-management-profile-settings.png`, `screenshots/account-management-archive-account-dialog.png`
