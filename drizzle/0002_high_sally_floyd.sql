ALTER TABLE `quote_requests` ADD `service` text DEFAULT 'emailing' NOT NULL;--> statement-breakpoint
ALTER TABLE `quote_requests` ADD `website_url` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `quote_requests` ADD `city` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `quote_requests` ADD `budget` text DEFAULT 'a_definir' NOT NULL;--> statement-breakpoint
ALTER TABLE `quote_requests` ADD `timeline` text DEFAULT 'flexible' NOT NULL;--> statement-breakpoint
ALTER TABLE `quote_requests` ADD `campaign` text DEFAULT 'site' NOT NULL;