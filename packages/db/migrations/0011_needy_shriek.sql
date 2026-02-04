CREATE TYPE "public"."notification_type" AS ENUM('order_placed', 'order_cancelled', 'order_returned', 'user_invited', 'user_accepted_invite', 'order_issues');--> statement-breakpoint
CREATE TABLE "notification_preference" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"organization_id" uuid NOT NULL,
	"notification_type" "notification_type" NOT NULL,
	"email" boolean DEFAULT true NOT NULL,
	"sms" boolean DEFAULT true NOT NULL,
	"in_app" boolean DEFAULT true NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	CONSTRAINT "notification_preference_user_id_organization_id_notification_type_unique" UNIQUE("user_id","organization_id","notification_type")
);
--> statement-breakpoint
ALTER TABLE "notification_preference" ADD CONSTRAINT "notification_preference_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification_preference" ADD CONSTRAINT "notification_preference_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE no action ON UPDATE no action;