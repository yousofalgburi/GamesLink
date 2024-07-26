ALTER TABLE "processed_games" ALTER COLUMN "type" SET DATA TYPE varchar(50);--> statement-breakpoint
ALTER TABLE "processed_games" ALTER COLUMN "type" DROP DEFAULT;