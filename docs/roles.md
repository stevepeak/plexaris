# Roles & Permissions System

## Overview

Replace the binary `owner`/`member` model with a proper roles system. Roles are org-scoped entities with granular permissions. Every org gets a non-editable **Admin** role. The org creator is auto-assigned Admin. At least 1 admin must exist at all times.

---

## Permissions

```
create_order      — Create new orders
edit_order        — Edit existing orders
place_order       — Submit/place orders
invite_members    — Invite new team members
manage_roles      — Create, edit, delete roles and assign roles to members
manage_agents     — Manage AI agents and schedules
manage_products   — Add, edit, archive products
edit_org_details  — Edit organization name, description, contact info, etc.
```

The **Admin** role has all permissions and cannot be edited or deleted.

A default **Member** role is created with basic permissions (`create_order`, `edit_order`, `place_order`) and can be customized.

---

## Database Changes

### New table: `role`

| Column          | Type      | Notes                                                           |
| --------------- | --------- | --------------------------------------------------------------- |
| id              | uuid      | PK, auto-generated                                              |
| organization_id | uuid      | FK → organization, NOT NULL                                     |
| name            | text      | NOT NULL                                                        |
| is_system       | boolean   | NOT NULL, default false. True = Admin role (cannot edit/delete) |
| permissions     | text[]    | NOT NULL, default []. Array of permission strings               |
| created_at      | timestamp | NOT NULL                                                        |
| updated_at      | timestamp | NOT NULL                                                        |

Unique constraint on `(organization_id, name)`.

### Changed: `membership` table

- Remove: `role` column (membership_role enum: 'owner' | 'member')
- Add: `role_id` uuid FK → role.id, NOT NULL

### Changed: `invitation` table

- Remove: `role` column (membership_role enum)
- Add: `role_id` uuid FK → role.id, NOT NULL

### Removed: `membership_role` enum

Dropped entirely.

### Migration data steps

1. Create `role` table
2. Insert Admin role (is_system=true, all permissions) for every existing organization
3. Insert Member role for every existing organization
4. Add `role_id` column as nullable to membership and invitation
5. Set `role_id` = admin role ID where old role = 'owner'
6. Set `role_id` = member role ID where old role = 'member'
7. Make `role_id` NOT NULL, add FK constraint
8. Drop old `role` columns
9. Drop `membership_role` enum type

### Schema file

`packages/db/src/org-schema.ts`:

- Add `PERMISSIONS`, `ALL_PERMISSIONS`, `ADMIN_ROLE_NAME`, `DEFAULT_MEMBER_PERMISSIONS` constants
- Add `role` table definition
- Change `membership.role` → `membership.roleId` (uuid FK)
- Change `invitation.role` → `invitation.roleId` (uuid FK)
- Remove `membershipRoleEnum`

---

## Server-side Permission Helpers

### `apps/web/lib/permissions.ts` (new)

```ts
checkPermission(userId, orgId, permission)
  → Joins membership + role
  → System roles (isSystem=true) pass all permission checks
  → Returns role info if authorized, null otherwise

checkMembership(userId, orgId)
  → Returns membership + role info for any role
  → Used for "is a member" checks

isAdmin(userId, orgId)
  → Returns true if user's role has isSystem === true
```

### `apps/web/lib/permissions-client.ts` (new)

```ts
hasPermission(permissions: string[], permission: string): boolean
  → Simple array.includes check for client-side UI gating
```

---

## API Routes

### New routes

**`GET /api/organizations/[id]/roles`**

- Auth: any org member
- Returns all roles for the org

**`POST /api/organizations/[id]/roles`**

- Auth: `manage_roles` permission
- Body: `{ name, permissions[] }`
- Validates name not empty, permissions valid, name not "Admin"
- Creates custom role

**`PATCH /api/organizations/[id]/roles/[roleId]`**

- Auth: `manage_roles` permission
- Blocks editing system roles (isSystem=true)
- Body: `{ name?, permissions[]? }`

**`DELETE /api/organizations/[id]/roles/[roleId]`**

- Auth: `manage_roles` permission
- Blocks deleting system roles
- Blocks deleting if any memberships or invitations reference this role

**`PATCH /api/organizations/[id]/members/[membershipId]/role`**

- Auth: `manage_roles` permission
- Body: `{ roleId }`
- If removing someone from Admin: ensures at least 1 admin remains

### Updated routes

| Route                                  | Old check                                       | New check                                                     |
| -------------------------------------- | ----------------------------------------------- | ------------------------------------------------------------- |
| `POST /api/organizations`              | Creates membership with `role: 'owner'`         | Creates Admin + Member roles, assigns Admin roleId            |
| `GET /api/organizations/mine`          | Returns `role` string, `soleOwner`              | Returns `roleId, roleName, isAdmin, permissions`, `soleAdmin` |
| `GET /api/organizations/[id]`          | Returns `role: membership.role`                 | Joins role table, returns role object                         |
| `PATCH /api/organizations/[id]`        | `role === 'owner'`                              | `checkPermission('edit_org_details')`                         |
| `POST /api/organizations/[id]/archive` | `role === 'owner'`                              | `isAdmin()`                                                   |
| `POST /api/organizations/[id]/leave`   | Sole-owner check                                | Sole-admin check (count isSystem roles)                       |
| `GET /api/organizations/[id]/members`  | Returns `role` string                           | Joins role table, returns roleId, roleName, isSystemRole      |
| `POST /api/invitations`                | `role === 'owner'`, body has `role` string      | `checkPermission('invite_members')`, body has `roleId`        |
| `GET /api/invitations`                 | Returns `role` string                           | Joins role table, returns `roleName`                          |
| `POST /api/invitations/[id]/accept`    | Creates membership with `role: invitation.role` | Uses `roleId: invitation.roleId`                              |
| `GET /api/invitations/pending`         | Returns `role` string                           | Joins role table, returns `roleName`                          |
| `POST /api/products`                   | `role === 'owner'`                              | `checkPermission('manage_products')`                          |
| `PATCH /api/products/[id]`             | `role === 'owner'`                              | `checkPermission('manage_products')`                          |
| `POST /api/products/[id]/archive`      | `role === 'owner'`                              | `checkPermission('manage_products')`                          |
| `POST /api/claim/[token]`              | `role: 'owner'`                                 | Creates Admin + Member roles, assigns Admin roleId            |

### tRPC routes (no changes)

The `verifyMembership` helpers in `packages/api/src/routers/` (order, agent-schedule, suggestion, trigger-run, notification) only check membership existence, not role. These remain unchanged.

---

## Email Template

`packages/email/emails/user-invite.tsx`:

- Change `role: 'owner' | 'member'` prop to `roleName: string`
- Update text: `as a {roleName}` instead of conditional owner/member string

---

## UI Changes

### Type updates

**`apps/web/components/org-switcher.tsx`** — `Organization` type:

```ts
{
  id: string
  name: string
  type: 'supplier' | 'horeca'
  claimed: boolean
  logoUrl: string | null
  roleId: string
  roleName: string
  isAdmin: boolean
  permissions: string[]
}
```

**`apps/web/components/profile-form.tsx`** — `OrgMembership` type:

```ts
{
  id: string
  name: string
  roleName: string
  isAdmin: boolean
  soleAdmin: boolean
}
```

**`apps/web/app/(app)/settings/profile/page.tsx`** — Update inline type to match.

### Org page tab config (`apps/web/app/(app)/orgs/[orgId]/page.tsx`)

Add Roles tab just above Team in `TAB_CONFIG`:

```ts
{ value: 'roles', label: 'Roles', icon: Shield, iconColor: 'text-orange-500' }
```

Add `<RolesTab>` content pane. Replace all `isOwner={activeOrg.role === 'owner'}` with `permissions={activeOrg.permissions}` and `isAdmin={activeOrg.isAdmin}`.

Conditionally show Roles tab only for users with `manage_roles` permission or isAdmin.

### New component: Roles tab (`apps/web/components/org-page/roles-tab.tsx`)

- Fetches roles via GET /api/organizations/[id]/roles
- Lists roles: name, permission count, member count, system badge
- Admin role: lock icon, "System" badge, no edit/delete buttons
- "Create role" button → dialog with name input + permission checkboxes (8 permissions listed with labels)
- Edit role → same dialog pre-filled
- Delete role → confirm dialog (shows error if members are assigned)
- Companion `roles-tab.stories.tsx`

### Updated: Members tab (`apps/web/components/org-page/members-tab.tsx`)

- Member type: `roleId`, `roleName`, `isSystemRole` instead of `role` string
- Role badge shows role name (Admin gets crown icon + special styling)
- Role-change dropdown per member (visible when user has `manage_roles` permission)
- Calls PATCH /api/organizations/[id]/members/[membershipId]/role
- Error toast for "cannot remove last admin"
- Props: `permissions: string[]`, `isAdmin: boolean` instead of `isOwner: boolean`

### Updated: Invite members (`apps/web/components/invite-members.tsx`)

- Add role selector (Select component) in invite dialog
- Fetches available roles for the org
- Passes `roleId` instead of `role: 'member'` to POST /api/invitations
- Props: `permissions: string[]` instead of `isOwner: boolean`
- Invite button gated on `hasPermission(permissions, 'invite_members')`

### Updated: Settings tab (`apps/web/components/org-page/settings-tab.tsx`)

- Replace `isOwner` state with permission-based checks
- Edit fields gated on `edit_org_details` permission
- Archive gated on isAdmin check

### Updated: Products tab + product list

- `apps/web/components/org-page/products-tab.tsx`: replace `isOwner` with `permissions`
- `apps/web/components/product-list.tsx`: replace `isOwner` with `permissions`, gate on `manage_products`

### Updated story files

All `.stories.tsx` that pass `isOwner` updated to use `permissions`:

- `members-tab.stories.tsx`
- `products-tab.stories.tsx`
- `invite-members.stories.tsx`
- `product-list.stories.tsx`
- `org-switcher.stories.tsx`
- `profile-form.stories.tsx`
- `pending-invitations.stories.tsx`

---

## Guards & Edge Cases

### Minimum 1 admin

Enforced in 3 places:

1. **Role assignment** (PATCH member role): If removing someone from Admin, count remaining admins, block if count would reach 0
2. **Leave org** (POST leave): If user has Admin role, count admins, block if sole admin
3. **System role protection**: Admin role cannot be deleted → implicit guard

### System role protection

- Cannot edit Admin role name or permissions (PATCH returns 400)
- Cannot delete Admin role (DELETE returns 400)
- UI: edit/delete buttons hidden for system roles

### Org claim flow

When claiming an org (POST /api/claim/[token]):

- Create Admin + Member roles for the org (first-time setup)
- Assign claiming user the Admin role

---

## Implementation Order

1. Schema changes in `packages/db/src/org-schema.ts`
2. Generate migration, manually edit SQL, apply migration
3. Create permission helpers (`permissions.ts`, `permissions-client.ts`)
4. Update org creation route (create Admin + Member roles)
5. Update `/api/organizations/mine` (return role object)
6. Update `/api/organizations/[id]` (return role, permission-check PATCH)
7. Update all other existing API routes
8. Create new API routes (roles CRUD, member role assignment)
9. Update email template
10. Update client types (org-switcher, profile-form, settings profile page)
11. Update org page (add Roles tab, update prop passing)
12. Create roles-tab component + stories
13. Update members-tab + stories
14. Update invite-members + stories
15. Update settings-tab, products-tab, product-list + stories
16. `bun run fix && bun run knip:fix` then `bun run ci`

---

## Verification

1. **Migration**: role table exists, Admin + Member roles seeded for existing orgs, membership/invitation rows have valid roleId
2. **Org creation**: New org → Admin + Member roles created, creator assigned Admin
3. **Roles tab**: Lists roles, Admin is locked, can create/edit/delete custom roles
4. **Team tab**: Role names on member cards, role reassignment works
5. **Invite flow**: Role selector in dialog, invited user gets correct role on accept
6. **Permission gating**: Limited-permission member can't access restricted actions
7. **Admin guard**: Cannot remove last admin's Admin role
8. **CI**: `bun run fix && bun run knip:fix` then `bun run ci` passes
