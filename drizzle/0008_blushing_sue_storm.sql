DROP INDEX IF EXISTS "type_vote_count_idx";--> statement-breakpoint
DROP INDEX IF EXISTS "type_release_date_idx";--> statement-breakpoint
DROP INDEX IF EXISTS "exclusion_idx";--> statement-breakpoint
DROP INDEX IF EXISTS "search_vector_idx";--> statement-breakpoint
DROP INDEX IF EXISTS "genres_idx";--> statement-breakpoint
DROP INDEX IF EXISTS "categories_idx";--> statement-breakpoint
DROP INDEX IF EXISTS "is_free_idx";--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "name_idx" ON "processed_games" USING btree ("name");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "type_idx" ON "processed_games" USING btree ("type");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "vote_count_idx" ON "processed_games" USING btree ("vote_count");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "release_date_idx" ON "processed_games" USING btree ("release_date");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "type_vote_count_id_idx" ON "processed_games" USING btree ("type","vote_count","id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "is_free_type_vote_count_idx" ON "processed_games" USING btree ("is_free","type","vote_count");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "required_age_type_vote_count_idx" ON "processed_games" USING btree ("required_age","type","vote_count");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "type_short_description_idx" ON "processed_games" USING btree ("type","short_description");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "created_at_type_vote_count_idx" ON "processed_games" USING btree ("created_at","type","vote_count");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "updated_at_type_vote_count_idx" ON "processed_games" USING btree ("updated_at","type","vote_count");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "search_vector_idx" ON "processed_games" USING gin (to_tsvector('english', "name" || ' ' || "short_description"));--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "genres_idx" ON "processed_games" USING btree ("genres");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "categories_idx" ON "processed_games" USING btree ("categories");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "is_free_idx" ON "processed_games" USING btree ("is_free");