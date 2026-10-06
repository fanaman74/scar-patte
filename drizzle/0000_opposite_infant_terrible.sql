CREATE TABLE `appointment_requests` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`phone` text NOT NULL,
	`pet_name` text NOT NULL,
	`pet` text NOT NULL,
	`service` text NOT NULL,
	`preferred_date` text NOT NULL,
	`preferred_time` text NOT NULL,
	`message` text DEFAULT '' NOT NULL,
	`language` text NOT NULL,
	`status` text DEFAULT 'new' NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `requests_created` ON `appointment_requests` (`created_at`);--> statement-breakpoint
CREATE INDEX `requests_status` ON `appointment_requests` (`status`);