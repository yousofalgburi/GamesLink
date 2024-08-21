ALTER TABLE "game_votes" DROP CONSTRAINT "game_votes_game_id_unique";--> statement-breakpoint
DROP INDEX IF EXISTS "vote_game_id_idx";--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "vote_game_user_idx" ON "game_votes" USING btree ("game_id","user_id");