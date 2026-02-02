CREATE TABLE "claim_token" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"email" text NOT NULL,
	"token" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"used_at" timestamp,
	"created_at" timestamp NOT NULL,
	CONSTRAINT "claim_token_token_unique" UNIQUE("token")
);
--> statement-breakpoint
ALTER TABLE "claim_token" ADD CONSTRAINT "claim_token_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE no action ON UPDATE no action;