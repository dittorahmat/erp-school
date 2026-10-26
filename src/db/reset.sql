-- ============================================================================
-- ERP Sekolah — Reset & Clean Slate Script
-- ============================================================================

-- Disable foreign key constraints temporarily for clean wipe
PRAGMA foreign_keys = OFF;

-- Academic & Daily Attendance
DELETE FROM attendance_lines;
DELETE FROM attendance_sheets;
DELETE FROM timetables;

-- Examinations & Grading
DELETE FROM exam_marks;
DELETE FROM exam_sessions;

-- Double-Entry Accounting
DELETE FROM account_payments;
DELETE FROM account_move_lines;
DELETE FROM account_moves;
DELETE FROM journals;
DELETE FROM chart_of_accounts;

-- Inventory & Stock Moves
DELETE FROM stock_moves;
DELETE FROM stock_pickings;
DELETE FROM products;
DELETE FROM stock_locations;
DELETE FROM warehouses;

-- Academic Structure & Students
DELETE FROM enrollments;
DELETE FROM students;
DELETE FROM guardians;
DELETE FROM classrooms;
DELETE FROM faculties;
DELETE FROM subjects;
DELETE FROM courses;
DELETE FROM grade_levels;
DELETE FROM terms;
DELETE FROM academic_years;

-- Users & Schools
DELETE FROM user;
DELETE FROM schools;

PRAGMA foreign_keys = ON;
