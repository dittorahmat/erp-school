CREATE TABLE `products` (
	`id` text PRIMARY KEY NOT NULL,
	`school_id` text NOT NULL,
	`name` text NOT NULL,
	`code` text NOT NULL,
	`type` text DEFAULT 'storable' NOT NULL,
	`uom` text DEFAULT 'pcs' NOT NULL,
	`list_price` real DEFAULT 0,
	`standard_price` real DEFAULT 0,
	`serial_number` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`school_id`) REFERENCES `schools`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `products_code_unique` ON `products` (`code`);--> statement-breakpoint
CREATE TABLE `stock_locations` (
	`id` text PRIMARY KEY NOT NULL,
	`school_id` text NOT NULL,
	`warehouse_id` text,
	`name` text NOT NULL,
	`usage` text NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`school_id`) REFERENCES `schools`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`warehouse_id`) REFERENCES `warehouses`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `stock_moves` (
	`id` text PRIMARY KEY NOT NULL,
	`picking_id` text,
	`product_id` text NOT NULL,
	`location_id` text NOT NULL,
	`location_dest_id` text NOT NULL,
	`product_qty` real NOT NULL,
	`state` text DEFAULT 'draft' NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`picking_id`) REFERENCES `stock_pickings`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`location_id`) REFERENCES `stock_locations`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`location_dest_id`) REFERENCES `stock_locations`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `stock_pickings` (
	`id` text PRIMARY KEY NOT NULL,
	`school_id` text NOT NULL,
	`name` text NOT NULL,
	`picking_type` text NOT NULL,
	`origin` text,
	`state` text DEFAULT 'draft' NOT NULL,
	`scheduled_date` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`school_id`) REFERENCES `schools`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `warehouses` (
	`id` text PRIMARY KEY NOT NULL,
	`school_id` text NOT NULL,
	`name` text NOT NULL,
	`code` text NOT NULL,
	`address` text,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`school_id`) REFERENCES `schools`(`id`) ON UPDATE no action ON DELETE no action
);
