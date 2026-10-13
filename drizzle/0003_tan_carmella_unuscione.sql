CREATE TABLE `analytics_daily` (
	`id` text PRIMARY KEY NOT NULL,
	`day` text NOT NULL,
	`path` text NOT NULL,
	`event` text NOT NULL,
	`service` text DEFAULT 'none' NOT NULL,
	`count` integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_analytics_daily_day` ON `analytics_daily` (`day`);