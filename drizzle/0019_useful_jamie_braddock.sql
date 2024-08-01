CREATE TABLE IF NOT EXISTS "rooms" (
	"id" text PRIMARY KEY NOT NULL,
	"host_id" text NOT NULL,
	"room_id" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"is_public" boolean DEFAULT true NOT NULL,
	"queued_users" text NOT NULL,
	"allowed_users" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "rooms_room_id_unique" UNIQUE("room_id")
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "room_id_idx" ON "rooms" USING btree ("room_id");