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
  status: 'draft' | 'published' | 'closed';
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
  paymentState: 'not_paid' | 'paid' | 'partial';
  invoiceDueDate?: string | null;
}

export interface InventoryProduct {
  id: string;
  schoolId: string;
  name: string;
  code: string;
  type: 'storable' | 'consumable' | 'service' | 'asset';
  uom: string;
  listPrice?: number;
  standardPrice?: number;
  serialNumber?: string | null;
}

export interface TrialBalanceReport {
  totalDebit: number;
  totalCredit: number;
  isBalanced: boolean;
  lineCount: number;
}

export interface ReportCardGrade {
  id: string;
  sessionId: string;
  studentId: string;
  marksObtained: number;
  grade: string;
  remark?: string | null;
  subjectName?: string;
}

export interface ReportCardResponse {
  studentId: string;
  status: string;
  term: string;
  summary: {
    totalSubjects: number;
    averageScore: string | number;
  };
  grades: ReportCardGrade[];
}

export const DEMO_USERS: Record<string, UserProfile> = {
  admin: {
    name: 'Bambang Sudarmono, M.Pd',
    role: 'superadmin',
    email: 'admin@sekolah.demo',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'
  },
  finance: {
    name: 'Siti Rahmawati, S.E',
    role: 'accountant',
    email: 'finance@sekolah.demo',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100'
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
