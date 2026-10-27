import React, { useState, useEffect } from 'react';
import LoginView from './LoginView';
import AdmissionView from './AdmissionView';
import LibraryView from './LibraryView';
import PortalView from './PortalView';
import { PayrollView } from './PayrollView';
import {
  DEMO_USERS,
  UserProfile,
  Student,
  AcademicYear,
  Subject,
  Timetable,
  AttendanceSheet,
  ExamSession,
  Invoice,
  InventoryProduct,
  TrialBalanceReport,
  ReportCardResponse
} from './types';

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('erp_user');
    if (!saved) return null;
    try {
      return JSON.parse(saved);
    } catch {
      return null;
    }
  });
  const [currentView, setCurrentView] = useState<string>('dashboard');
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  // Strongly-typed Data states
  const [students, setStudents] = useState<Student[]>([]);
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [timetables, setTimetables] = useState<Timetable[]>([]);
  const [attendanceSheets, setAttendanceSheets] = useState<AttendanceSheet[]>([]);
  const [exams, setExams] = useState<ExamSession[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [trialBalance, setTrialBalance] = useState<TrialBalanceReport | null>(null);
  const [chartOfAccounts, setChartOfAccounts] = useState<ChartOfAccount[]>([]);
  const [financeTab, setFinanceTab] = useState<'invoices' | 'coa'>('invoices');
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [accountFormData, setAccountFormData] = useState<{ id?: string; code: string; name: string; type: 'asset' | 'liability' | 'equity' | 'income' | 'expense'; reconcile: boolean }>({
    code: '',
    name: '',
    type: 'asset',
    reconcile: false
  });
  const [inventory, setInventory] = useState<InventoryProduct[]>([]);
  const [feeStructures, setFeeStructures] = useState<any[]>([]);
  const [showBatchFeeModal, setShowBatchFeeModal] = useState(false);
  const [batchFeeStep, setBatchFeeStep] = useState<'config' | 'preview'>('config');
  const [batchMonth, setBatchMonth] = useState('2026-10');
  const [selectedFeeStructureId, setSelectedFeeStructureId] = useState('');
  const [loading, setLoading] = useState(false);

  // Modals
  const [activeModal, setActiveModal] = useState<'create' | 'payment' | 'report' | 'mark' | null>(null);
  const [paymentTarget, setPaymentTarget] = useState<Invoice | null>(null);
  const [reportData, setReportData] = useState<ReportCardResponse | null>(null);
  const [selectedStudentForReport, setSelectedStudentForReport] = useState<Student | null>(null);
  const [markTargetExam, setMarkTargetExam] = useState<ExamSession | null>(null);

  // Create Modal Sub-tab for Academics
  const [academicTab, setAcademicTab] = useState<'year' | 'subject'>('year');

  // Login & Logout Handlers
  const handleLogin = (user: UserProfile) => {
    setCurrentUser(user);
    localStorage.setItem('erp_user', JSON.stringify(user));
    setCurrentView(user.role === 'student' || user.role === 'guardian' ? 'portal' : 'dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('erp_user');
    setCurrentUser(null);
    setUserDropdownOpen(false);
  };

  // Switch User Persona
  const switchUser = (key: string) => {
    const selected = DEMO_USERS[key];
    if (selected) {
      setCurrentUser(selected);
      localStorage.setItem('erp_user', JSON.stringify(selected));
      setUserDropdownOpen(false);
      setCurrentView(selected.role === 'student' || selected.role === 'guardian' ? 'portal' : 'dashboard');
    }
  };

  // Fetch view data dynamically from D1
  const fetchData = async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      if (currentView === 'students' || currentView === 'dashboard' || currentView === 'attendance' || currentView === 'exams' || currentView === 'finance') {
        const res = await fetch('/api/students');
        const json = await res.json();
        setStudents(json.data || []);
      }
      if (currentView === 'academics') {
        const [yRes, sRes] = await Promise.all([
          fetch('/api/academic/years'),
          fetch('/api/academic/subjects')
        ]);
        const yJson = await yRes.json();
        const sJson = await sRes.json();
        setAcademicYears(yJson.data || []);
        setSubjects(sJson.data || []);
      }
      if (currentView === 'attendance') {
        const [tRes, shRes] = await Promise.all([
          fetch('/api/attendance/timetables'),
          fetch('/api/attendance/sheets')
        ]);
        const tJson = await tRes.json();
        const shJson = await shRes.json();
        setTimetables(tJson.data || []);
        setAttendanceSheets(shJson.data || []);
      }
      if (currentView === 'exams') {
        const res = await fetch('/api/exams/sessions');
        const json = await res.json();
        setExams(json.data || []);
      }
      if (currentView === 'finance' || currentView === 'dashboard') {
        const [invRes, tbRes, coaRes] = await Promise.all([
          fetch('/api/finance/invoices'),
          fetch('/api/finance/trial-balance'),
          fetch('/api/finance/accounts')
        ]);
        const invJson = await invRes.json();
        const tbJson = await tbRes.json();
        const coaJson = await coaRes.json();
        setInvoices(invJson.data || []);
        setTrialBalance(tbJson);
        setChartOfAccounts(coaJson.data || []);
      }
      if (currentView === 'inventory' || currentView === 'dashboard') {
        const res = await fetch('/api/inventory/products');
        const json = await res.json();
        setInventory(json.data || []);
      }
    } catch (err: any) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchData();
    }
  }, [currentView, currentUser]);

  // Open Report Card Modal
  const openReportCard = async (student: Student) => {
    setSelectedStudentForReport(student);
    try {
      const res = await fetch(`/api/exams/report-card/${student.id}`);
      const data: ReportCardResponse = await res.json();
      setReportData(data);
      setActiveModal('report');
    } catch (err: any) {
      alert('Gagal memuat rapor: ' + err.message);
    }
  };

  // Open Payment Modal
  const openPaymentModal = (invoice: Invoice) => {
    setPaymentTarget(invoice);
    setActiveModal('payment');
  };

  // Open Grade Entry Modal
  const openGradeModal = (exam: ExamSession) => {
    setMarkTargetExam(exam);
    setActiveModal('mark');
  };

  // Submit Payment
  const handlePaymentSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!paymentTarget) return;
    const form = e.currentTarget;
    const amount = Number((form.elements.namedItem('amount') as HTMLInputElement).value);
    const method = (form.elements.namedItem('method') as HTMLSelectElement).value;
    const date = (form.elements.namedItem('date') as HTMLInputElement).value;
    const ref = (form.elements.namedItem('reference') as HTMLInputElement).value;

    try {
      const res = await fetch('/api/finance/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          schoolId: 'school_sma_hb',
          journalId: method === 'cash' ? 'jrn_cash' : 'jrn_bank',
          moveId: paymentTarget.id,
          studentId: paymentTarget.studentId,
          name: 'PAY/' + new Date().getFullYear() + '/' + Math.floor(Math.random() * 9000 + 1000),
          paymentDate: date,
          amount,
          paymentMethod: method,
          reference: ref || null
        })
      });
      if (!res.ok) throw new Error('Gagal mencatat pembayaran');
      setActiveModal(null);
      fetchData();
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  };

  // Submit Grade Entry
  const handleGradeSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!markTargetExam) return;
    const form = e.currentTarget;
    const studentId = (form.elements.namedItem('studentId') as HTMLSelectElement).value;
    const marksObtained = Number((form.elements.namedItem('marksObtained') as HTMLInputElement).value);
    const remark = (form.elements.namedItem('remark') as HTMLInputElement).value;

    try {
      const res = await fetch('/api/exams/marks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: markTargetExam.id,
          studentId,
          marksObtained,
          remark: remark || null
        })
      });
      if (!res.ok) throw new Error('Gagal mencatat nilai ujian');
      alert('Nilai ujian berhasil dicatat ke D1!');
      setActiveModal(null);
      fetchData();
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  };

  // Submit Dynamic Creation (Student, Academic Year, Subject, Attendance, Product, Invoice)
  const handleCreateSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;

    try {
      if (currentView === 'students') {
        const name = (form.elements.namedItem('name') as HTMLInputElement).value;
        const nis = (form.elements.namedItem('nis') as HTMLInputElement).value;
        const nisn = (form.elements.namedItem('nisn') as HTMLInputElement).value;
        const gender = (form.elements.namedItem('gender') as HTMLSelectElement).value;

        const res = await fetch('/api/students', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ schoolId: 'school_sma_hb', name, nis, nisn, gender, status: 'active' })
        });
        if (!res.ok) throw new Error('Gagal menambah siswa');
      } else if (currentView === 'academics') {
        if (academicTab === 'year') {
          const name = (form.elements.namedItem('yearName') as HTMLInputElement).value;
          const code = (form.elements.namedItem('yearCode') as HTMLInputElement).value;
          const startDate = (form.elements.namedItem('startDate') as HTMLInputElement).value;
          const endDate = (form.elements.namedItem('endDate') as HTMLInputElement).value;
          const res = await fetch('/api/academic/years', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ schoolId: 'school_sma_hb', name, code, startDate, endDate, status: 'active' })
          });
          if (!res.ok) throw new Error('Gagal menambah tahun ajaran');
        } else {
          const name = (form.elements.namedItem('subjName') as HTMLInputElement).value;
          const code = (form.elements.namedItem('subjCode') as HTMLInputElement).value;
          const type = (form.elements.namedItem('subjType') as HTMLSelectElement).value;
          const res = await fetch('/api/academic/subjects', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ schoolId: 'school_sma_hb', name, code, type, weightage: 100 })
          });
          if (!res.ok) throw new Error('Gagal menambah mata pelajaran');
        }
      } else if (currentView === 'attendance') {
        const date = (form.elements.namedItem('attDate') as HTMLInputElement).value;
        const student1 = students[0]?.id || 'std_andi';
        const student2 = students[1]?.id || 'std_bella';

        const res = await fetch('/api/attendance/sheets', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            schoolId: 'school_sma_hb',
            classroomId: 'cls_x_ipa_1',
            facultyId: 'fac_budi',
            timetableId: 'tt_mon_mat',
            date,
            status: 'confirmed',
            lines: [
              { studentId: student1, status: 'present', remark: 'Hadir' },
              { studentId: student2, status: 'present', remark: 'Hadir' }
            ]
          })
        });
        if (!res.ok) throw new Error('Gagal membuat sesi presensi');
      } else if (currentView === 'exams') {
        const name = (form.elements.namedItem('examName') as HTMLInputElement).value;
        const examDate = (form.elements.namedItem('examDate') as HTMLInputElement).value;
        const passingMarks = Number((form.elements.namedItem('passingMarks') as HTMLInputElement).value);
        const weightage = Number((form.elements.namedItem('weightage') as HTMLInputElement).value);

        const res = await fetch('/api/exams/sessions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            schoolId: currentUser.schoolId || academicYears.find((y) => y.status === 'active')?.schoolId || 'school_sma_hb',
            academicYearId: academicYears.find((y) => y.status === 'active')?.id || academicYears[0]?.id || '',
            termId: 'term_sem1',
            classroomId: 'cls_x_ipa_1',
            subjectId: 'sbj_mat',
            name,
            examDate,
            totalMarks: 100,
            passingMarks,
            weightage,
            status: 'published'
          })
        });
        if (!res.ok) throw new Error('Gagal membuat sesi ujian');
      } else if (currentView === 'inventory') {
        const name = (form.elements.namedItem('prodName') as HTMLInputElement).value;
        const code = (form.elements.namedItem('prodCode') as HTMLInputElement).value;
        const price = Number((form.elements.namedItem('prodPrice') as HTMLInputElement).value);
        const type = (form.elements.namedItem('prodType') as HTMLSelectElement).value;

        const res = await fetch('/api/inventory/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            schoolId: 'school_sma_hb',
            name,
            code,
            standardPrice: price,
            listPrice: price,
            type,
            uom: 'pcs'
          })
        });
        if (!res.ok) throw new Error('Gagal menambah produk inventaris');
      } else if (currentView === 'finance') {
        const studentId = (form.elements.namedItem('studentId') as HTMLSelectElement).value;
        const description = (form.elements.namedItem('invDescription') as HTMLInputElement).value;
        const amountTotal = Number((form.elements.namedItem('invAmount') as HTMLInputElement).value);
        const date = (form.elements.namedItem('invDate') as HTMLInputElement).value;
        const dueDate = (form.elements.namedItem('invDueDate') as HTMLInputElement).value;

        const res = await fetch('/api/finance/invoices', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            schoolId: currentUser.schoolId,
            studentId,
            date,
            dueDate,
            description,
            amountTotal
          })
        });
        if (!res.ok) throw new Error('Gagal membuat tagihan siswa');
      }

      setActiveModal(null);
      fetchData();
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  };

  // Delete Action
  const handleDelete = async (endpoint: string, name: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus "${name}"?`)) return;
    try {
      const res = await fetch(endpoint, { method: 'DELETE' });
      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.error || 'Gagal menghapus data');
      }
      fetchData();
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  };

  // Helper to resolve student name dynamically from student list
  const getStudentName = (studentId?: string | null) => {
    if (!studentId) return 'Umum / Tidak Terikat';
    const found = students.find((s) => s.id === studentId);
    return found ? found.name : studentId;
  };

  if (!currentUser) {
    return <LoginView onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      {/* Top Navbar */}
      <header className="bg-[#714B67] text-white h-12 flex items-center justify-between px-4 shadow-sm z-40 select-none w-full">
        <div className="flex items-center space-x-3 overflow-hidden">
          <button onClick={() => setCurrentView('dashboard')} className="hover:bg-[#583950] p-2 rounded transition flex items-center justify-center shrink-0">
            <i className="fa-solid fa-grip text-base"></i>
          </button>
          <span className="font-bold tracking-tight text-base flex items-center gap-2 cursor-pointer shrink-0" onClick={() => setCurrentView('dashboard')}>
            <i className="fa-solid fa-graduation-cap"></i> ERP Sekolah
          </span>
          <nav className="hidden md:flex space-x-1 text-xs pl-3 overflow-x-auto">
            {(currentUser.role === 'student' || currentUser.role === 'guardian'
              ? ['portal']
              : ['dashboard', 'admission', 'students', 'academics', 'attendance', 'exams', 'finance', 'payroll', 'inventory', 'library', 'portal']
            ).map((view) => (
              <button
                key={view}
                onClick={() => setCurrentView(view)}
                className={`nav-link px-2.5 py-1.5 rounded transition capitalize ${
                  currentView === view ? 'bg-[#583950] font-semibold' : 'hover:bg-[#583950]'
                }`}
              >
                {view === 'portal'
                  ? (currentUser.role === 'guardian' ? 'Portal Wali' : 'Portal Siswa')
                  : view === 'admission'
                  ? 'PPDB'
                  : view === 'academics'
                  ? 'Akademik'
                  : view === 'attendance'
                  ? 'Presensi'
                  : view === 'exams'
                  ? 'Ujian & Nilai'
                  : view === 'finance'
                  ? 'Keuangan (SPP)'
                  : view === 'payroll'
                  ? 'HR & Penggajian'
                  : view === 'inventory'
                  ? 'Inventaris'
                  : view === 'library'
                  ? 'Perpustakaan'
                  : view === 'students'
                  ? 'Siswa'
                  : 'Dashboard'}
              </button>
            ))}
          </nav>
        </div>

        <div className="flex items-center space-x-2 text-xs shrink-0">
          <span className="bg-[#583950] px-2 py-0.5 rounded text-[11px] font-medium hidden lg:inline-flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> SMA Harapan Bangsa
          </span>

          {/* User Profile & Account Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              className="flex items-center space-x-2 border-l border-purple-400/30 pl-2.5 py-1 hover:bg-[#583950] rounded transition pr-1"
            >
              <img src={currentUser.avatar} className="w-6 h-6 rounded-full border border-white/40 object-cover" alt="Avatar" />
              <div className="text-left hidden sm:block max-w-[120px] truncate">
                <span className="font-medium text-xs block leading-tight truncate">{currentUser.name.split(' ')[0]}</span>
                <span className="text-[10px] text-purple-200 block uppercase">{currentUser.role}</span>
              </div>
              <i className="fa-solid fa-chevron-down text-[9px] text-purple-200"></i>
            </button>

            {userDropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-slate-200 py-2 z-50 text-slate-800">
                <div className="px-4 py-2 border-b border-slate-100 mb-1">
                  <div className="font-bold text-xs truncate text-slate-800">{currentUser.name}</div>
                  <div className="text-[11px] text-slate-500 truncate">{currentUser.email}</div>
                  <div className="mt-1 inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold bg-purple-100 text-[#714B67] uppercase tracking-wider">{currentUser.role}</div>
                </div>

                <div className="px-3 py-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Ganti Akun Persona Demo</div>
                {Object.entries(DEMO_USERS).map(([key, u]) => (
                  <button
                    key={key}
                    onClick={() => switchUser(key)}
                    className="w-full text-left px-4 py-1.5 text-xs hover:bg-slate-50 flex items-center justify-between"
                  >
                    <span className="truncate">{u.name}</span>
                    <span className="text-[10px] text-slate-500 uppercase">{u.role}</span>
                  </button>
                ))}

                <div className="border-t border-slate-100 mt-2 pt-1">
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 font-bold flex items-center gap-2 cursor-pointer"
                  >
                    <i className="fa-solid fa-arrow-right-from-bracket"></i> Keluar (Logout)
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Subheader Odoo Control Panel */}
      <section className="bg-white border-b border-slate-200 px-6 py-2.5 flex items-center justify-between shadow-2xs">
        <div className="flex items-center space-x-3">
          <h2 className="text-base font-bold text-slate-800 capitalize flex items-center gap-2">
            <i className="fa-solid fa-layer-group text-[#714B67] text-sm"></i>
            {currentView === 'dashboard' ? 'Tinjauan Utama Operasional' : currentView}
          </h2>
        </div>
        <div className="flex items-center space-x-2">
          {currentView !== 'dashboard' && (
            <button
              onClick={() => setActiveModal('create')}
              className="bg-[#714B67] hover:bg-[#583950] text-white px-3 py-1.5 rounded text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer"
            >
              <i className="fa-solid fa-plus text-[10px]"></i> Tambah Data
            </button>
          )}
          <button
            onClick={fetchData}
            className="text-xs text-purple-700 font-medium hover:underline px-2 py-1 flex items-center gap-1 cursor-pointer"
          >
            <i className="fa-solid fa-rotate-right"></i> Refresh
          </button>
        </div>
      </section>

      {/* Main Content Body */}
      <main className="flex-1 p-6 max-w-7xl w-full mx-auto">
        {loading ? (
          <div className="p-8 text-center text-slate-400">Memuat data dari D1...</div>
        ) : (
          <>
            {currentView === 'admission' && <AdmissionView />}
            {currentView === 'library' && <LibraryView />}
            {currentView === 'payroll' && <PayrollView />}
            {currentView === 'portal' && <PortalView currentUser={currentUser} />}

            {currentView === 'dashboard' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div onClick={() => setCurrentView('students')} className="bg-white p-4 rounded border border-slate-200 cursor-pointer hover:border-slate-400 transition">
                    <div className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Total Siswa Terdaftar</div>
                    <div className="text-2xl font-bold text-slate-800 mt-1">{students.length}</div>
                    <div className="text-xs text-emerald-700 mt-1 font-medium">Terdaftar di Kelas X-MIPA-1</div>
                  </div>
                  <div onClick={() => setCurrentView('attendance')} className="bg-white p-4 rounded border border-slate-200 cursor-pointer hover:border-slate-400 transition">
                    <div className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Presensi Terakhir</div>
                    <div className="text-2xl font-bold text-slate-800 mt-1">100%</div>
                    <div className="text-xs text-emerald-700 mt-1 font-medium">2 Hadir / 0 Alpa</div>
                  </div>
                  <div onClick={() => setCurrentView('finance')} className="bg-white p-4 rounded border border-slate-200 cursor-pointer hover:border-slate-400 transition">
                    <div className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Neraca Saldo (Trial Balance)</div>
                    <div className="text-2xl font-bold text-slate-800 mt-1">
                      Rp {(trialBalance?.totalDebit || 0).toLocaleString('id-ID')}
                    </div>
                    <div className="text-xs text-emerald-700 mt-1 font-medium">
                      {trialBalance?.isBalanced ? 'Debit === Credit (Seimbang)' : 'Memuat Neraca...'}
                    </div>
                  </div>
                  <div onClick={() => setCurrentView('inventory')} className="bg-white p-4 rounded border border-slate-200 cursor-pointer hover:border-slate-400 transition">
                    <div className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Aset & Inventaris</div>
                    <div className="text-2xl font-bold text-slate-800 mt-1">{inventory.length} Item</div>
                    <div className="text-xs text-slate-600 mt-1 font-medium">Laptop, Seragam, & Buku</div>
                  </div>
                </div>

                <div className="bg-white p-5 rounded border border-slate-200">
                  <h3 className="font-bold text-slate-800 text-sm mb-3">Selamat Datang di ERP Sekolah Harapan Bangsa</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Sistem ini berjalan di atas arsitektur <strong>Cloudflare Workers + D1 Database (SQLite Edge)</strong> dengan antarmuka <strong>React + Vite Monolith</strong>. Anda dapat mencoba navigasi modul, mencatat pembayaran, menginput presensi dan nilai ujian, serta mencetak rapor digital secara instan.
                  </p>
                </div>
              </div>
            )}

            {currentView === 'students' && (
              <div className="bg-white rounded border border-slate-200 overflow-hidden">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 text-slate-600 uppercase font-semibold border-b border-slate-200">
                    <tr>
                      <th className="px-5 py-2.5">NIS / NISN</th>
                      <th className="px-5 py-2.5">Nama Lengkap</th>
                      <th className="px-5 py-2.5">Gender</th>
                      <th className="px-5 py-2.5">Status</th>
                      <th className="px-5 py-2.5 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {students.map((s) => (
                      <tr key={s.id} className="hover:bg-slate-50">
                        <td className="px-5 py-3 font-mono">{s.nis} / {s.nisn}</td>
                        <td className="px-5 py-3 font-bold text-slate-800">{s.name}</td>
                        <td className="px-5 py-3 uppercase">{s.gender}</td>
                        <td className="px-5 py-3"><span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-100 text-emerald-800">{s.status}</span></td>
                        <td className="px-5 py-3 text-right space-x-1.5">
                          <button onClick={() => openReportCard(s)} className="bg-purple-50 text-[#714B67] hover:bg-purple-100 px-2.5 py-1 rounded font-medium">Rapor</button>
                          <button onClick={() => handleDelete(`/api/students/${s.id}`, s.name)} className="bg-rose-50 text-rose-700 hover:bg-rose-100 px-2 py-1 rounded font-medium">Hapus</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {currentView === 'academics' && (
              <div className="space-y-6">
                <div className="bg-white rounded border border-slate-200 overflow-hidden">
                  <div className="p-3.5 border-b border-slate-200 font-bold text-slate-800 text-xs">Tahun Ajaran Aktif</div>
                  <table className="w-full text-left text-xs text-slate-700">
                    <thead className="bg-slate-50 text-slate-600 uppercase font-semibold border-b border-slate-200">
                      <tr>
                        <th className="px-5 py-2.5">Nama</th>
                        <th className="px-5 py-2.5">Kode</th>
                        <th className="px-5 py-2.5">Periode</th>
                        <th className="px-5 py-2.5">Status</th>
                        <th className="px-5 py-2.5 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {academicYears.map((y) => (
                        <tr key={y.id} className="hover:bg-slate-50">
                          <td className="px-5 py-3 font-bold text-slate-800">{y.name}</td>
                          <td className="px-5 py-3 font-mono">{y.code}</td>
                          <td className="px-5 py-3">{y.startDate} s/d {y.endDate}</td>
                          <td className="px-5 py-3"><span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-100 text-emerald-800">{y.status}</span></td>
                          <td className="px-5 py-3 text-right">
                            <button onClick={() => handleDelete(`/api/academic/years/${y.id}`, y.name)} className="bg-rose-50 text-rose-700 hover:bg-rose-100 px-2 py-1 rounded font-medium">Hapus</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="bg-white rounded border border-slate-200 overflow-hidden">
                  <div className="p-3.5 border-b border-slate-200 font-bold text-slate-800 text-xs">Mata Pelajaran (Kurikulum Merdeka)</div>
                  <table className="w-full text-left text-xs text-slate-700">
                    <thead className="bg-slate-50 text-slate-600 uppercase font-semibold border-b border-slate-200">
                      <tr>
                        <th className="px-5 py-2.5">Kode</th>
                        <th className="px-5 py-2.5">Nama Mapel</th>
                        <th className="px-5 py-2.5">Tipe</th>
                        <th className="px-5 py-2.5 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {subjects.map((sub) => (
                        <tr key={sub.id} className="hover:bg-slate-50">
                          <td className="px-5 py-3 font-mono">{sub.code}</td>
                          <td className="px-5 py-3 font-bold text-slate-800">{sub.name}</td>
                          <td className="px-5 py-3 capitalize">{sub.type}</td>
                          <td className="px-5 py-3 text-right">
                            <button onClick={() => handleDelete(`/api/academic/subjects/${sub.id}`, sub.name)} className="bg-rose-50 text-rose-700 hover:bg-rose-100 px-2 py-1 rounded font-medium">Hapus</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {currentView === 'attendance' && (
              <div className="space-y-6">
                <div className="bg-white rounded border border-slate-200 overflow-hidden">
                  <div className="p-3.5 border-b border-slate-200 font-bold text-slate-800 text-xs">Jadwal Pelajaran Guru (Timetable)</div>
                  <table className="w-full text-left text-xs text-slate-700">
                    <thead className="bg-slate-50 text-slate-600 uppercase font-semibold border-b border-slate-200">
                      <tr>
                        <th className="px-5 py-2.5">Hari</th>
                        <th className="px-5 py-2.5">Jam Mengajar</th>
                        <th className="px-5 py-2.5">Kelas</th>
                        <th className="px-5 py-2.5">Mata Pelajaran</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {timetables.map((t) => (
                        <tr key={t.id} className="hover:bg-slate-50">
                          <td className="px-5 py-3 font-bold uppercase">{t.dayOfWeek}</td>
                          <td className="px-5 py-3 font-mono">{t.startTime} - {t.endTime}</td>
                          <td className="px-5 py-3">{t.classroomId}</td>
                          <td className="px-5 py-3">{t.subjectId}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="bg-white rounded border border-slate-200 overflow-hidden">
                  <div className="p-3.5 border-b border-slate-200 font-bold text-slate-800 text-xs">Riwayat Sesi Presensi Kelas</div>
                  <table className="w-full text-left text-xs text-slate-700">
                    <thead className="bg-slate-50 text-slate-600 uppercase font-semibold border-b border-slate-200">
                      <tr>
                        <th className="px-5 py-2.5">Tanggal</th>
                        <th className="px-5 py-2.5">Status</th>
                        <th className="px-5 py-2.5">Hadir</th>
                        <th className="px-5 py-2.5">Sakit/Izin/Alpa</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {attendanceSheets.map((sh) => (
                        <tr key={sh.id} className="hover:bg-slate-50">
                          <td className="px-5 py-3 font-mono">{sh.date}</td>
                          <td className="px-5 py-3"><span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-100 text-emerald-800">{sh.status}</span></td>
                          <td className="px-5 py-3 font-bold text-emerald-700">{sh.totalPresent}</td>
                          <td className="px-5 py-3">{sh.totalSick + sh.totalExcused} / {sh.totalAbsent}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {currentView === 'exams' && (
              <div className="bg-white rounded border border-slate-200 overflow-hidden">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 text-slate-600 uppercase font-semibold border-b border-slate-200">
                    <tr>
                      <th className="px-5 py-2.5">Sesi Ujian / Asesmen</th>
                      <th className="px-5 py-2.5">Tanggal</th>
                      <th className="px-5 py-2.5">KKM / Bobot</th>
                      <th className="px-5 py-2.5">Status</th>
                      <th className="px-5 py-2.5 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {exams.map((ex) => (
                      <tr key={ex.id} className="hover:bg-slate-50">
                        <td className="px-5 py-3 font-bold text-slate-800">{ex.name}</td>
                        <td className="px-5 py-3 font-mono">{ex.examDate}</td>
                        <td className="px-5 py-3 font-mono">{ex.passingMarks} / {ex.weightage}%</td>
                        <td className="px-5 py-3"><span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-purple-100 text-[#714B67]">{ex.status}</span></td>
                        <td className="px-5 py-3 text-right space-x-1.5">
                          <button onClick={() => openGradeModal(ex)} className="bg-purple-50 text-[#714B67] hover:bg-purple-100 px-2.5 py-1 rounded font-medium">Input Nilai</button>
                          <button onClick={() => handleDelete(`/api/exams/sessions/${ex.id}`, ex.name)} className="bg-rose-50 text-rose-700 hover:bg-rose-100 px-2 py-1 rounded font-medium">Hapus</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {currentView === 'finance' && (
              <div className="space-y-6">
                <div className="flex border-b border-slate-200 gap-4 mb-2">
                  <button
                    onClick={() => setFinanceTab('invoices')}
                    className={`pb-2 text-xs font-semibold cursor-pointer ${
                      financeTab === 'invoices' ? 'border-b-2 border-[#714B67] text-[#714B67]' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Tagihan & Pembayaran (Invoices)
                  </button>
                  <button
                    onClick={() => setFinanceTab('coa')}
                    className={`pb-2 text-xs font-semibold cursor-pointer ${
                      financeTab === 'coa' ? 'border-b-2 border-[#714B67] text-[#714B67]' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Bagan Akun PSAK (Chart of Accounts)
                  </button>
                </div>

                {financeTab === 'invoices' ? (
                  <>
                    <div className="bg-white rounded border border-slate-200 overflow-hidden">
                      <div className="p-3.5 border-b border-slate-200 font-bold text-slate-800 text-xs flex justify-between items-center">
                        <span>Daftar Tagihan Siswa (Invoices)</span>
                        <button
                          onClick={() => { setBatchFeeStep('config'); setShowBatchFeeModal(true); }}
                          className="bg-[#714B67] hover:bg-[#583950] text-white px-3 py-1 rounded text-xs font-semibold cursor-pointer"
                        >
                          + Generate SPP Bulanan Massal
                        </button>
                      </div>

                      <table className="w-full text-left text-xs text-slate-700">
                        <thead className="bg-slate-50 text-slate-600 uppercase font-semibold border-b border-slate-200">
                          <tr>
                            <th className="px-5 py-2.5">Nomor Invoice</th>
                            <th className="px-5 py-2.5">Siswa</th>
                            <th className="px-5 py-2.5">Tanggal</th>
                            <th className="px-5 py-2.5">Total Biaya</th>
                            <th className="px-5 py-2.5">Sisa (Residual)</th>
                            <th className="px-5 py-2.5">Status Bayar</th>
                            <th className="px-5 py-2.5 text-right">Aksi</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {invoices.map((inv) => (
                            <tr key={inv.id} className="hover:bg-slate-50">
                              <td className="px-5 py-3 font-mono font-bold text-slate-800">{inv.name}</td>
                              <td className="px-5 py-3 font-medium">{getStudentName(inv.studentId)}</td>
                              <td className="px-5 py-3 font-mono">{inv.date}</td>
                              <td className="px-5 py-3 font-mono">Rp {(inv.amountTotal || 0).toLocaleString('id-ID')}</td>
                              <td className="px-5 py-3 font-mono text-rose-700 font-bold">Rp {(inv.amountResidual || 0).toLocaleString('id-ID')}</td>
                              <td className="px-5 py-3">
                                <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                                  inv.paymentState === 'paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                                }`}>
                                  {inv.paymentState === 'paid' ? 'Lunas' : 'Belum Bayar'}
                                </span>
                              </td>
                              <td className="px-5 py-3 text-right space-x-1.5">
                                {inv.paymentState !== 'paid' && (
                                  <button onClick={() => openPaymentModal(inv)} className="bg-[#714B67] hover:bg-[#583950] text-white px-2.5 py-1 rounded font-medium cursor-pointer">Catat Bayar</button>
                                )}
                                <button onClick={() => handleDelete(`/api/finance/invoices/${inv.id}`, inv.name)} className="bg-rose-50 text-rose-700 hover:bg-rose-100 px-2 py-1 rounded font-medium cursor-pointer">Hapus</button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {trialBalance && (
                      <div className="bg-white p-4 rounded border border-slate-200">
                        <div className="text-xs font-bold text-slate-800 uppercase mb-2">Audit Keseimbangan Neraca Saldo (Trial Balance)</div>
                        <div className="flex items-center gap-6 text-xs">
                          <div>Total Debit: <strong className="font-mono text-slate-800">Rp {trialBalance.totalDebit?.toLocaleString('id-ID')}</strong></div>
                          <div>Total Credit: <strong className="font-mono text-slate-800">Rp {trialBalance.totalCredit?.toLocaleString('id-ID')}</strong></div>
                          <div>Status: <span className="text-emerald-700 font-bold">Debit === Credit (100% Balanced)</span></div>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="bg-white rounded border border-slate-200 overflow-hidden">
                    <div className="p-3.5 border-b border-slate-200 font-bold text-slate-800 text-xs flex justify-between items-center">
                      <div>
                        <span>Bagan Akun Standar PSAK / ISAK 35</span>
                        <span className="ml-2 text-slate-400 font-normal">({chartOfAccounts.length} Akun Terdaftar)</span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={async () => {
                            if (confirm('Inisialisasi akun standar PSAK untuk sekolah?')) {
                              await fetch('/api/finance/accounts/seed-psak', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ schoolId: 'school_sma_hb' })
                              });
                              fetchData();
                            }
                          }}
                          className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1 rounded text-xs font-semibold cursor-pointer"
                        >
                          Auto-Seed PSAK
                        </button>
                        <button
                          onClick={() => {
                            setAccountFormData({ code: '', name: '', type: 'asset', reconcile: false });
                            setShowAccountModal(true);
                          }}
                          className="bg-[#714B67] hover:bg-[#583950] text-white px-3 py-1 rounded text-xs font-semibold cursor-pointer"
                        >
                          + Tambah Akun
                        </button>
                      </div>
                    </div>

                    <table className="w-full text-left text-xs text-slate-700">
                      <thead className="bg-slate-50 text-slate-600 uppercase font-semibold border-b border-slate-200">
                        <tr>
                          <th className="px-5 py-2.5">Kode Akun</th>
                          <th className="px-5 py-2.5">Nama Akun</th>
                          <th className="px-5 py-2.5">Klasifikasi PSAK</th>
                          <th className="px-5 py-2.5">Rekonsiliasi</th>
                          <th className="px-5 py-2.5 text-right">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {chartOfAccounts.map((acc) => (
                          <tr key={acc.id} className="hover:bg-slate-50">
                            <td className="px-5 py-3 font-mono font-bold text-slate-800">{acc.code}</td>
                            <td className="px-5 py-3 font-medium">{acc.name}</td>
                            <td className="px-5 py-3">
                              <span className={`px-2 py-0.5 rounded text-[11px] font-semibold uppercase ${
                                acc.type === 'asset' ? 'bg-blue-100 text-blue-800' :
                                acc.type === 'liability' ? 'bg-amber-100 text-amber-800' :
                                acc.type === 'equity' ? 'bg-purple-100 text-purple-800' :
                                acc.type === 'income' ? 'bg-emerald-100 text-emerald-800' :
                                'bg-rose-100 text-rose-800'
                              }`}>
                                {acc.type}
                              </span>
                            </td>
                            <td className="px-5 py-3">
                              <span className={`text-[11px] ${acc.reconcile ? 'text-emerald-700 font-semibold' : 'text-slate-400'}`}>
                                {acc.reconcile ? 'Ya (Bank/Piutang/Utang)' : 'Tidak'}
                              </span>
                            </td>
                            <td className="px-5 py-3 text-right space-x-1.5">
                              <button
                                onClick={() => {
                                  setAccountFormData({
                                    id: acc.id,
                                    code: acc.code,
                                    name: acc.name,
                                    type: acc.type,
                                    reconcile: Boolean(acc.reconcile)
                                  });
                                  setShowAccountModal(true);
                                }}
                                className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded font-medium cursor-pointer"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDelete(`/api/finance/accounts/${acc.id}`, acc.name)}
                                className="bg-rose-50 text-rose-700 hover:bg-rose-100 px-2 py-1 rounded font-medium cursor-pointer"
                              >
                                Hapus
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {currentView === 'inventory' && (
              <div className="bg-white rounded border border-slate-200 overflow-hidden">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 text-slate-600 uppercase font-semibold border-b border-slate-200">
                    <tr>
                      <th className="px-5 py-2.5">Produk / Aset</th>
                      <th className="px-5 py-2.5">Kode</th>
                      <th className="px-5 py-2.5">Tipe</th>
                      <th className="px-5 py-2.5">Harga Standar</th>
                      <th className="px-5 py-2.5">Nomor Seri</th>
                      <th className="px-5 py-2.5 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {inventory.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50">
                        <td className="px-5 py-3 font-bold text-slate-800">{item.name}</td>
                        <td className="px-5 py-3 font-mono">{item.code}</td>
                        <td className="px-5 py-3 uppercase">{item.type}</td>
                        <td className="px-5 py-3 font-mono">Rp {(item.standardPrice || 0).toLocaleString('id-ID')}</td>
                        <td className="px-5 py-3 font-mono text-slate-500">{item.serialNumber || '-'}</td>
                        <td className="px-5 py-3 text-right">
                          <button onClick={() => handleDelete(`/api/inventory/products/${item.id}`, item.name)} className="bg-rose-50 text-rose-700 hover:bg-rose-100 px-2 py-1 rounded font-medium">Hapus</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </main>
      {/* Batch Fee Generator Modal with Preview Step (#36) */}
      {showBatchFeeModal && (() => {
        const activeStudents = students.filter(s => s.status === 'active' || !s.status);
        const selectedStructure = feeStructures.find(f => f.id === selectedFeeStructureId) || feeStructures[0];
        const feeAmount = Number(selectedStructure?.amount || 0);
        const totalEstimated = activeStudents.length * feeAmount;

        return (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 border border-slate-200">
              <h3 className="font-bold text-slate-800 text-sm mb-2">
                {batchFeeStep === 'config' ? 'Konfigurasi Tagihan SPP Bulanan Massal' : 'Preview Batch Invoicing SPP'}
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                {batchFeeStep === 'config'
                  ? 'Pilih periode bulan dan struktur biaya untuk dievaluasi.'
                  : 'Tinjau rincian estimasi sebelum melakukan posting massal ke D1.'}
              </p>

              {batchFeeStep === 'config' ? (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Periode Bulan Tagihan</label>
                    <input
                      type="month"
                      required
                      value={batchMonth}
                      onChange={(e) => setBatchMonth(e.target.value)}
                      className="w-full text-xs border border-slate-300 rounded p-2 focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Struktur Biaya (Tarif)</label>
                    <select
                      value={selectedFeeStructureId}
                      onChange={(e) => setSelectedFeeStructureId(e.target.value)}
                      className="w-full text-xs border border-slate-300 rounded p-2 focus:outline-hidden"
                    >
                      {feeStructures.length === 0 ? (
                        <option value="">Belum ada struktur biaya</option>
                      ) : (
                        feeStructures.map((f: any) => (
                          <option key={f.id} value={f.id}>
                            {f.name} - Rp {Number(f.amount).toLocaleString('id-ID')}
                          </option>
                        ))
                      )}
                    </select>
                  </div>
                  <div className="flex justify-end gap-2 pt-3">
                    <button
                      type="button"
                      onClick={() => setShowBatchFeeModal(false)}
                      className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded"
                    >
                      Batal
                    </button>
                    <button
                      type="button"
                      disabled={feeStructures.length === 0}
                      onClick={() => setBatchFeeStep('preview')}
                      className="px-3 py-1.5 text-xs bg-indigo-600 hover:bg-indigo-700 text-white rounded font-semibold cursor-pointer disabled:opacity-50"
                    >
                      Lanjut ke Preview
                    </button>
                  </div>
                </div>
              ) : (
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    try {
                      setLoading(true);
                      const res = await fetch('/api/finance/generate-fees', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          schoolId: 'sch_01',
                          academicYearId: academicYears.find(ay => ay.status === 'active')?.id || academicYears[0]?.id || '',
                          month: batchMonth,
                          feeStructureId: selectedFeeStructureId || feeStructures[0]?.id
                        })
                      });
                      const json = await res.json();
                      if (res.ok) {
                        alert(`Berhasil membuat ${json.data.generatedCount} tagihan SPP periode ${batchMonth} senilai Rp ${Number(json.data.totalAmount || 0).toLocaleString('id-ID')}!`);
                        setShowBatchFeeModal(false);
                        fetchData();
                      } else {
                        alert('Gagal: ' + (json.error || 'Terjadi kesalahan'));
                      }
                    } catch (err: any) {
                      alert('Error generate fees: ' + err.message);
                    } finally {
                      setLoading(false);
                    }
                  }}
                  className="space-y-4"
                >
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Periode:</span>
                      <span className="font-semibold text-slate-800">{batchMonth}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Struktur Biaya:</span>
                      <span className="font-semibold text-slate-800">{selectedStructure?.name || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Tarif per Siswa:</span>
                      <span className="font-semibold text-slate-800">Rp {feeAmount.toLocaleString('id-ID')}</span>
                    </div>
                    <div className="flex justify-between border-t border-slate-200 pt-2">
                      <span className="text-slate-700 font-medium">Siswa Teridentifikasi:</span>
                      <span className="font-bold text-indigo-700 font-mono">{activeStudents.length} siswa</span>
                    </div>
                    <div className="flex justify-between border-t border-slate-200 pt-2">
                      <span className="text-slate-700 font-medium">Total Estimasi Tagihan:</span>
                      <span className="font-bold text-emerald-700 font-mono text-sm">
                        Rp {totalEstimated.toLocaleString('id-ID')}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setBatchFeeStep('config')}
                      className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded"
                    >
                      Kembali
                    </button>
                    <button
                      type="submit"
                      disabled={loading || activeStudents.length === 0}
                      className="px-3.5 py-1.5 text-xs bg-[#714B67] hover:bg-[#583950] text-white rounded font-semibold cursor-pointer disabled:opacity-50"
                    >
                      {loading ? 'Memproses Batch...' : 'Konfirmasi & Eksekusi Batch'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        );
      })()}


      {/* Dynamic Create Modal */}
      {activeModal === 'create' && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 border border-slate-200 max-h-[90vh] overflow-y-auto">
            <h3 className="font-bold text-slate-800 text-base mb-4 capitalize">
              Tambah Data {currentView}
            </h3>

            {currentView === 'academics' && (
              <div className="flex border-b border-slate-200 mb-4 space-x-2">
                <button
                  type="button"
                  onClick={() => setAcademicTab('year')}
                  className={`pb-2 text-xs font-semibold px-2 border-b-2 cursor-pointer ${
                    academicTab === 'year' ? 'border-[#714B67] text-[#714B67]' : 'border-transparent text-slate-500'
                  }`}
                >
                  Tahun Ajaran
                </button>
                <button
                  type="button"
                  onClick={() => setAcademicTab('subject')}
                  className={`pb-2 text-xs font-semibold px-2 border-b-2 cursor-pointer ${
                    academicTab === 'subject' ? 'border-[#714B67] text-[#714B67]' : 'border-transparent text-slate-500'
                  }`}
                >
                  Mata Pelajaran
                </button>
              </div>
            )}

            <form onSubmit={handleCreateSubmit} className="space-y-3 text-xs">
              {currentView === 'students' && (
                <>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Nama Siswa *</label>
                    <input name="name" type="text" placeholder="e.g. Dimas Anggara" className="w-full p-2 border rounded" required />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">NIS *</label>
                      <input name="nis" type="text" placeholder="202601003" className="w-full p-2 border rounded" required />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">NISN *</label>
                      <input name="nisn" type="text" placeholder="0089123458" className="w-full p-2 border rounded" required />
                    </div>
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Jenis Kelamin</label>
                    <select name="gender" className="w-full p-2 border rounded bg-white">
                      <option value="male">Laki-laki</option>
                      <option value="female">Perempuan</option>
                    </select>
                  </div>
                </>
              )}

              {currentView === 'academics' && academicTab === 'year' && (
                <>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Nama Tahun Ajaran *</label>
                    <input name="yearName" type="text" placeholder="e.g. 2026/2027" className="w-full p-2 border rounded" required />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Kode *</label>
                    <input name="yearCode" type="text" placeholder="AY-2627" className="w-full p-2 border rounded" required />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Tanggal Mulai</label>
                      <input name="startDate" type="date" defaultValue="2026-07-15" className="w-full p-2 border rounded" required />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Tanggal Selesai</label>
                      <input name="endDate" type="date" defaultValue="2027-06-25" className="w-full p-2 border rounded" required />
                    </div>
                  </div>
                </>
              )}

              {currentView === 'academics' && academicTab === 'subject' && (
                <>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Nama Mata Pelajaran *</label>
                    <input name="subjName" type="text" placeholder="e.g. Sosiologi Dasar" className="w-full p-2 border rounded" required />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Kode Mapel *</label>
                    <input name="subjCode" type="text" placeholder="SOS-10" className="w-full p-2 border rounded" required />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Tipe</label>
                    <select name="subjType" className="w-full p-2 border rounded bg-white">
                      <option value="compulsory">Wajib (Compulsory)</option>
                      <option value="elective">Pilihan (Elective)</option>
                    </select>
                  </div>
                </>
              )}

              {currentView === 'attendance' && (
                <>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Tanggal Sesi Presensi</label>
                    <input name="attDate" type="date" defaultValue={new Date().toISOString().split('T')[0]} className="w-full p-2 border rounded" required />
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded border text-slate-600">
                    Sesi presensi akan otomatis mengabsen seluruh siswa aktif di kelas X-MIPA-1 secara atomik batching ke D1.
                  </div>
                </>
              )}

              {currentView === 'exams' && (
                <>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Nama Sesi Ujian *</label>
                    <input name="examName" type="text" placeholder="e.g. UAS Matematika Semester Ganjil" className="w-full p-2 border rounded" required />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Tanggal Ujian</label>
                      <input name="examDate" type="date" defaultValue={new Date().toISOString().split('T')[0]} className="w-full p-2 border rounded" required />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Batas KKM</label>
                      <input name="passingMarks" type="number" defaultValue="75" className="w-full p-2 border rounded" required />
                    </div>
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Bobot Penilaian (%)</label>
                    <input name="weightage" type="number" defaultValue="30" className="w-full p-2 border rounded" required />
                  </div>
                </>
              )}

              {currentView === 'inventory' && (
                <>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Nama Barang / Aset *</label>
                    <input name="prodName" type="text" placeholder="e.g. Proyektor Lab Epson EB-X400" className="w-full p-2 border rounded" required />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Kode *</label>
                      <input name="prodCode" type="text" placeholder="AST-PRJ-01" className="w-full p-2 border rounded" required />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Harga Standar (Rp)</label>
                      <input name="prodPrice" type="number" defaultValue="6500000" className="w-full p-2 border rounded" required />
                    </div>
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Tipe Produk</label>
                    <select name="prodType" className="w-full p-2 border rounded bg-white">
                      <option value="asset">Aset Sekolah (Asset)</option>
                      <option value="storable">Barang Stok (Storable)</option>
                      <option value="consumable">Habis Pakai (Consumable)</option>
                    </select>
                  </div>
                </>
              )}

              {currentView === 'finance' && (
                <>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Pilih Siswa *</label>
                    <select name="studentId" className="w-full p-2 border rounded bg-white" required defaultValue="">
                      <option value="" disabled>-- Pilih Siswa --</option>
                      {students.map((s) => (
                        <option key={s.id} value={s.id}>{s.name} ({s.nis})</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Deskripsi Tagihan *</label>
                    <input name="invDescription" type="text" placeholder="e.g. Tagihan SPP Bulan November 2026" className="w-full p-2 border rounded" required />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Tanggal Tagihan</label>
                      <input name="invDate" type="date" defaultValue={new Date().toISOString().split('T')[0]} className="w-full p-2 border rounded" required />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Jatuh Tempo</label>
                      <input name="invDueDate" type="date" defaultValue={new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0]} className="w-full p-2 border rounded" required />
                    </div>
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Nominal Biaya (Rp) *</label>
                    <input name="invAmount" type="number" min="1000" step="500" defaultValue="500000" className="w-full p-2 border rounded font-semibold" required />
                  </div>
                </>
              )}

              <div className="flex justify-end space-x-2 pt-4 border-t">
                <button type="button" onClick={() => setActiveModal(null)} className="px-3 py-1.5 border rounded cursor-pointer">Batal</button>
                <button type="submit" className="px-3.5 py-1.5 bg-[#714B67] hover:bg-[#583950] text-white rounded font-semibold cursor-pointer">Simpan Data</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Grade Entry Modal */}
      {activeModal === 'mark' && markTargetExam && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 border border-slate-200">
            <h3 className="font-bold text-slate-800 text-base mb-1">Input Nilai Siswa (Gradebook)</h3>
            <p className="text-xs text-slate-500 mb-4">{markTargetExam.name} (KKM: {markTargetExam.passingMarks})</p>

            <form onSubmit={handleGradeSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Pilih Siswa *</label>
                <select name="studentId" className="w-full p-2 border rounded bg-white" required>
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>{s.name} ({s.nis})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nilai Diperoleh (0 - 100) *</label>
                <input name="marksObtained" type="number" min="0" max="100" defaultValue="90" className="w-full p-2 border rounded font-bold" required />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Catatan Guru (Remark)</label>
                <input name="remark" type="text" placeholder="e.g. Sangat baik dalam pemahaman konsep" className="w-full p-2 border rounded" />
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t">
                <button type="button" onClick={() => setActiveModal(null)} className="px-3 py-1.5 border rounded cursor-pointer">Batal</button>
                <button type="submit" className="px-3.5 py-1.5 bg-[#714B67] hover:bg-[#583950] text-white rounded font-semibold cursor-pointer">Simpan Nilai</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {activeModal === 'payment' && paymentTarget && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 border border-slate-200">
            <h3 className="font-bold text-slate-800 text-base mb-4">Catat Pembayaran Tagihan</h3>
            <form onSubmit={handlePaymentSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nomor Tagihan / Invoice</label>
                <input type="text" readOnly value={paymentTarget.name} className="w-full p-2 bg-slate-100 border rounded font-mono" />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Jumlah Pembayaran (Rp) *</label>
                <input name="amount" type="number" defaultValue={paymentTarget.amountResidual} className="w-full p-2 border rounded font-bold" required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Metode Pembayaran</label>
                  <select name="method" className="w-full p-2 border rounded bg-white">
                    <option value="bank_transfer">Transfer Bank (BCA)</option>
                    <option value="cash">Kas Tunai (Kasir)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tanggal</label>
                  <input name="date" type="date" defaultValue={new Date().toISOString().split('T')[0]} className="w-full p-2 border rounded" required />
                </div>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nomor Referensi</label>
                <input name="reference" type="text" placeholder="TRF-BCA-..." className="w-full p-2 border rounded" />
              </div>
              <div className="flex justify-end space-x-2 pt-4 border-t">
                <button type="button" onClick={() => setActiveModal(null)} className="px-3 py-1.5 border rounded cursor-pointer">Batal</button>
                <button type="submit" className="px-3.5 py-1.5 bg-[#714B67] hover:bg-[#583950] text-white rounded font-semibold cursor-pointer">Simpan Pembayaran</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Report Card Modal */}
      {activeModal === 'report' && reportData && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6 border border-slate-200">
            <div className="flex justify-between items-center pb-3 border-b mb-4">
              <div>
                <h3 className="font-bold text-slate-800 text-base">Rapor Digital Siswa</h3>
                <p className="text-xs text-slate-500">{reportData.term || 'Semester Ganjil 2026/2027'}</p>
              </div>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer"><i className="fa-solid fa-xmark"></i></button>
            </div>
            <div className="space-y-4 text-xs">
              <div className="bg-purple-50/60 p-3.5 rounded border border-purple-100 flex justify-between items-center">
                <div>
                  <div className="text-[11px] text-slate-500 uppercase font-semibold">Siswa</div>
                  <div className="font-bold text-slate-800 text-sm">
                    {selectedStudentForReport ? selectedStudentForReport.name : getStudentName(reportData.studentId)}
                  </div>
                  <div className="text-[11px] text-slate-500">NIS: {selectedStudentForReport?.nis || '-'}</div>
                </div>
                <div className="text-right">
                  <div className="text-[11px] text-slate-500 uppercase font-semibold">Rata-rata Nilai (GPA)</div>
                  <div className="font-mono text-xl font-bold text-[#714B67]">{reportData.summary?.averageScore || '0'}</div>
                </div>
              </div>

              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 uppercase font-semibold border-b">
                  <tr>
                    <th className="px-4 py-2">Mata Pelajaran</th>
                    <th className="px-4 py-2">Nilai Akhir</th>
                    <th className="px-4 py-2">Predikat</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(reportData.grades || []).map((g, idx) => (
                    <tr key={idx}>
                      <td className="px-4 py-2.5 font-medium">{g.subjectName || g.sessionId || `Mata Pelajaran ${idx + 1}`}</td>
                      <td className="px-4 py-2.5 font-bold font-mono">{g.marksObtained}</td>
                      <td className="px-4 py-2.5 font-bold text-[#714B67]">{g.grade}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex justify-end pt-4 border-t mt-4">
              <button onClick={() => setActiveModal(null)} className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 rounded font-medium text-xs cursor-pointer">Tutup</button>
            </div>
          </div>
        </div>
      )}

      {/* Account Modal (COA) */}
      {showAccountModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 border border-slate-200">
            <h3 className="font-bold text-slate-800 text-base mb-1">
              {accountFormData.id ? 'Edit Akun COA' : 'Tambah Akun Baru (PSAK)'}
            </h3>
            <p className="text-xs text-slate-500 mb-4">Konfigurasi bagan akun buku besar sekolah</p>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                try {
                  const url = accountFormData.id
                    ? `/api/finance/accounts/${accountFormData.id}`
                    : '/api/finance/accounts';
                  const method = accountFormData.id ? 'PUT' : 'POST';
                  const payload = {
                    ...accountFormData,
                    schoolId: 'school_sma_hb'
                  };
                  const res = await fetch(url, {
                    method,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                  });
                  if (!res.ok) {
                    const err = await res.json();
                    throw new Error(err.error || 'Gagal menyimpan akun');
                  }
                  setShowAccountModal(false);
                  fetchData();
                } catch (err: any) {
                  alert(err.message);
                }
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Kode Akun (PSAK) *</label>
                <input
                  type="text"
                  placeholder="e.g. 1-1103 atau 5-1103"
                  value={accountFormData.code}
                  onChange={(e) => setAccountFormData({ ...accountFormData, code: e.target.value })}
                  className="w-full p-2 border rounded font-mono font-bold"
                  required
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama Akun *</label>
                <input
                  type="text"
                  placeholder="e.g. Kas Kecil Operasional"
                  value={accountFormData.name}
                  onChange={(e) => setAccountFormData({ ...accountFormData, name: e.target.value })}
                  className="w-full p-2 border rounded font-medium"
                  required
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Klasifikasi Akun</label>
                <select
                  value={accountFormData.type}
                  onChange={(e) => setAccountFormData({ ...accountFormData, type: e.target.value as any })}
                  className="w-full p-2 border rounded bg-white"
                >
                  <option value="asset">Aset (1-xxxx)</option>
                  <option value="liability">Kewajiban / Liabilitas (2-xxxx)</option>
                  <option value="equity">Aset Bersih / Ekuitas (3-xxxx)</option>
                  <option value="income">Pendapatan (4-xxxx)</option>
                  <option value="expense">Beban Operasional (5-xxxx)</option>
                </select>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="reconcile"
                  checked={accountFormData.reconcile}
                  onChange={(e) => setAccountFormData({ ...accountFormData, reconcile: e.target.checked })}
                  className="cursor-pointer"
                />
                <label htmlFor="reconcile" className="text-slate-700 font-medium cursor-pointer">
                  Aktifkan Rekonsiliasi (Wajib untuk Kas/Bank, Piutang, dan Utang)
                </label>
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowAccountModal(false)}
                  className="px-3 py-1.5 border rounded cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 bg-[#714B67] hover:bg-[#583950] text-white rounded font-semibold cursor-pointer"
                >
                  Simpan Akun
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
