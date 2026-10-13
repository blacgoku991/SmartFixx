DROP INDEX `idx_campaign_targets_run_email_test`;--> statement-breakpoint
ALTER TABLE `campaign_targets` ADD `control_milestone` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `campaign_targets` ADD `relay_session` text DEFAULT '' NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX `idx_campaign_targets_control` ON `campaign_targets` (`run_id`,`control_milestone`) WHERE "campaign_targets"."control_milestone">0;--> statement-breakpoint
CREATE INDEX `idx_campaign_targets_lease` ON `campaign_targets` (`lease_token`);--> statement-breakpoint
CREATE INDEX `idx_campaign_targets_run_started` ON `campaign_targets` (`run_id`,`started_at`);--> statement-breakpoint
CREATE UNIQUE INDEX `idx_campaign_targets_run_email_test` ON `campaign_targets` (`run_id`,`email`,`is_test`) WHERE "campaign_targets"."control_milestone"=0;--> statement-breakpoint
ALTER TABLE `campaign_runs` ADD `control_email` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `campaign_runs` ADD `control_every` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `campaign_runs` ADD `control_cursor` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `smtp_settings` ADD `runner_session` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `smtp_settings` ADD `runner_session_until` integer DEFAULT 0 NOT NULL;