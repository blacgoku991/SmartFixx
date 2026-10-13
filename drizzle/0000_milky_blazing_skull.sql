CREATE TABLE `quote_requests` (
	`id` text PRIMARY KEY NOT NULL,
	`reference` text NOT NULL,
	`created_at` integer NOT NULL,
	`expires_at` integer NOT NULL,
	`name` text NOT NULL,
	`company` text NOT NULL,
	`email` text NOT NULL,
	`phone` text,
	`message` text NOT NULL,
	`audience` text NOT NULL,
	`data_source` text NOT NULL,
	`volume` integer NOT NULL,
	`plan` text NOT NULL,
	`quoted_amount_euros` integer,
	`contact_consent` integer NOT NULL,
	`status` text DEFAULT 'new' NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_quote_requests_email_created_at` ON `quote_requests` (`email`,`created_at`);--> statement-breakpoint
CREATE INDEX `idx_quote_requests_expires_at` ON `quote_requests` (`expires_at`);