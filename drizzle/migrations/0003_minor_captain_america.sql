CREATE TABLE `attendance_lines` (
	`id` text PRIMARY KEY NOT NULL,
	`sheet_id` text NOT NULL,
	`student_id` text NOT NULL,
	`status` text DEFAULT 'present' NOT NULL,
	`remark` text,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`sheet_id`) REFERENCES `attendance_sheets`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `attendance_sheets` (
	`id` text PRIMARY KEY NOT NULL,
	`school_id` text NOT NULL,
	`classroom_id` text NOT NULL,
	`faculty_id` text NOT NULL,
	`timetable_id` text,
	`date` text NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`total_present` integer DEFAULT 0,
	`total_absent` integer DEFAULT 0,
	`total_sick` integer DEFAULT 0,
	`total_excused` integer DEFAULT 0,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`school_id`) REFERENCES `schools`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`classroom_id`) REFERENCES `classrooms`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`faculty_id`) REFERENCES `faculties`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`timetable_id`) REFERENCES `timetables`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `timetables` (
	`id` text PRIMARY KEY NOT NULL,
	`school_id` text NOT NULL,
	`classroom_id` text NOT NULL,
	`subject_id` text NOT NULL,
	`faculty_id` text NOT NULL,
	`day_of_week` text NOT NULL,
	`start_time` text NOT NULL,
	`end_time` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`school_id`) REFERENCES `schools`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`classroom_id`) REFERENCES `classrooms`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`subject_id`) REFERENCES `subjects`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`faculty_id`) REFERENCES `faculties`(`id`) ON UPDATE no action ON DELETE no action
);
