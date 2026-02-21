-- 1. Create role table
CREATE TABLE "role" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "organization_id" uuid NOT NULL REFERENCES "organization"("id"),
  "name" text NOT NULL,
  "is_system" boolean DEFAULT false NOT NULL,
  "permissions" text[] DEFAULT '{}' NOT NULL,
  "created_at" timestamp NOT NULL,
  "updated_at" timestamp NOT NULL,
  CONSTRAINT "role_organization_id_name_unique" UNIQUE("organization_id", "name")
);
--> statement-breakpoint

-- 2. Insert Admin role (is_system=true, all permissions) for every existing organization
INSERT INTO "role" ("organization_id", "name", "is_system", "permissions", "created_at", "updated_at")
SELECT "id", 'Admin', true,
  ARRAY['create_order','edit_order','place_order','invite_members','manage_roles','manage_agents','manage_products','edit_org_details'],
  NOW(), NOW()
FROM "organization";
--> statement-breakpoint

-- 3. Insert Member role for every existing organization
INSERT INTO "role" ("organization_id", "name", "is_system", "permissions", "created_at", "updated_at")
SELECT "id", 'Member', false,
  ARRAY['create_order','edit_order','place_order'],
  NOW(), NOW()
FROM "organization";
--> statement-breakpoint

-- 4. Add role_id column as nullable to membership and invitation
ALTER TABLE "membership" ADD COLUMN "role_id" uuid;
--> statement-breakpoint
ALTER TABLE "invitation" ADD COLUMN "role_id" uuid;
--> statement-breakpoint

-- 5. Set role_id = admin role where old role = 'owner'
UPDATE "membership" m
SET "role_id" = r."id"
FROM "role" r
WHERE r."organization_id" = m."organization_id"
  AND r."is_system" = true
  AND m."role" = 'owner';
--> statement-breakpoint

-- 6. Set role_id = member role where old role = 'member'
UPDATE "membership" m
SET "role_id" = r."id"
FROM "role" r
WHERE r."organization_id" = m."organization_id"
  AND r."name" = 'Member'
  AND r."is_system" = false
  AND m."role" = 'member';
--> statement-breakpoint

-- 7. Set invitation role_id = admin role where old role = 'owner'
UPDATE "invitation" i
SET "role_id" = r."id"
FROM "role" r
WHERE r."organization_id" = i."organization_id"
  AND r."is_system" = true
  AND i."role" = 'owner';
--> statement-breakpoint

-- 8. Set invitation role_id = member role where old role = 'member'
UPDATE "invitation" i
SET "role_id" = r."id"
FROM "role" r
WHERE r."organization_id" = i."organization_id"
  AND r."name" = 'Member'
  AND r."is_system" = false
  AND i."role" = 'member';
--> statement-breakpoint

-- 9. Make role_id NOT NULL and add FK constraints
ALTER TABLE "membership" ALTER COLUMN "role_id" SET NOT NULL;
--> statement-breakpoint
ALTER TABLE "membership" ADD CONSTRAINT "membership_role_id_role_id_fk" FOREIGN KEY ("role_id") REFERENCES "role"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "invitation" ALTER COLUMN "role_id" SET NOT NULL;
--> statement-breakpoint
ALTER TABLE "invitation" ADD CONSTRAINT "invitation_role_id_role_id_fk" FOREIGN KEY ("role_id") REFERENCES "role"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint

-- 10. Drop old role columns
ALTER TABLE "membership" DROP COLUMN "role";
--> statement-breakpoint
ALTER TABLE "invitation" DROP COLUMN "role";
--> statement-breakpoint

-- 11. Drop membership_role enum type
DROP TYPE "membership_role";
