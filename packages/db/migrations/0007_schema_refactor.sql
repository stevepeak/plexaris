-- Create enums
CREATE TYPE "public"."organization_type" AS ENUM('supplier', 'horeca');
--> statement-breakpoint
CREATE TYPE "public"."membership_role" AS ENUM('owner', 'member');
--> statement-breakpoint

-- Drop all foreign keys that reference columns we're changing type on
ALTER TABLE "claim_token" DROP CONSTRAINT "claim_token_organization_id_organization_id_fk";
--> statement-breakpoint
ALTER TABLE "invitation" DROP CONSTRAINT "invitation_organization_id_organization_id_fk";
--> statement-breakpoint
ALTER TABLE "membership" DROP CONSTRAINT "membership_organization_id_organization_id_fk";
--> statement-breakpoint
ALTER TABLE "product" DROP CONSTRAINT "product_organization_id_organization_id_fk";
--> statement-breakpoint

-- Drop unique constraint on membership that references organization_id
ALTER TABLE "membership" DROP CONSTRAINT "membership_user_id_organization_id_unique";
--> statement-breakpoint

-- organization: convert id from text to uuid
ALTER TABLE "organization" ALTER COLUMN "id" SET DATA TYPE uuid USING "id"::uuid;
--> statement-breakpoint
ALTER TABLE "organization" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
--> statement-breakpoint

-- organization: convert type from text to enum
ALTER TABLE "organization" ALTER COLUMN "type" SET DATA TYPE "public"."organization_type" USING "type"::"public"."organization_type";
--> statement-breakpoint

-- organization: add claimed boolean, migrate data from status, drop status
ALTER TABLE "organization" ADD COLUMN "claimed" boolean DEFAULT false NOT NULL;
--> statement-breakpoint
UPDATE "organization" SET "claimed" = true WHERE "status" = 'claimed';
--> statement-breakpoint
ALTER TABLE "organization" DROP COLUMN "status";
--> statement-breakpoint

-- membership: convert id from text to uuid
ALTER TABLE "membership" ALTER COLUMN "id" SET DATA TYPE uuid USING "id"::uuid;
--> statement-breakpoint
ALTER TABLE "membership" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
--> statement-breakpoint

-- membership: convert organization_id from text to uuid
ALTER TABLE "membership" ALTER COLUMN "organization_id" SET DATA TYPE uuid USING "organization_id"::uuid;
--> statement-breakpoint

-- membership: convert role from text to enum (drop default first, re-add after)
ALTER TABLE "membership" ALTER COLUMN "role" DROP DEFAULT;
--> statement-breakpoint
ALTER TABLE "membership" ALTER COLUMN "role" SET DATA TYPE "public"."membership_role" USING "role"::"public"."membership_role";
--> statement-breakpoint
ALTER TABLE "membership" ALTER COLUMN "role" SET DEFAULT 'member'::"public"."membership_role";
--> statement-breakpoint

-- Re-add unique constraint on membership
ALTER TABLE "membership" ADD CONSTRAINT "membership_user_id_organization_id_unique" UNIQUE("user_id","organization_id");
--> statement-breakpoint

-- claim_token: convert id from text to uuid
ALTER TABLE "claim_token" ALTER COLUMN "id" SET DATA TYPE uuid USING "id"::uuid;
--> statement-breakpoint
ALTER TABLE "claim_token" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
--> statement-breakpoint

-- claim_token: convert organization_id from text to uuid
ALTER TABLE "claim_token" ALTER COLUMN "organization_id" SET DATA TYPE uuid USING "organization_id"::uuid;
--> statement-breakpoint

-- invitation: convert id from text to uuid
ALTER TABLE "invitation" ALTER COLUMN "id" SET DATA TYPE uuid USING "id"::uuid;
--> statement-breakpoint
ALTER TABLE "invitation" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
--> statement-breakpoint

-- invitation: convert organization_id from text to uuid
ALTER TABLE "invitation" ALTER COLUMN "organization_id" SET DATA TYPE uuid USING "organization_id"::uuid;
--> statement-breakpoint

-- invitation: convert role from text to enum (drop default first, re-add after)
ALTER TABLE "invitation" ALTER COLUMN "role" DROP DEFAULT;
--> statement-breakpoint
ALTER TABLE "invitation" ALTER COLUMN "role" SET DATA TYPE "public"."membership_role" USING "role"::"public"."membership_role";
--> statement-breakpoint
ALTER TABLE "invitation" ALTER COLUMN "role" SET DEFAULT 'member'::"public"."membership_role";
--> statement-breakpoint

-- product: convert id from text to uuid
ALTER TABLE "product" ALTER COLUMN "id" SET DATA TYPE uuid USING "id"::uuid;
--> statement-breakpoint
ALTER TABLE "product" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
--> statement-breakpoint

-- product: convert organization_id from text to uuid
ALTER TABLE "product" ALTER COLUMN "organization_id" SET DATA TYPE uuid USING "organization_id"::uuid;
--> statement-breakpoint

-- Re-add all foreign keys
ALTER TABLE "claim_token" ADD CONSTRAINT "claim_token_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "invitation" ADD CONSTRAINT "invitation_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "membership" ADD CONSTRAINT "membership_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "product" ADD CONSTRAINT "product_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE no action ON UPDATE no action;
