DROP INDEX IF EXISTS "type_idx";--> statement-breakpoint
DROP INDEX IF EXISTS "is_free_idx";--> statement-breakpoint
DROP INDEX IF EXISTS "vote_count_idx";--> statement-breakpoint
DROP INDEX IF EXISTS "genres_idx";--> statement-breakpoint
DROP INDEX IF EXISTS "categories_idx";--> statement-breakpoint
DROP INDEX IF EXISTS "type_vote_count_id_idx";--> statement-breakpoint
DROP INDEX IF EXISTS "is_free_type_vote_count_idx";--> statement-breakpoint
DROP INDEX IF EXISTS "required_age_type_vote_count_idx";--> statement-breakpoint
DROP INDEX IF EXISTS "type_genres_categories_idx";--> statement-breakpoint
DROP INDEX IF EXISTS "sorting_idx";--> statement-breakpoint
DROP INDEX IF EXISTS "exclusion_idx";--> statement-breakpoint
DROP INDEX IF EXISTS "type_name_idx";--> statement-breakpoint
DROP INDEX IF EXISTS "type_short_description_idx";--> statement-breakpoint
DROP INDEX IF EXISTS "created_at_type_vote_count_idx";--> statement-breakpoint
DROP INDEX IF EXISTS "updated_at_type_vote_count_idx";--> statement-breakpoint
DROP INDEX IF EXISTS "search_vector_idx";--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "main_query_idx" ON "processed_games" USING btree ("type","vote_count","name","release_date");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "genre_category_idx" ON "processed_games" USING btree ("genres","categories");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "search_vector_idx" ON "processed_games" USING gin ((
                setweight(to_tsvector('english', "name"), 'A') ||
                setweight(to_tsvector('english', "short_description"), 'B')
            ));