export interface UserProfile {
  name: string;
  role: string;
  email: string;
  avatar: string;
}

export interface Student {
  id: string;
  schoolId: string;
  userId?: string | null;
  guardianId?: string | null;
  nis: string;
  nisn: string;
  name: string;
  gender: 'male' | 'female';
  birthDate?: string | null;
  birthPlace?: string | null;
  address?: string | null;
  status: 'active' | 'graduated' | 'dropped';
}

export interface AcademicYear {
  id: string;
  schoolId: string;
  name: string;
  code: string;
  startDate: string;
  endDate: string;
  status: 'draft' | 'active' | 'closed';
}

export interface Subject {
  id: string;
  schoolId: string;
  name: string;
  code: string;
  type: string;
  weightage: number;
}

export interface Timetable {
  id: string;
  schoolId: string;
  classroomId: string;
  subjectId: string;
  facultyId: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
}

export interface AttendanceSheet {
  id: string;
  schoolId: string;
  classroomId: string;
  facultyId: string;
  timetableId?: string | null;
  date: string;
  status: string;
  totalPresent: number;
  totalAbsent: number;
  totalSick: number;
  totalExcused: number;
}

export interface ExamSession {
  id: string;
  schoolId: string;
  academicYearId: string;
  termId: string;
  classroomId: string;
  subjectId: string;
  name: string;
  examDate: string;
  totalMarks: number;
  passingMarks: number;
  weightage: number;
  status: string;
}

export interface Invoice {
  id: string;
  schoolId: string;
  journalId: string;
  studentId?: string | null;
  name: string;
  date: string;
  moveType: string;
  amountTotal: number;
  amountResidual: number;
  state: string;
  paymentState: string;
  invoiceDueDate?: string | null;
}

export interface InventoryProduct {
  id: string;
  name: string;
  code: string;
  type: 'storable' | 'consumable' | 'asset';
  uom: string;
  listPrice: number;
  standardPrice: number;
  serialNumber?: string | null;
}

export interface TrialBalanceItem {
  id: string;
  code: string;
  name: string;
  type: string;
  debit: number;
  credit: number;
  balance: number;
}

export interface TrialBalanceReport {
  isBalanced: boolean;
  totalDebit: number;
  totalCredit: number;
  data: TrialBalanceItem[];
}

export interface ReportCardGrade {
  id: string;
  sessionId: string;
  studentId: string;
  marksObtained: number;
  grade: string;
  remark: string | null;
  createdAt: number;
  updatedAt: number;
}

export interface ReportCardResponse {
  studentId: string;
  status: string;
  term: string;
  summary: {
    totalSubjects: number;
    averageScore: string;
  };
  grades: ReportCardGrade[];
}

export const DEMO_USERS: Record<string, UserProfile> = {
  admin: {
    name: 'Dra. Hj. Siti Nurhaliza, M.Pd',
    role: 'superadmin',
    email: 'admin.siti@sekolah.demo',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100'
  },
  finance: {
    name: 'Ahmad Fauzi, S.E.',
    role: 'accountant',
    email: 'keuangan.fauzi@sekolah.demo',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100'
  },
  teacher: {
    name: 'Budi Santoso, S.Pd',
    role: 'teacher',
    email: 'guru.budi@sekolah.demo',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100'
  },
  student: {
    name: 'Andi Pratama',
    role: 'student',
    email: 'student.andi@sekolah.demo',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100'
  },
  guardian: {
    name: 'Joko Pratama',
    role: 'guardian',
    email: 'ortu.andi@sekolah.demo',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100'
  }
};

export interface AdmissionRegister {
  id: string;
  schoolId: string;
  academicYearId: string;
  courseId?: string | null;
  name: string;
  startDate: string;
  endDate: string;
  maxApplications: number;
  applicationFee: number;
  admissionFee: number;
  status: 'draft' | 'open' | 'closed' | 'done';
}

export interface AdmissionApplication {
  id: string;
  registerId: string;
  schoolId: string;
  applicationNumber: string;
  name: string;
  gender: 'male' | 'female';
  birthDate?: string | null;
  birthPlace?: string | null;
  email: string;
  phone: string;
  address?: string | null;
  guardianName: string;
  guardianPhone: string;
  guardianRelation?: string | null;
  prevSchool?: string | null;
  status: 'draft' | 'submitted' | 'verified' | 'approved' | 'rejected' | 'enrolled';
  enrolledStudentId?: string | null;
  notes?: string | null;
}

export interface FeeCategory {
  id: string;
  schoolId: string;
  name: string;
  code: string;
  description?: string | null;
}

export interface FeeStructure {
  id: string;
  schoolId: string;
  academicYearId: string;
  categoryId: string;
  name: string;
  code: string;
  amount: number;
  interval: string;
}

// --------------------------------------------------------------------------
// Self-Service Portal Types
// --------------------------------------------------------------------------
export interface PortalStudentInfo {
  id: string;
  nis: string;
  nisn: string;
  name: string;
  gender: string;
  classroomName?: string;
}

export interface PortalTimetableItem {
  id: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  subjectName: string;
  subjectCode: string;
  facultyName: string;
}

export interface PortalAttendanceItem {
  id: string;
  date: string;
  status: string;
  remark?: string | null;
  classroomId: string;
}

export interface PortalGradeItem {
  id: string;
  marksObtained: number;
  grade: string;
  remark?: string | null;
  examName: string;
  examDate: string;
  totalMarks: number;
  passingMarks: number;
  weightage: number;
  subjectName: string;
}

export interface PortalInvoiceItem {
  id: string;
  name: string;
  date: string;
  amountTotal: number;
  amountResidual: number;
  state: string;
  paymentState: string;
  invoiceDueDate?: string | null;
}

export interface PortalOverviewResponse {
  students: PortalStudentInfo[];
  selectedStudentId: string | null;
  timetables: PortalTimetableItem[];
  attendance: PortalAttendanceItem[];
  grades: PortalGradeItem[];
  invoices: PortalInvoiceItem[];
}

export interface LibraryMedia {
  id: string;
  schoolId: string;
  productId: string;
  name: string;
  code: string;
  isbn?: string | null;
  author: string;
  publisher?: string | null;
  edition?: string | null;
  subjectId?: string | null;
  shelfLocation?: string | null;
  barcode: string;
  status: 'available' | 'issued' | 'lost' | 'maintenance';
  standardPrice?: number;
  listPrice?: number;
  createdAt: string;
  updatedAt: string;
}

export interface LibraryIssue {
  id: string;
  schoolId: string;
  mediaId: string;
  studentId: string;
  studentName?: string;
  studentNis?: string;
  mediaName?: string;
  mediaBarcode?: string;
  mediaAuthor?: string;
  issueDate: string;
  dueDate: string;
  returnDate?: string | null;
  condition: 'good' | 'damaged' | 'lost';
  status: 'issued' | 'returned' | 'lost';
  fineAmount?: number;
  fineInvoiceId?: string | null;
  notes?: string | null;
  createdAt: string;
}

export interface ChartOfAccount {
  id: string;
  schoolId: string;
  code: string;
  name: string;
  type: 'asset' | 'liability' | 'equity' | 'income' | 'expense';
  reconcile?: boolean;
}

export interface Employee {
  id: string;
  schoolId: string;
  userId?: string | null;
  name: string;
  nip: string;
  email: string;
  phone?: string | null;
  type: 'faculty' | 'staff';
  department?: string | null;
  jobTitle: string;
  bankName?: string | null;
  bankAccountNumber?: string | null;
  status: 'active' | 'inactive';
}

export interface SalaryStructure {
  id: string;
  schoolId: string;
  employeeId: string;
  baseSalary: number;
  hourlyTeachingRate: number;
  fixedAllowance: number;
  fixedDeduction: number;
  status: 'active' | 'archived';
  employeeName?: string;
}

export interface Payslip {
  id: string;
  schoolId: string;
  batchRunId?: string | null;
  employeeId: string;
  employeeName?: string;
  employeeNip?: string;
  periodMonth: number;
  periodYear: number;
  baseSalary: number;
  teachingSessionsCount: number;
  teachingHonorAmount: number;
  allowanceAmount: number;
  deductionAmount: number;
  netSalary: number;
  status: 'draft' | 'confirmed' | 'paid' | 'cancelled';
  moveId?: string | null;
  createdAt: number | string;
}

export interface PayslipBatchRun {
  id: string;
  schoolId: string;
  name: string;
  periodMonth: number;
  periodYear: number;
  totalAmount: number;
  totalEmployees: number;
  status: 'draft' | 'confirmed';
  createdAt: number | string;
}

export interface Assignment {
  id: string;
  schoolId: string;
  classroomId: string;
  classroomName?: string;
  subjectId: string;
  subjectName?: string;
  facultyId: string;
  facultyName?: string;
  examSessionId?: string | null;
  title: string;
  description: string;
  dueDate: string;
  maxScore: number;
  weightage?: number;
  status: 'draft' | 'published' | 'closed';
  createdAt?: string | number;
  submission?: AssignmentSubmission | null;
}

export interface AssignmentSubmission {
  id: string;
  schoolId?: string;
  assignmentId: string;
  studentId: string;
  studentName?: string;
  studentNis?: string;
  submissionDate: string;
  content: string;
  fileUrl?: string | null;
  score?: number | null;
  grade?: string | null;
  feedback?: string | null;
  status: 'submitted' | 'graded' | 'late' | 'resubmit';
  createdAt?: string | number;
  updatedAt?: string | number;
}

