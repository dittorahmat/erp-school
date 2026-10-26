CREATE TABLE `account_move_lines` (
	`id` text PRIMARY KEY NOT NULL,
	`move_id` text NOT NULL,
	`account_id` text NOT NULL,
	`student_id` text,
	`name` text NOT NULL,
	`debit` real DEFAULT 0 NOT NULL,
	`credit` real DEFAULT 0 NOT NULL,
	`reconciled` integer DEFAULT false,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`move_id`) REFERENCES `account_moves`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`account_id`) REFERENCES `chart_of_accounts`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `account_moves` (
	`id` text PRIMARY KEY NOT NULL,
	`school_id` text NOT NULL,
	`journal_id` text NOT NULL,
	`student_id` text,
	`name` text NOT NULL,
	`date` text NOT NULL,
	`move_type` text DEFAULT 'out_invoice' NOT NULL,
	`amount_total` real DEFAULT 0 NOT NULL,
	`amount_residual` real DEFAULT 0 NOT NULL,
	`state` text DEFAULT 'draft' NOT NULL,
	`payment_state` text DEFAULT 'not_paid' NOT NULL,
	`invoice_due_date` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`school_id`) REFERENCES `schools`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`journal_id`) REFERENCES `journals`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `account_payments` (
	`id` text PRIMARY KEY NOT NULL,
	`school_id` text NOT NULL,
	`journal_id` text NOT NULL,
	`move_id` text,
	`student_id` text,
	`name` text NOT NULL,
	`payment_date` text NOT NULL,
	`amount` real NOT NULL,
	`payment_method` text DEFAULT 'cash' NOT NULL,
	`reference` text,
	`state` text DEFAULT 'posted' NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`school_id`) REFERENCES `schools`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`journal_id`) REFERENCES `journals`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`move_id`) REFERENCES `account_moves`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `chart_of_accounts` (
	`id` text PRIMARY KEY NOT NULL,
	`school_id` text NOT NULL,
	`code` text NOT NULL,
	`name` text NOT NULL,
	`type` text NOT NULL,
	`reconcile` integer DEFAULT false,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`school_id`) REFERENCES `schools`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `journals` (
	`id` text PRIMARY KEY NOT NULL,
	`school_id` text NOT NULL,
	`name` text NOT NULL,
	`code` text NOT NULL,
	`type` text NOT NULL,
	`default_account_id` text,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`school_id`) REFERENCES `schools`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`default_account_id`) REFERENCES `chart_of_accounts`(`id`) ON UPDATE no action ON DELETE no action
);
