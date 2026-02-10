CREATE TYPE "public"."schedule_frequency" AS ENUM('daily', 'weekly', 'biweekly', 'monthly');--> statement-breakpoint
CREATE TYPE "public"."schedule_type" AS ENUM('org_information_update', 'product_updating', 'competitive_analysis', 'reduce_cost_analysis');--> statement-breakpoint
CREATE TABLE "agent_schedule" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"name" text,
	"schedule_type" "schedule_type" NOT NULL,
	"frequency" "schedule_frequency" NOT NULL,
	"cron" text NOT NULL,
	"urls" text[] DEFAULT '{}' NOT NULL,
	"trigger_schedule_id" text,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	CONSTRAINT "agent_schedule_organization_id_schedule_type_unique" UNIQUE("organization_id","schedule_type")
);
--> statement-breakpoint
ALTER TABLE "agent_schedule" ADD CONSTRAINT "agent_schedule_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE no action ON UPDATE no action;