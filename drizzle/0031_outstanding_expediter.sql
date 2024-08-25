ALTER TABLE "user" ALTER COLUMN "credits" SET DEFAULT 10;--> statement-breakpoint
ALTER TABLE "processed_games" ADD COLUMN "embedding" vector(3072);