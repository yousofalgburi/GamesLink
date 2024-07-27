ALTER TABLE "package_groups" ALTER COLUMN "is_recurring_subscription" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "price_overviews" ALTER COLUMN "initial_formatted" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "price_overviews" ALTER COLUMN "final_formatted" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "processed_games" ALTER COLUMN "controller_support" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "ratings" ALTER COLUMN "required_age" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "ratings" ALTER COLUMN "banned" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "ratings" ALTER COLUMN "use_age_gate" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "subs" ALTER COLUMN "percent_savings_text" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "subs" ALTER COLUMN "can_get_free_license" SET DATA TYPE varchar(255);