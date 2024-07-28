DROP INDEX IF EXISTS "name_idx";--> statement-breakpoint
DROP INDEX IF EXISTS "type_idx";--> statement-breakpoint
DROP INDEX IF EXISTS "vote_count_idx";--> statement-breakpoint
DROP INDEX IF EXISTS "release_date_idx";--> statement-breakpoint
DROP INDEX IF EXISTS "type_vote_count_id_idx";--> statement-breakpoint
DROP INDEX IF EXISTS "is_free_type_vote_count_idx";--> statement-breakpoint
DROP INDEX IF EXISTS "required_age_type_vote_count_idx";--> statement-breakpoint
DROP INDEX IF EXISTS "type_short_description_idx";--> statement-breakpoint
DROP INDEX IF EXISTS "created_at_type_vote_count_idx";--> statement-breakpoint
DROP INDEX IF EXISTS "updated_at_type_vote_count_idx";--> statement-breakpoint
DROP INDEX IF EXISTS "is_free_idx";--> statement-breakpoint
DROP INDEX IF EXISTS "genres_idx";--> statement-breakpoint
DROP INDEX IF EXISTS "categories_idx";--> statement-breakpoint
DROP INDEX IF EXISTS "search_vector_idx";--> statement-breakpoint
ALTER TABLE "game_votes" ADD COLUMN "user_id" integer NOT NULL;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "type_vote_count_idx" ON "processed_games" USING btree ("type","vote_count");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "type_release_date_idx" ON "processed_games" USING btree ("type","release_date");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "exclusion_idx" ON "processed_games" USING btree ("name","short_description") WHERE "processed_games"."name" !~* '(sex|nude|nsfw|porn|hentai|adult|furry|slave)' AND 
            "processed_games"."short_description" !~* '(sex|nude|nsfw|porn|hentai|adult|furry|slave)';--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "is_free_idx" ON "processed_games" USING btree ("is_free") WHERE "processed_games"."is_free" = true;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "genres_idx" ON "processed_games" USING gin ("genres");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "categories_idx" ON "processed_games" USING gin ("categories");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "search_vector_idx" ON "processed_games" USING gin (to_tsvector('english', "name" || ' ' || coalesce("short_description", '')));