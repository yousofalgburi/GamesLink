CREATE TABLE IF NOT EXISTS "game_categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"category" varchar(255) NOT NULL,
	"game_count" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "game_genres" (
	"id" serial PRIMARY KEY NOT NULL,
	"genre" varchar(255) NOT NULL,
	"game_count" integer NOT NULL
);
