ALTER TABLE `campaign_runs` ADD `control_accepted` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `campaign_targets` ADD `control_counted` integer DEFAULT 0 NOT NULL;