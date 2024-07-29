CREATE INDEX IF NOT EXISTS "type_genres_categories_idx" ON "processed_games" USING btree ("type","genres","categories");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "sorting_idx" ON "processed_games" USING btree ("type","vote_count","name","release_date");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "exclusion_idx" ON "processed_games" USING gin ((
              to_tsvector('english', "name") ||
              to_tsvector('english', "short_description")
            ));