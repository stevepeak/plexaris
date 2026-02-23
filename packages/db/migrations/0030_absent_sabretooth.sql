ALTER TABLE "order" ADD COLUMN "order_number" integer;--> statement-breakpoint
UPDATE "order" SET "order_number" = sub.rn
FROM (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY organization_id ORDER BY created_at) AS rn
  FROM "order"
) sub
WHERE "order".id = sub.id;--> statement-breakpoint
ALTER TABLE "order" ALTER COLUMN "order_number" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "order" ADD CONSTRAINT "order_org_number_uniq" UNIQUE("organization_id","order_number");
