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
