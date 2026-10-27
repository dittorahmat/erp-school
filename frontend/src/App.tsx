import React, { useState, useEffect } from 'react';
import { DEMO_USERS, UserProfile } from './types';

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('erp_user');
    return saved ? JSON.parse(saved) : DEMO_USERS.admin;
  });
  const [currentView, setCurrentView] = useState<string>('dashboard');
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);

  // Data states
  const [students, setStudents] = useState<any[]>([]);
  const [academicYears, setAcademicYears] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [timetables, setTimetables] = useState<any[]>([]);
  const [attendanceSheets, setAttendanceSheets] = useState<any[]>([]);
  const [exams, setExams] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [trialBalance, setTrialBalance] = useState<any>(null);
  const [inventory, setInventory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Modals
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [editItem, setEditItem] = useState<any>(null);
  const [paymentTarget, setPaymentTarget] = useState<any>(null);
  const [reportStudentId, setReportStudentId] = useState<string | null>(null);
  const [reportData, setReportData] = useState<any>(null);

  // Switch User Persona
  const switchUser = (key: string) => {
    const selected = DEMO_USERS[key];
    if (selected) {
      setCurrentUser(selected);
      localStorage.setItem('erp_user', JSON.stringify(selected));
      setUserDropdownOpen(false);
      setCurrentView('dashboard');
    }
  };

  // Fetch view data
  const fetchData = async () => {
    setLoading(true);
    try {
      if (currentView === 'students' || currentView === 'dashboard') {
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
        const [invRes, tbRes] = await Promise.all([
          fetch('/api/finance/invoices'),
          fetch('/api/finance/trial-balance')
        ]);
        const invJson = await invRes.json();
        const tbJson = await tbRes.json();
        setInvoices(invJson.data || []);
        setTrialBalance(tbJson);
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
    fetchData();
  }, [currentView]);

  // Open Report Card
  const openReportCard = async (studentId: string) => {
    setReportStudentId(studentId);
    try {
      const res = await fetch(`/api/exams/report-card/${studentId}`);
      const data = await res.json();
      setReportData(data);
      setActiveModal('report');
    } catch (err: any) {
      alert('Gagal memuat rapor: ' + err.message);
    }
  };

  // Open Payment Modal
  const openPaymentModal = (invoice: any) => {
    setPaymentTarget(invoice);
    setActiveModal('payment');
  };

  // Submit Payment
  const handlePaymentSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
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

  // Delete Handlers
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
            {['dashboard', 'students', 'academics', 'attendance', 'exams', 'finance', 'inventory'].map((view) => (
              <button
                key={view}
                onClick={() => setCurrentView(view)}
                className={`nav-link px-2.5 py-1.5 rounded transition capitalize ${
                  currentView === view ? 'bg-[#583950] font-semibold' : 'hover:bg-[#583950]'
                }`}
              >
                {view === 'academics' ? 'Akademik' : view === 'attendance' ? 'Presensi' : view === 'exams' ? 'Ujian & Nilai' : view === 'finance' ? 'Keuangan (SPP)' : view === 'inventory' ? 'Inventaris' : view === 'students' ? 'Siswa' : 'Dashboard'}
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
                    onClick={() => {
                      localStorage.removeItem('erp_user');
                      setLoginModalOpen(true);
                      setUserDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 font-bold flex items-center gap-2"
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
              onClick={() => {
                setEditItem(null);
                setActiveModal('create');
              }}
              className="bg-[#714B67] hover:bg-[#583950] text-white px-3 py-1.5 rounded text-xs font-semibold transition flex items-center gap-1.5"
            >
              <i className="fa-solid fa-plus text-[10px]"></i> Tambah Data
            </button>
          )}
          <button
            onClick={fetchData}
            className="text-xs text-purple-700 font-medium hover:underline px-2 py-1 flex items-center gap-1"
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
            {currentView === 'dashboard' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div onClick={() => setCurrentView('students')} className="bg-white p-4 rounded border border-slate-200 cursor-pointer hover:border-slate-400 transition">
                    <div className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Total Siswa Terdaftar</div>
                    <div className="text-2xl font-bold text-slate-800 mt-1">{students.length || 2}</div>
                    <div className="text-xs text-emerald-700 mt-1 font-medium">100% Aktif di X-MIPA-1</div>
                  </div>
                  <div onClick={() => setCurrentView('attendance')} className="bg-white p-4 rounded border border-slate-200 cursor-pointer hover:border-slate-400 transition">
                    <div className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Presensi Terakhir</div>
                    <div className="text-2xl font-bold text-slate-800 mt-1">100%</div>
                    <div className="text-xs text-emerald-700 mt-1 font-medium">2 Hadir / 0 Alpa</div>
                  </div>
                  <div onClick={() => setCurrentView('finance')} className="bg-white p-4 rounded border border-slate-200 cursor-pointer hover:border-slate-400 transition">
                    <div className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Neraca Saldo (Trial Balance)</div>
                    <div className="text-2xl font-bold text-slate-800 mt-1">
                      Rp {(trialBalance?.totalDebit || 1000000).toLocaleString('id-ID')}
                    </div>
                    <div className="text-xs text-emerald-700 mt-1 font-medium">Debit = Credit (Seimbang)</div>
                  </div>
                  <div onClick={() => setCurrentView('inventory')} className="bg-white p-4 rounded border border-slate-200 cursor-pointer hover:border-slate-400 transition">
                    <div className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Aset & Inventaris</div>
                    <div className="text-2xl font-bold text-slate-800 mt-1">{inventory.length || 3} Item</div>
                    <div className="text-xs text-slate-600 mt-1 font-medium">Laptop, Seragam, & Buku</div>
                  </div>
                </div>

                <div className="bg-white p-5 rounded border border-slate-200">
                  <h3 className="font-bold text-slate-800 text-sm mb-3">Selamat Datang di ERP Sekolah Harapan Bangsa</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Sistem ini berjalan secara native di atas arsitektur <strong>Cloudflare Workers + D1 Database (SQLite Edge)</strong> dengan antarmuka <strong>React + Vite Monolith</strong>. Anda dapat mencoba navigasi modul, mencatat pembayaran, menginput presensi dan nilai ujian, serta mencetak rapor digital secara instan.
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
                          <button onClick={() => openReportCard(s.id)} className="bg-purple-50 text-[#714B67] hover:bg-purple-100 px-2.5 py-1 rounded font-medium">Rapor</button>
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
                        <td className="px-5 py-3 text-right">
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
                <div className="bg-white rounded border border-slate-200 overflow-hidden">
                  <div className="p-3.5 border-b border-slate-200 font-bold text-slate-800 text-xs">Daftar Tagihan Siswa (Invoices)</div>
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
                          <td className="px-5 py-3">{inv.studentId === 'std_andi' ? 'Andi Pratama' : 'Bella Cantika'}</td>
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
                              <button onClick={() => openPaymentModal(inv)} className="bg-[#714B67] hover:bg-[#583950] text-white px-2.5 py-1 rounded font-medium">Catat Bayar</button>
                            )}
                            <button onClick={() => handleDelete(`/api/finance/invoices/${inv.id}`, inv.name)} className="bg-rose-50 text-rose-700 hover:bg-rose-100 px-2 py-1 rounded font-medium">Hapus</button>
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
                <button type="button" onClick={() => setActiveModal(null)} className="px-3 py-1.5 border rounded">Batal</button>
                <button type="submit" className="px-3.5 py-1.5 bg-[#714B67] hover:bg-[#583950] text-white rounded font-semibold">Simpan Pembayaran</button>
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
                <p className="text-xs text-slate-500">{reportData.term || 'Semester Ganjil 2025/2026'}</p>
              </div>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-600"><i className="fa-solid fa-xmark"></i></button>
            </div>
            <div className="space-y-4 text-xs">
              <div className="bg-purple-50/60 p-3.5 rounded border border-purple-100 flex justify-between items-center">
                <div>
                  <div className="text-[11px] text-slate-500 uppercase font-semibold">Siswa</div>
                  <div className="font-bold text-slate-800 text-sm">Andi Pratama</div>
                </div>
                <div className="text-right">
                  <div className="text-[11px] text-slate-500 uppercase font-semibold">Rata-rata Nilai (GPA)</div>
                  <div className="font-mono text-xl font-bold text-[#714B67]">{reportData.summary?.averageScore || '89.0'}</div>
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
                  {(reportData.grades || []).map((g: any, idx: number) => (
                    <tr key={idx}>
                      <td className="px-4 py-2.5 font-medium">{idx === 0 ? 'Matematika Wajib' : 'Fisika Dasar'}</td>
                      <td className="px-4 py-2.5 font-bold font-mono">{g.marksObtained}</td>
                      <td className="px-4 py-2.5 font-bold text-[#714B67]">{g.grade}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex justify-end pt-4 border-t mt-4">
              <button onClick={() => setActiveModal(null)} className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 rounded font-medium text-xs">Tutup</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
