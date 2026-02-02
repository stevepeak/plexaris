CREATE TABLE "product" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"price" numeric(10, 2),
	"unit" text,
	"category" text,
	"status" text DEFAULT 'draft' NOT NULL,
	"images" jsonb DEFAULT '[]'::jsonb,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"archived_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "product" ADD CONSTRAINT "product_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE no action ON UPDATE no action;