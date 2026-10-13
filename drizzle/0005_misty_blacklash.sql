CREATE TABLE `campaign_runs` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`code` text NOT NULL,
	`subject` text NOT NULL,
	`content_json` text NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`expires_at` integer NOT NULL,
	`scheduled_at` integer,
	`started_at` integer,
	`launch_consent` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_campaign_runs_created` ON `campaign_runs` (`created_at`);--> statement-breakpoint
CREATE INDEX `idx_campaign_runs_status` ON `campaign_runs` (`status`);--> statement-breakpoint
CREATE UNIQUE INDEX `idx_campaign_runs_code` ON `campaign_runs` (`code`);--> statement-breakpoint
CREATE TABLE `campaign_targets` (
	`id` text PRIMARY KEY NOT NULL,
	`run_id` text NOT NULL,
	`email` text NOT NULL,
	`status` text DEFAULT 'queued' NOT NULL,
	`is_test` integer DEFAULT 0 NOT NULL,
	`created_at` integer NOT NULL,
	`lease_token` text,
	`lease_expires_at` integer,
	`config_revision` integer,
	`attempts` integer DEFAULT 0 NOT NULL,
	`next_attempt_at` integer DEFAULT 0 NOT NULL,
	`started_at` integer,
	`accepted_at` integer,
	`last_error` text DEFAULT '' NOT NULL,
	`message_id` text DEFAULT '' NOT NULL,
	`receipt_hash` text DEFAULT '' NOT NULL,
	FOREIGN KEY (`run_id`) REFERENCES `campaign_runs`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_campaign_targets_queue` ON `campaign_targets` (`status`,`next_attempt_at`,`created_at`);--> statement-breakpoint
CREATE INDEX `idx_campaign_targets_run_status` ON `campaign_targets` (`run_id`,`status`);--> statement-breakpoint
CREATE UNIQUE INDEX `idx_campaign_targets_run_email_test` ON `campaign_targets` (`run_id`,`email`,`is_test`);--> statement-breakpoint
CREATE TABLE `smtp_settings` (
	`id` text PRIMARY KEY NOT NULL,
	`cipher` text DEFAULT '' NOT NULL,
	`revision` integer DEFAULT 0 NOT NULL,
	`runner_hash` text DEFAULT '' NOT NULL,
	`runner_seen_at` integer,
	`verify_requested_at` integer,
	`verify_claim` text,
	`verify_expires_at` integer,
	`verified_revision` integer DEFAULT -1 NOT NULL,
	`verify_status` text DEFAULT 'unconfigured' NOT NULL,
	`verify_error` text DEFAULT '' NOT NULL,
	`verified_at` integer,
	`dns_json` text DEFAULT '{}' NOT NULL,
	`dns_checked_at` integer,
	`day_key` text DEFAULT '' NOT NULL,
	`day_reserved` integer DEFAULT 0 NOT NULL,
	`next_send_at` integer DEFAULT 0 NOT NULL,
	`updated_at` integer NOT NULL
);
