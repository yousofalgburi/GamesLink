DO $$ BEGIN
 CREATE TYPE "public"."vote_type" AS ENUM('UP', 'DOWN');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "game_votes" (
	"id" serial PRIMARY KEY NOT NULL,
	"game_id" integer NOT NULL,
	"vote_type" "vote_type",
	CONSTRAINT "game_votes_game_id_unique" UNIQUE("game_id")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "game_votes" ADD CONSTRAINT "game_votes_game_id_processed_games_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."processed_games"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "vote_game_id_idx" ON "game_votes" USING btree ("game_id");