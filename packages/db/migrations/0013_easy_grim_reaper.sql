CREATE TYPE "public"."suggestion_action" AS ENUM('create', 'update', 'update_field');--> statement-breakpoint
CREATE TYPE "public"."suggestion_status" AS ENUM('pending', 'accepted', 'rejected', 'dismissed');--> statement-breakpoint
CREATE TYPE "public"."suggestion_target_type" AS ENUM('product', 'organization');--> statement-breakpoint
CREATE TABLE "suggestion" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"target_type" "suggestion_target_type" NOT NULL,
	"target_id" uuid,
	"action" "suggestion_action" NOT NULL,
	"field" text,
	"label" text NOT NULL,
	"current_value" jsonb,
	"proposed_value" jsonb NOT NULL,
	"confidence" text,
	"source" text,
	"reasoning" text,
	"trigger_run_id" text,
	"status" "suggestion_status" DEFAULT 'pending' NOT NULL,
	"reviewed_by" text,
	"reviewed_at" timestamp,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
ALTER TABLE "suggestion" ADD CONSTRAINT "suggestion_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE no action ON UPDATE no action;