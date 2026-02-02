ALTER TABLE "invitation" ADD COLUMN "invited_by" text NOT NULL;--> statement-breakpoint
ALTER TABLE "invitation" ADD COLUMN "role" text DEFAULT 'member' NOT NULL;--> statement-breakpoint
ALTER TABLE "invitation" ADD COLUMN "rejected_at" timestamp;--> statement-breakpoint
ALTER TABLE "invitation" ADD CONSTRAINT "invitation_invited_by_user_id_fk" FOREIGN KEY ("invited_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;