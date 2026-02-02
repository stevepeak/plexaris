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
