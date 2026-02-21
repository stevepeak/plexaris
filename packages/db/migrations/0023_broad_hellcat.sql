DELETE FROM "file";--> statement-breakpoint
ALTER TABLE "file" ADD COLUMN "url" text NOT NULL;--> statement-breakpoint
ALTER TABLE "file" ADD COLUMN "key" text NOT NULL;--> statement-breakpoint
ALTER TABLE "file" DROP COLUMN "content";
