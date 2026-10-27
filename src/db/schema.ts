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
  code: text('code').notNull(),
  name: text('name').notNull(),
  type: text('type').notNull(),
  reconcile: integer('reconcile', { mode: 'boolean' }).default(false),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull()
});

export const journals = sqliteTable('journals', {
  id: text('id').primaryKey(),
  schoolId: text('school_id').notNull().references(() => schools.id),
  name: text('name').notNull(),
  code: text('code').notNull(),
  type: text('type').notNull(),
  defaultAccountId: text('default_account_id').references(() => chartOfAccounts.id),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull()
});

export const accountMoves = sqliteTable('account_moves', {
  id: text('id').primaryKey(),
  schoolId: text('school_id').notNull().references(() => schools.id),
  journalId: text('journal_id').notNull().references(() => journals.id),
  studentId: text('student_id').references(() => students.id),
  name: text('name').notNull(),
  date: text('date').notNull(),
  moveType: text('move_type').notNull().default('out_invoice'),
  amountTotal: real('amount_total').notNull().default(0),
  amountResidual: real('amount_residual').notNull().default(0),
  state: text('state').notNull().default('draft'),
  paymentState: text('payment_state').notNull().default('not_paid'),
  invoiceDueDate: text('invoice_due_date'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull()
});

export const accountMoveLines = sqliteTable('account_move_lines', {
  id: text('id').primaryKey(),
  moveId: text('move_id').notNull().references(() => accountMoves.id, { onDelete: 'cascade' }),
  accountId: text('account_id').notNull().references(() => chartOfAccounts.id),
  studentId: text('student_id').references(() => students.id),
  name: text('name').notNull(),
  debit: real('debit').notNull().default(0),
  credit: real('credit').notNull().default(0),
  reconciled: integer('reconciled', { mode: 'boolean' }).default(false),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull()
});

export const accountPayments = sqliteTable('account_payments', {
  id: text('id').primaryKey(),
  schoolId: text('school_id').notNull().references(() => schools.id),
  journalId: text('journal_id').notNull().references(() => journals.id),
  moveId: text('move_id').references(() => accountMoves.id),
  studentId: text('student_id').references(() => students.id),
  name: text('name').notNull(),
  paymentDate: text('payment_date').notNull(),
  amount: real('amount').notNull(),
  paymentMethod: text('payment_method').notNull().default('cash'),
  reference: text('reference'),
  state: text('state').notNull().default('posted'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull()
});

// --------------------------------------------------------------------------
// Double-Entry Inventory & Asset Tracking (Odoo Model: Warehouses, Locations, Moves)
// --------------------------------------------------------------------------
export const warehouses = sqliteTable('warehouses', {
  id: text('id').primaryKey(),
  schoolId: text('school_id').notNull().references(() => schools.id),
  name: text('name').notNull(), // "Gudang Utama", "Lab IPA"
  code: text('code').notNull(), // "WH", "LAB"
  address: text('address'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull()
});

export const stockLocations = sqliteTable('stock_locations', {
  id: text('id').primaryKey(),
  schoolId: text('school_id').notNull().references(() => schools.id),
  warehouseId: text('warehouse_id').references(() => warehouses.id),
  name: text('name').notNull(), // "Stock/Gudang", "Customer/Student", "Vendor", "Inventory Loss"
  usage: text('usage').notNull(), // internal, customer, supplier, inventory
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull()
});

export const products = sqliteTable('products', {
  id: text('id').primaryKey(),
  schoolId: text('school_id').notNull().references(() => schools.id),
  name: text('name').notNull(), // "Seragam Batik SMA", "Buku Matematika 10", "Laptop Lab"
  code: text('code').notNull().unique(), // "SRG-BTK", "BK-MAT10", "AST-LP01"
  type: text('type').notNull().default('storable'), // storable, consumable, asset
  uom: text('uom').notNull().default('pcs'), // pcs, set, unit
  listPrice: real('list_price').default(0),
  standardPrice: real('standard_price').default(0),
  serialNumber: text('serial_number'), // for high-value equipment/assets
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull()
});

export const stockPickings = sqliteTable('stock_pickings', {
  id: text('id').primaryKey(),
  schoolId: text('school_id').notNull().references(() => schools.id),
  name: text('name').notNull(), // e.g. "WH/IN/0001", "WH/OUT/0001"
  pickingType: text('picking_type').notNull(), // incoming, outgoing, internal
  origin: text('origin'), // purchase order, student request
  state: text('state').notNull().default('draft'), // draft, confirmed, done, cancel
  scheduledDate: text('scheduled_date'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull()
});

export const stockMoves = sqliteTable('stock_moves', {
  id: text('id').primaryKey(),
  pickingId: text('picking_id').references(() => stockPickings.id, { onDelete: 'cascade' }),
  productId: text('product_id').notNull().references(() => products.id),
  locationId: text('location_id').notNull().references(() => stockLocations.id), // Source location
  locationDestId: text('location_dest_id').notNull().references(() => stockLocations.id), // Destination location
  productQty: real('product_qty').notNull(),
  state: text('state').notNull().default('draft'), // draft, done, cancel
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull()
});

// --------------------------------------------------------------------------
// PPDB / Student Admission (OpenEduCat model)
// --------------------------------------------------------------------------
export const admissionRegisters = sqliteTable('admission_registers', {
  id: text('id').primaryKey(),
  schoolId: text('school_id').notNull().references(() => schools.id),
  academicYearId: text('academic_year_id').notNull().references(() => academicYears.id),
  courseId: text('course_id').references(() => courses.id),
  name: text('name').notNull(),
  startDate: text('start_date').notNull(),
  endDate: text('end_date').notNull(),
  maxApplications: integer('max_applications').default(100),
  applicationFee: real('application_fee').default(0),
  admissionFee: real('admission_fee').default(0),
  status: text('status').notNull().default('draft'), // draft, open, closed, done
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull()
});

export const admissionApplications = sqliteTable('admission_applications', {
  id: text('id').primaryKey(),
  registerId: text('register_id').notNull().references(() => admissionRegisters.id),
  schoolId: text('school_id').notNull().references(() => schools.id),
  applicationNumber: text('application_number').notNull().unique(),
  name: text('name').notNull(),
  gender: text('gender').notNull(),
  birthDate: text('birth_date'),
  birthPlace: text('birth_place'),
  email: text('email').notNull(),
  phone: text('phone').notNull(),
  address: text('address'),
  guardianName: text('guardian_name').notNull(),
  guardianPhone: text('guardian_phone').notNull(),
  guardianRelation: text('guardian_relation').default('parent'),
  prevSchool: text('prev_school'),
  status: text('status').notNull().default('draft'), // draft, submitted, verified, approved, rejected, enrolled
  enrolledStudentId: text('enrolled_student_id').references(() => students.id),
  notes: text('notes'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull()
});

// --------------------------------------------------------------------------
// Fee Structures & Categories (OpenEduCat / Odoo Fee Management)
// --------------------------------------------------------------------------
export const feeCategories = sqliteTable('fee_categories', {
  id: text('id').primaryKey(),
  schoolId: text('school_id').notNull().references(() => schools.id),
  name: text('name').notNull(), // e.g. "SPP Bulanan", "Uang Gedung", "Biaya Praktikum"
  code: text('code').notNull(),
  description: text('description'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull()
});

export const feeStructures = sqliteTable('fee_structures', {
  id: text('id').primaryKey(),
  schoolId: text('school_id').notNull().references(() => schools.id),
  academicYearId: text('academic_year_id').notNull().references(() => academicYears.id),
  gradeLevelId: text('grade_level_id').references(() => gradeLevels.id),
  courseId: text('course_id').references(() => courses.id),
  categoryId: text('category_id').notNull().references(() => feeCategories.id),
  name: text('name').notNull(), // e.g. "SPP Kelas 10 Reguler"
  code: text('code').notNull(),
  amount: real('amount').notNull(),
  interval: text('interval').notNull().default('monthly'), // monthly, term, yearly, once
  receivableAccountId: text('receivable_account_id').references(() => chartOfAccounts.id),
  incomeAccountId: text('income_account_id').references(() => chartOfAccounts.id),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull()
});

// --------------------------------------------------------------------------
// Library Catalog & Circulation (OpenEduCat & Odoo Model)
// --------------------------------------------------------------------------
export const libraryMedia = sqliteTable('library_media', {
  id: text('id').primaryKey(),
  schoolId: text('school_id').notNull().references(() => schools.id),
  productId: text('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }),
  isbn: text('isbn'),
  author: text('author').notNull(),
  publisher: text('publisher'),
  edition: text('edition'),
  subjectId: text('subject_id').references(() => subjects.id),
  shelfLocation: text('shelf_location'), // e.g. "Rak A-02", "Section 3"
  barcode: text('barcode').notNull().unique(),
  status: text('status').notNull().default('available'), // available, issued, lost, maintenance
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull()
});

export const libraryIssues = sqliteTable('library_issues', {
  id: text('id').primaryKey(),
  schoolId: text('school_id').notNull().references(() => schools.id),
  mediaId: text('media_id').notNull().references(() => libraryMedia.id),
  studentId: text('student_id').notNull().references(() => students.id),
  issueDate: text('issue_date').notNull(),
  dueDate: text('due_date').notNull(),
  returnDate: text('return_date'),
  condition: text('condition').notNull().default('good'), // good, damaged, lost
  status: text('status').notNull().default('issued'), // issued, returned, lost
  fineAmount: real('fine_amount').default(0),
  fineInvoiceId: text('fine_invoice_id').references(() => accountMoves.id),
  notes: text('notes'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull()
});

// --------------------------------------------------------------------------
// HR & Payroll (Odoo hr.employee, hr.contract, hr.payslip & hr.payslip.run)
// --------------------------------------------------------------------------
export const employees = sqliteTable('employees', {
  id: text('id').primaryKey(),
  schoolId: text('school_id').notNull().references(() => schools.id),
  userId: text('user_id').references(() => user.id),
  name: text('name').notNull(),
  nip: text('nip').notNull().unique(),
  email: text('email').notNull(),
  phone: text('phone'),
  type: text('type').notNull().default('faculty'), // faculty (guru), staff (karyawan/TU)
  department: text('department'), // e.g. "Kurikulum", "Tata Usaha", "Kesiswaan"
  jobTitle: text('job_title').notNull(), // e.g. "Guru Matematika", "Staf Keuangan"
  bankName: text('bank_name'), // e.g. "BCA", "BRI", "Mandiri"
  bankAccountNumber: text('bank_account_number'),
  status: text('status').notNull().default('active'), // active, inactive
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull()
});

export const salaryStructures = sqliteTable('salary_structures', {
  id: text('id').primaryKey(),
  schoolId: text('school_id').notNull().references(() => schools.id),
  employeeId: text('employee_id').notNull().references(() => employees.id, { onDelete: 'cascade' }),
  baseSalary: real('base_salary').notNull().default(0),
  hourlyTeachingRate: real('hourly_teaching_rate').notNull().default(0),
  fixedAllowance: real('fixed_allowance').notNull().default(0),
  fixedDeduction: real('fixed_deduction').notNull().default(0),
  status: text('status').notNull().default('active'), // active, archived
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull()
});

export const payslipBatchRuns = sqliteTable('payslip_batch_runs', {
  id: text('id').primaryKey(),
  schoolId: text('school_id').notNull().references(() => schools.id),
  name: text('name').notNull(), // e.g. "Gaji Guru & Staf Oktober 2026"
  periodMonth: integer('period_month').notNull(),
  periodYear: integer('period_year').notNull(),
  totalAmount: real('total_amount').notNull().default(0),
  totalEmployees: integer('total_employees').notNull().default(0),
  status: text('status').notNull().default('draft'), // draft, confirmed
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull()
});

export const payslips = sqliteTable('payslips', {
  id: text('id').primaryKey(),
  schoolId: text('school_id').notNull().references(() => schools.id),
  batchRunId: text('batch_run_id').references(() => payslipBatchRuns.id, { onDelete: 'cascade' }),
  employeeId: text('employee_id').notNull().references(() => employees.id),
  periodMonth: integer('period_month').notNull(),
  periodYear: integer('period_year').notNull(),
  baseSalary: real('base_salary').notNull().default(0),
  teachingSessionsCount: integer('teaching_sessions_count').notNull().default(0),
  teachingHonorAmount: real('teaching_honor_amount').notNull().default(0),
  allowanceAmount: real('allowance_amount').notNull().default(0),
  deductionAmount: real('deduction_amount').notNull().default(0),
  netSalary: real('net_salary').notNull().default(0),
  status: text('status').notNull().default('draft'), // draft, confirmed, paid, cancelled
  moveId: text('move_id').references(() => accountMoves.id),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull()
});

// --------------------------------------------------------------------------
// Fixed Asset Management & Straight-Line Depreciation (Odoo account.asset)
// --------------------------------------------------------------------------
export const fixedAssets = sqliteTable('fixed_assets', {
  id: text('id').primaryKey(),
  schoolId: text('school_id').notNull().references(() => schools.id),
  name: text('name').notNull(), // e.g. "Server Lab Komputer Dell EMC"
  code: text('code').notNull().unique(), // e.g. "AST-SRV-001"
  category: text('category').notNull().default('equipment'), // equipment, vehicle, building, electronic
  purchaseDate: text('purchase_date').notNull(), // YYYY-MM-DD
  purchaseValue: real('purchase_value').notNull(), // Harga perolehan
  salvageValue: real('salvage_value').notNull().default(0), // Nilai residu
  depreciableValue: real('depreciable_value').notNull(), // purchase_value - salvage_value
  method: text('method').notNull().default('straight_line'), // straight_line
  durationMonths: integer('duration_months').notNull(), // Masa manfaat dalam bulan (e.g. 48)
  assetAccountId: text('asset_account_id').notNull().references(() => chartOfAccounts.id), // Akun Aset Tetap
  depreciationAccountId: text('depreciation_account_id').notNull().references(() => chartOfAccounts.id), // Akun Akumulasi Penyusutan
  expenseAccountId: text('expense_account_id').notNull().references(() => chartOfAccounts.id), // Akun Beban Penyusutan
  journalId: text('journal_id').notNull().references(() => journals.id), // Jurnal Umum / Misc
  status: text('status').notNull().default('draft'), // draft, running, depreciated, disposed
  notes: text('notes'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull()
});

export const assetDepreciationLines = sqliteTable('asset_depreciation_lines', {
  id: text('id').primaryKey(),
  assetId: text('asset_id').notNull().references(() => fixedAssets.id, { onDelete: 'cascade' }),
  schoolId: text('school_id').notNull().references(() => schools.id),
  sequence: integer('sequence').notNull(), // Periode ke-1, 2, ... N
  depreciationDate: text('depreciation_date').notNull(), // YYYY-MM-DD
  amount: real('amount').notNull(), // Angsuran penyusutan bulan ini
  accumulatedAmount: real('accumulated_amount').notNull(), // Akumulasi penyusutan hingga periode ini
  remainingValue: real('remaining_value').notNull(), // Nilai buku tersisa setelah penyusutan
  status: text('status').notNull().default('draft'), // draft, posted, cancelled
  moveId: text('move_id').references(() => accountMoves.id), // Journal Entry ID ketika diposting
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull()
});

