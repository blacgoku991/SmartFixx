CREATE TABLE `email_recipients` (
	`id` text PRIMARY KEY NOT NULL,
	`campaign` text NOT NULL,
	`email` text NOT NULL,
	`name` text DEFAULT '' NOT NULL,
	`company` text NOT NULL,
	`source` text NOT NULL,
	`created_at` integer NOT NULL,
	`expires_at` integer NOT NULL,
	`sent_at` integer,
	`tracking_consent` integer DEFAULT 0 NOT NULL,
	`consent_proof` text DEFAULT '' NOT NULL,
	`consent_recorded_at` integer,
	`tracking_revoked_at` integer,
	`first_open_at` integer,
	`first_click_at` integer,
	`interested_at` integer,
	`unsubscribed_at` integer,
	`request_id` text
);
--> statement-breakpoint
CREATE INDEX `idx_email_recipients_created` ON `email_recipients` (`created_at`);--> statement-breakpoint
CREATE INDEX `idx_email_recipients_email` ON `email_recipients` (`email`);--> statement-breakpoint
CREATE INDEX `idx_email_recipients_campaign` ON `email_recipients` (`campaign`);--> statement-breakpoint
CREATE TABLE `email_suppressions` (
	`email` text PRIMARY KEY NOT NULL,
	`created_at` integer NOT NULL,
	`reason` text DEFAULT 'unsubscribe' NOT NULL
);
