ALTER TABLE `campaign_targets` ADD `smtp_diagnostic` text DEFAULT '{}' NOT NULL;--> statement-breakpoint
ALTER TABLE `campaign_targets` ADD `updated_at` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
CREATE INDEX `idx_campaign_targets_run_updated` ON `campaign_targets` (`run_id`,`updated_at`,`created_at`);--> statement-breakpoint
ALTER TABLE `smtp_settings` ADD `runner_version` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `smtp_settings` ADD `verify_diagnostic` text DEFAULT '{}' NOT NULL;