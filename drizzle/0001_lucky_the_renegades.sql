CREATE TABLE `admin_identities` (
	`owner_email` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `quote_events` (
	`id` text PRIMARY KEY NOT NULL,
	`request_id` text NOT NULL,
	`created_at` integer NOT NULL,
	`actor_id` text NOT NULL,
	`from_status` text NOT NULL,
	`to_status` text NOT NULL,
	`notes_changed` integer NOT NULL,
	FOREIGN KEY (`request_id`) REFERENCES `quote_requests`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_quote_events_request_created` ON `quote_events` (`request_id`,`created_at`);--> statement-breakpoint
CREATE TABLE `request_limits` (
	`key` text PRIMARY KEY NOT NULL,
	`count` integer NOT NULL,
	`expires_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_request_limits_expires` ON `request_limits` (`expires_at`);--> statement-breakpoint
ALTER TABLE `quote_requests` ADD `notes` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `quote_requests` ADD `revision` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `quote_requests` ADD `updated_at` integer;--> statement-breakpoint
CREATE INDEX `idx_quote_requests_status_created` ON `quote_requests` (`status`,`created_at`);--> statement-breakpoint
CREATE INDEX `idx_quote_requests_created` ON `quote_requests` (`created_at`);