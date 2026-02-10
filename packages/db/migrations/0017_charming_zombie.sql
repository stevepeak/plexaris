CREATE TABLE "product_version" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" uuid NOT NULL,
	"version" integer NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"price" numeric(10, 2),
	"unit" text,
	"category" text,
	"images" jsonb DEFAULT '[]'::jsonb,
	"data" jsonb,
	"edited_by" text NOT NULL,
	"note" text,
	"created_at" timestamp NOT NULL
);
--> statement-breakpoint
ALTER TABLE "product" ADD COLUMN "current_version_id" uuid;--> statement-breakpoint
ALTER TABLE "product_version" ADD CONSTRAINT "product_version_product_id_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."product"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_version" ADD CONSTRAINT "product_version_edited_by_user_id_fk" FOREIGN KEY ("edited_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;