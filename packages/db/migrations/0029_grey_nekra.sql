CREATE INDEX "account_user_id_idx" ON "account" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "passkey_user_id_idx" ON "passkey" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "session_user_id_idx" ON "session" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "favorite_target_id_idx" ON "favorite" USING btree ("target_id");--> statement-breakpoint
CREATE INDEX "order_item_product_id_idx" ON "order_item" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "order_item_supplier_id_idx" ON "order_item" USING btree ("supplier_id");--> statement-breakpoint
CREATE INDEX "suggestion_target_id_idx" ON "suggestion" USING btree ("target_id");--> statement-breakpoint
CREATE INDEX "agent_schedule_org_id_idx" ON "agent_schedule" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "audit_log_actor_id_idx" ON "audit_log" USING btree ("actor_id");--> statement-breakpoint
CREATE INDEX "audit_log_org_entity_idx" ON "audit_log" USING btree ("organization_id","entity_id");