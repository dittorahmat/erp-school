CREATE TABLE `classrooms` (
	`id` text PRIMARY KEY NOT NULL,
	`school_id` text NOT NULL,
	`academic_year_id` text NOT NULL,
	`grade_level_id` text NOT NULL,
	`homeroom_teacher_id` text,
	`name` text NOT NULL,
	`code` text NOT NULL,
	`capacity` integer DEFAULT 35,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`school_id`) REFERENCES `schools`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`academic_year_id`) REFERENCES `academic_years`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`grade_level_id`) REFERENCES `grade_levels`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`homeroom_teacher_id`) REFERENCES `faculties`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `enrollments` (
	`id` text PRIMARY KEY NOT NULL,
	`student_id` text NOT NULL,
	`classroom_id` text NOT NULL,
	`academic_year_id` text NOT NULL,
	`roll_number` text,
	`status` text DEFAULT 'active' NOT NULL,
	`enrolled_at` integer NOT NULL,
	FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`classroom_id`) REFERENCES `classrooms`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`academic_year_id`) REFERENCES `academic_years`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `faculties` (
	`id` text PRIMARY KEY NOT NULL,
	`school_id` text NOT NULL,
	`user_id` text,
	`nip` text NOT NULL,
	`name` text NOT NULL,
	`gender` text NOT NULL,
	`phone` text,
	`email` text,
	`avatar_url` text,
	`department` text DEFAULT 'Akademik',
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`school_id`) REFERENCES `schools`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `faculties_nip_unique` ON `faculties` (`nip`);--> statement-breakpoint
CREATE TABLE `guardians` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text,
	`name` text NOT NULL,
	`relation` text DEFAULT 'parent' NOT NULL,
	`phone` text NOT NULL,
	`email` text,
	`occupation` text,
	`address` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `students` (
	`id` text PRIMARY KEY NOT NULL,
	`school_id` text NOT NULL,
	`user_id` text,
	`guardian_id` text,
	`nis` text NOT NULL,
	`nisn` text NOT NULL,
	`name` text NOT NULL,
	`gender` text NOT NULL,
	`birth_date` text,
	`birth_place` text,
	`address` text,
	`avatar_url` text,
	`document_url` text,
	`status` text DEFAULT 'active' NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`school_id`) REFERENCES `schools`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`guardian_id`) REFERENCES `guardians`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `students_nis_unique` ON `students` (`nis`);--> statement-breakpoint
CREATE UNIQUE INDEX `students_nisn_unique` ON `students` (`nisn`);