DO $$ BEGIN
 CREATE TYPE "public"."game_type" AS ENUM('game', 'dlc', 'mod', 'video');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "achievements" (
	"id" serial PRIMARY KEY NOT NULL,
	"game_id" integer NOT NULL,
	"name" varchar(255) NOT NULL,
	"path" varchar(255) NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "content_descriptors" (
	"id" serial PRIMARY KEY NOT NULL,
	"game_id" integer NOT NULL,
	"ids" text NOT NULL,
	"notes" text,
	CONSTRAINT "content_descriptors_game_id_unique" UNIQUE("game_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "demos" (
	"id" serial PRIMARY KEY NOT NULL,
	"game_id" integer NOT NULL,
	"appid" integer NOT NULL,
	"description" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "linux_requirements" (
	"id" serial PRIMARY KEY NOT NULL,
	"game_id" integer NOT NULL,
	"minimum" text NOT NULL,
	"recommended" text,
	CONSTRAINT "linux_requirements_game_id_unique" UNIQUE("game_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "mac_requirements" (
	"id" serial PRIMARY KEY NOT NULL,
	"game_id" integer NOT NULL,
	"minimum" text NOT NULL,
	"recommended" text,
	CONSTRAINT "mac_requirements_game_id_unique" UNIQUE("game_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "metacritics" (
	"id" serial PRIMARY KEY NOT NULL,
	"game_id" integer NOT NULL,
	"url" varchar(255),
	"score" integer,
	CONSTRAINT "metacritics_game_id_unique" UNIQUE("game_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "movies" (
	"id" serial PRIMARY KEY NOT NULL,
	"game_id" integer NOT NULL,
	"name" varchar(255) NOT NULL,
	"thumbnail" varchar(255) NOT NULL,
	"webm" varchar(255) NOT NULL,
	"mp4" varchar(255) NOT NULL,
	"highlight" boolean NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "package_groups" (
	"id" serial PRIMARY KEY NOT NULL,
	"game_id" integer NOT NULL,
	"name" varchar(255) NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"selection_text" text NOT NULL,
	"save_text" text,
	"display_type" integer NOT NULL,
	"is_recurring_subscription" varchar(50) NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "pc_requirements" (
	"id" serial PRIMARY KEY NOT NULL,
	"game_id" integer NOT NULL,
	"minimum" text NOT NULL,
	"recommended" text,
	CONSTRAINT "pc_requirements_game_id_unique" UNIQUE("game_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "price_overviews" (
	"id" serial PRIMARY KEY NOT NULL,
	"game_id" integer NOT NULL,
	"currency" varchar(10) NOT NULL,
	"initial" integer NOT NULL,
	"final" integer NOT NULL,
	"discount_percent" integer NOT NULL,
	"initial_formatted" varchar(50) NOT NULL,
	"final_formatted" varchar(50) NOT NULL,
	CONSTRAINT "price_overviews_game_id_unique" UNIQUE("game_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "processed_games" (
	"id" serial PRIMARY KEY NOT NULL,
	"steam_appid" integer,
	"name" varchar(255) NOT NULL,
	"type" "game_type" DEFAULT 'game' NOT NULL,
	"short_description" text,
	"required_age" integer DEFAULT 0 NOT NULL,
	"is_free" boolean DEFAULT false NOT NULL,
	"header_image" varchar(255),
	"release_date" timestamp with time zone,
	"developers" text[],
	"genres" text[],
	"categories" text[],
	"vote_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"dlc" text,
	"detailed_description" text,
	"about_the_game" text,
	"supported_languages" text,
	"reviews" text,
	"capsule_image" varchar(255),
	"capsule_image_v5" varchar(255),
	"website" varchar(255),
	"publishers" text[],
	"recommendations" integer,
	"background" varchar(255),
	"background_raw" varchar(255),
	"packages" text,
	"ext_user_account_notice" text,
	"legal_notice" text,
	"controller_support" varchar(50),
	"fullgame" text,
	"additional_data" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ratings" (
	"id" serial PRIMARY KEY NOT NULL,
	"game_id" integer NOT NULL,
	"source" varchar(255) NOT NULL,
	"rating_generated" varchar(255) NOT NULL,
	"rating" varchar(255) NOT NULL,
	"required_age" varchar(50) NOT NULL,
	"banned" varchar(50) NOT NULL,
	"use_age_gate" varchar(50) NOT NULL,
	"descriptors" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "screenshots" (
	"id" serial PRIMARY KEY NOT NULL,
	"game_id" integer NOT NULL,
	"path_thumbnail" varchar(255) NOT NULL,
	"path_full" varchar(255) NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "subs" (
	"id" serial PRIMARY KEY NOT NULL,
	"package_group_id" integer NOT NULL,
	"package_id" integer NOT NULL,
	"percent_savings_text" varchar(50),
	"percent_savings" integer NOT NULL,
	"option_text" varchar(255) NOT NULL,
	"option_description" text,
	"can_get_free_license" varchar(50) NOT NULL,
	"is_free_license" boolean NOT NULL,
	"price_in_cents_with_discount" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "support_info" (
	"id" serial PRIMARY KEY NOT NULL,
	"game_id" integer NOT NULL,
	"url" varchar(255),
	"email" varchar(255),
	CONSTRAINT "support_info_game_id_unique" UNIQUE("game_id")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "achievements" ADD CONSTRAINT "achievements_game_id_processed_games_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."processed_games"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "content_descriptors" ADD CONSTRAINT "content_descriptors_game_id_processed_games_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."processed_games"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "demos" ADD CONSTRAINT "demos_game_id_processed_games_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."processed_games"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "linux_requirements" ADD CONSTRAINT "linux_requirements_game_id_processed_games_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."processed_games"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "mac_requirements" ADD CONSTRAINT "mac_requirements_game_id_processed_games_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."processed_games"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "metacritics" ADD CONSTRAINT "metacritics_game_id_processed_games_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."processed_games"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "movies" ADD CONSTRAINT "movies_game_id_processed_games_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."processed_games"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "package_groups" ADD CONSTRAINT "package_groups_game_id_processed_games_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."processed_games"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "pc_requirements" ADD CONSTRAINT "pc_requirements_game_id_processed_games_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."processed_games"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "price_overviews" ADD CONSTRAINT "price_overviews_game_id_processed_games_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."processed_games"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ratings" ADD CONSTRAINT "ratings_game_id_processed_games_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."processed_games"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "screenshots" ADD CONSTRAINT "screenshots_game_id_processed_games_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."processed_games"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "subs" ADD CONSTRAINT "subs_package_group_id_package_groups_id_fk" FOREIGN KEY ("package_group_id") REFERENCES "public"."package_groups"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "support_info" ADD CONSTRAINT "support_info_game_id_processed_games_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."processed_games"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "achievement_game_id_idx" ON "achievements" USING btree ("game_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "content_descriptors_game_id_idx" ON "content_descriptors" USING btree ("game_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "demo_game_id_appid_idx" ON "demos" USING btree ("game_id","appid");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "linux_req_game_id_idx" ON "linux_requirements" USING btree ("game_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "mac_req_game_id_idx" ON "mac_requirements" USING btree ("game_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "metacritic_game_id_idx" ON "metacritics" USING btree ("game_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "movie_game_id_id_idx" ON "movies" USING btree ("game_id","id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "package_group_game_id_idx" ON "package_groups" USING btree ("game_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "pc_req_game_id_idx" ON "pc_requirements" USING btree ("game_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "price_overview_game_id_idx" ON "price_overviews" USING btree ("game_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "name_idx" ON "processed_games" USING btree ("name");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "type_idx" ON "processed_games" USING btree ("type");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "is_free_idx" ON "processed_games" USING btree ("is_free");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "vote_count_idx" ON "processed_games" USING btree ("vote_count");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "genres_idx" ON "processed_games" USING btree ("genres");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "categories_idx" ON "processed_games" USING btree ("categories");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "release_date_idx" ON "processed_games" USING btree ("release_date");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "steam_appid_idx" ON "processed_games" USING btree ("steam_appid");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "type_vote_count_id_idx" ON "processed_games" USING btree ("type","vote_count","id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "is_free_type_vote_count_idx" ON "processed_games" USING btree ("is_free","type","vote_count");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "required_age_type_vote_count_idx" ON "processed_games" USING btree ("required_age","type","vote_count");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "search_vector_idx" ON "processed_games" USING gin (to_tsvector('english', "name" || ' ' || "short_description"));--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "type_name_idx" ON "processed_games" USING btree ("type","name");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "type_short_description_idx" ON "processed_games" USING btree ("type","short_description");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "created_at_type_vote_count_idx" ON "processed_games" USING btree ("created_at","type","vote_count");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "updated_at_type_vote_count_idx" ON "processed_games" USING btree ("updated_at","type","vote_count");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "rating_game_id_source_idx" ON "ratings" USING btree ("game_id","source");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "screenshot_game_id_id_idx" ON "screenshots" USING btree ("game_id","id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "sub_package_group_id_idx" ON "subs" USING btree ("package_group_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "support_info_game_id_idx" ON "support_info" USING btree ("game_id");