DROP INDEX IF EXISTS "search_vector_idx";--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "search_vector_idx" ON "processed_games" USING gin ((
              setweight(to_tsvector('english', "name"), 'A') ||
              setweight(to_tsvector('english', "short_description"), 'B')
            ));