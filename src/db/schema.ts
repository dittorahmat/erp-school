import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

// --------------------------------------------------------------------------
// Better-Auth Tables (Standard SQLite Schema)
// --------------------------------------------------------------------------
export const user = sqliteTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: integer('email_verified', { mode: 'boolean' }).notNull().default(false),
  image: text('image'),
  role: text('role').notNull().default('student'), // superadmin, school_admin, teacher, student, guardian, accountant
  schoolId: text('school_id'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull()
});

export const session = sqliteTable('session', {
  id: text('id').primaryKey(),
  expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
  token: text('token').notNull().unique(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' })
});

export const account = sqliteTable('account', {
  id: text('id').primaryKey(),
  accountId: text('account_id').notNull(),
  providerId: text('provider_id').notNull(),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  idToken: text('id_token'),
  accessTokenExpiresAt: integer('access_token_expires_at', { mode: 'timestamp' }),
  refreshTokenExpiresAt: integer('refresh_token_expires_at', { mode: 'timestamp' }),
  scope: text('scope'),
  password: text('password'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull()
});

export const verification = sqliteTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
});

// --------------------------------------------------------------------------
// Multi-School & Master Data
// --------------------------------------------------------------------------
export const schools = sqliteTable('schools', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  code: text('code').notNull().unique(), // e.g. "SMA-HB"
  address: text('address'),
  phone: text('phone'),
  email: text('email'),
  website: text('website'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull()
});

// Academic Year (e.g. 2025/2026)
export const academicYears = sqliteTable('academic_years', {
  id: text('id').primaryKey(),
  schoolId: text('school_id').notNull().references(() => schools.id),
  name: text('name').notNull(), // "2025/2026"
  code: text('code').notNull(), // "AY-2526"
  startDate: text('start_date').notNull(),
  endDate: text('end_date').notNull(),
  status: text('status').notNull().default('active'), // draft, active, closed
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull()
});

// Academic Term / Semester
export const terms = sqliteTable('terms', {
  id: text('id').primaryKey(),
  academicYearId: text('academic_year_id').notNull().references(() => academicYears.id),
  name: text('name').notNull(), // "Semester Ganjil", "Semester Genap"
  code: text('code').notNull(),
  startDate: text('start_date').notNull(),
  endDate: text('end_date').notNull(),
  status: text('status').notNull().default('active'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull()
});

// Grade Level (e.g. "Kelas 10", "Kelas 11", "Kelas 12")
export const gradeLevels = sqliteTable('grade_levels', {
  id: text('id').primaryKey(),
  schoolId: text('school_id').notNull().references(() => schools.id),
  name: text('name').notNull(),
  sequence: integer('sequence').notNull().default(10),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull()
});

// Course / Program (e.g. "MIPA", "IPS", "Bahasa")
export const courses = sqliteTable('courses', {
  id: text('id').primaryKey(),
  schoolId: text('school_id').notNull().references(() => schools.id),
  name: text('name').notNull(),
  code: text('code').notNull(),
  evaluationType: text('evaluation_type').default('normal'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull()
});

// Subject / Mata Pelajaran
export const subjects = sqliteTable('subjects', {
  id: text('id').primaryKey(),
  schoolId: text('school_id').notNull().references(() => schools.id),
  name: text('name').notNull(),
  code: text('code').notNull(), // "MAT-10"
  type: text('type').default('compulsory'), // compulsory, elective
  weightage: integer('weightage').default(100),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull()
});

// --------------------------------------------------------------------------
// Faculty & Classrooms
// --------------------------------------------------------------------------
export const faculties = sqliteTable('faculties', {
  id: text('id').primaryKey(),
  schoolId: text('school_id').notNull().references(() => schools.id),
  userId: text('user_id').references(() => user.id),
  nip: text('nip').notNull().unique(),
  name: text('name').notNull(),
  gender: text('gender').notNull(), // male, female
  phone: text('phone'),
  email: text('email'),
  avatarUrl: text('avatar_url'),
  department: text('department').default('Akademik'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull()
});

export const classrooms = sqliteTable('classrooms', {
  id: text('id').primaryKey(),
  schoolId: text('school_id').notNull().references(() => schools.id),
  academicYearId: text('academic_year_id').notNull().references(() => academicYears.id),
  gradeLevelId: text('grade_level_id').notNull().references(() => gradeLevels.id),
  homeroomTeacherId: text('homeroom_teacher_id').references(() => faculties.id),
  name: text('name').notNull(), // e.g. "X-IPA-1"
  code: text('code').notNull(),
  capacity: integer('capacity').default(35),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull()
});

// --------------------------------------------------------------------------
// Students & Guardians
// --------------------------------------------------------------------------
export const guardians = sqliteTable('guardians', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => user.id),
  name: text('name').notNull(),
  relation: text('relation').notNull().default('parent'), // father, mother, guardian
  phone: text('phone').notNull(),
  email: text('email'),
  occupation: text('occupation'),
  address: text('address'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull()
});

export const students = sqliteTable('students', {
  id: text('id').primaryKey(),
  schoolId: text('school_id').notNull().references(() => schools.id),
  userId: text('user_id').references(() => user.id),
  guardianId: text('guardian_id').references(() => guardians.id),
  nis: text('nis').notNull().unique(),
  nisn: text('nisn').notNull().unique(),
  name: text('name').notNull(),
  gender: text('gender').notNull(), // male, female
  birthDate: text('birth_date'),
  birthPlace: text('birth_place'),
  address: text('address'),
  avatarUrl: text('avatar_url'), // File stored in Cloudflare R2
  documentUrl: text('document_url'), // File stored in Cloudflare R2
  status: text('status').notNull().default('active'), // active, alumni, transferred
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull()
});

export const enrollments = sqliteTable('enrollments', {
  id: text('id').primaryKey(),
  studentId: text('student_id').notNull().references(() => students.id),
  classroomId: text('classroom_id').notNull().references(() => classrooms.id),
  academicYearId: text('academic_year_id').notNull().references(() => academicYears.id),
  rollNumber: text('roll_number'),
  status: text('status').notNull().default('active'), // active, completed, dropped
  enrolledAt: integer('enrolled_at', { mode: 'timestamp' }).notNull()
});

// --------------------------------------------------------------------------
// Timetable & Attendance
// --------------------------------------------------------------------------
export const timetables = sqliteTable('timetables', {
  id: text('id').primaryKey(),
  schoolId: text('school_id').notNull().references(() => schools.id),
  classroomId: text('classroom_id').notNull().references(() => classrooms.id),
  subjectId: text('subject_id').notNull().references(() => subjects.id),
  facultyId: text('faculty_id').notNull().references(() => faculties.id),
  dayOfWeek: text('day_of_week').notNull(), // monday, tuesday, wednesday, thursday, friday, saturday
  startTime: text('start_time').notNull(), // "07:30"
  endTime: text('end_time').notNull(), // "09:00"
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull()
});

export const attendanceSheets = sqliteTable('attendance_sheets', {
  id: text('id').primaryKey(),
  schoolId: text('school_id').notNull().references(() => schools.id),
  classroomId: text('classroom_id').notNull().references(() => classrooms.id),
  facultyId: text('faculty_id').notNull().references(() => faculties.id),
  timetableId: text('timetable_id').references(() => timetables.id),
  date: text('date').notNull(), // "2026-10-26"
  status: text('status').notNull().default('draft'), // draft, confirmed
  totalPresent: integer('total_present').default(0),
  totalAbsent: integer('total_absent').default(0),
  totalSick: integer('total_sick').default(0),
  totalExcused: integer('total_excused').default(0),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull()
});

export const attendanceLines = sqliteTable('attendance_lines', {
  id: text('id').primaryKey(),
  sheetId: text('sheet_id').notNull().references(() => attendanceSheets.id, { onDelete: 'cascade' }),
  studentId: text('student_id').notNull().references(() => students.id),
  status: text('status').notNull().default('present'), // present, absent, sick, excused, late
  remark: text('remark'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull()
});

// --------------------------------------------------------------------------
// Examination & Grading
// --------------------------------------------------------------------------
export const examSessions = sqliteTable('exam_sessions', {
  id: text('id').primaryKey(),
  schoolId: text('school_id').notNull().references(() => schools.id),
  academicYearId: text('academic_year_id').notNull().references(() => academicYears.id),
  termId: text('term_id').notNull().references(() => terms.id),
  classroomId: text('classroom_id').notNull().references(() => classrooms.id),
  subjectId: text('subject_id').notNull().references(() => subjects.id),
  name: text('name').notNull(), // "UTS Semester Ganjil Matematika"
  examDate: text('exam_date').notNull(),
  totalMarks: integer('total_marks').default(100),
  passingMarks: integer('passing_marks').default(75), // KKM
  weightage: integer('weightage').default(30), // 30% of final grade
  status: text('status').notNull().default('draft'), // draft, in_progress, finished, published
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull()
});

export const examMarks = sqliteTable('exam_marks', {
  id: text('id').primaryKey(),
  sessionId: text('session_id').notNull().references(() => examSessions.id, { onDelete: 'cascade' }),
  studentId: text('student_id').notNull().references(() => students.id),
  marksObtained: real('marks_obtained').notNull(),
  grade: text('grade'), // A, B, C, D
  remark: text('remark'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull()
});

// --------------------------------------------------------------------------
// Double-Entry Accounting (Odoo Model: COA, Journals, Moves & Move Lines)
// --------------------------------------------------------------------------
export const chartOfAccounts = sqliteTable('chart_of_accounts', {
  id: text('id').primaryKey(),
  schoolId: text('school_id').notNull().references(() => schools.id),
  code: text('code').notNull(), // e.g. "1100" (Kas), "1200" (Piutang Siswa), "4100" (Pendapatan SPP)
  name: text('name').notNull(),
  type: text('type').notNull(), // asset, liability, equity, income, expense
  reconcile: integer('reconcile', { mode: 'boolean' }).default(false),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull()
});

export const journals = sqliteTable('journals', {
  id: text('id').primaryKey(),
  schoolId: text('school_id').notNull().references(() => schools.id),
  name: text('name').notNull(), // "Jurnal Tagihan Sekolah", "Kas Sekolah", "Bank BCA"
  code: text('code').notNull(), // "INV", "CASH", "BANK", "GEN"
  type: text('type').notNull(), // sale, purchase, cash, bank, general
  defaultAccountId: text('default_account_id').references(() => chartOfAccounts.id),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull()
});

export const accountMoves = sqliteTable('account_moves', {
  id: text('id').primaryKey(),
  schoolId: text('school_id').notNull().references(() => schools.id),
  journalId: text('journal_id').notNull().references(() => journals.id),
  studentId: text('student_id').references(() => students.id),
  name: text('name').notNull(), // e.g. "INV/2026/10/0001"
  date: text('date').notNull(), // "2026-10-26"
  moveType: text('move_type').notNull().default('out_invoice'), // out_invoice (SPP bill), entry (Journal voucher), out_refund
  amountTotal: real('amount_total').notNull().default(0),
  amountResidual: real('amount_residual').notNull().default(0),
  state: text('state').notNull().default('draft'), // draft, posted, cancel
  paymentState: text('payment_state').notNull().default('not_paid'), // not_paid, in_payment, paid, partial
  invoiceDueDate: text('invoice_due_date'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull()
});

export const accountMoveLines = sqliteTable('account_move_lines', {
  id: text('id').primaryKey(),
  moveId: text('move_id').notNull().references(() => accountMoves.id, { onDelete: 'cascade' }),
  accountId: text('account_id').notNull().references(() => chartOfAccounts.id),
  studentId: text('student_id').references(() => students.id),
  name: text('name').notNull(), // label description e.g. "SPP Bulan November 2026"
  debit: real('debit').notNull().default(0),
  credit: real('credit').notNull().default(0),
  reconciled: integer('reconciled', { mode: 'boolean' }).default(false),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull()
});

export const accountPayments = sqliteTable('account_payments', {
  id: text('id').primaryKey(),
  schoolId: text('school_id').notNull().references(() => schools.id),
  journalId: text('journal_id').notNull().references(() => journals.id),
  moveId: text('move_id').references(() => accountMoves.id), // reconciled invoice
  studentId: text('student_id').references(() => students.id),
  name: text('name').notNull(), // e.g. "PAY/2026/10/0001"
  paymentDate: text('payment_date').notNull(),
  amount: real('amount').notNull(),
  paymentMethod: text('payment_method').notNull().default('cash'), // cash, bank_transfer, qris
  reference: text('reference'),
  state: text('state').notNull().default('posted'), // draft, posted, cancelled
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull()
});
