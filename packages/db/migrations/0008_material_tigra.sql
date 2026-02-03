CREATE TYPE "public"."favorite_target_type" AS ENUM('product', 'supplier', 'recipe');--> statement-breakpoint
CREATE TABLE "favorite" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"target_type" "favorite_target_type" NOT NULL,
	"target_id" uuid NOT NULL,
	"created_at" timestamp NOT NULL,
	CONSTRAINT "favorite_organization_id_target_type_target_id_unique" UNIQUE("organization_id","target_type","target_id")
);
--> statement-breakpoint
ALTER TABLE "favorite" ADD CONSTRAINT "favorite_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE no action ON UPDATE no action;