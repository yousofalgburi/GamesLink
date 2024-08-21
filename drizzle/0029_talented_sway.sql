CREATE TABLE IF NOT EXISTS "roll_results" (
	"id" text PRIMARY KEY NOT NULL,
	"room_id" text NOT NULL,
	"roll_number" integer NOT NULL,
	"games" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "room_id_roll_number_idx" ON "roll_results" USING btree ("room_id","roll_number");