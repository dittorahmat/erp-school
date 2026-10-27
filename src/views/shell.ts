export const odooShellHtml = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ERP Sekolah</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <style>
    :root {
      --odoo-purple: #714B67;
      --odoo-purple-dark: #583950;
      --surface-border: #E2E8F0;
    }
    body {
      overflow-x: hidden;
    }
  </style>
</head>
<body class="bg-[#F8FAFC] font-sans text-slate-800 antialiased min-h-screen flex flex-col w-full max-w-full">
  <!-- Top Odoo Navbar -->
  <header class="bg-[#714B67] text-white h-12 flex items-center justify-between px-4 shadow-sm z-40 select-none w-full">
    <div class="flex items-center space-x-3 overflow-hidden">
      <button onclick="navigate('dashboard')" class="hover:bg-[#583950] p-2 rounded transition flex items-center justify-center shrink-0">
        <i class="fa-solid fa-grip text-base"></i>
      </button>
      <span class="font-bold tracking-tight text-base flex items-center gap-2 cursor-pointer shrink-0" onclick="navigate('dashboard')">
        <i class="fa-solid fa-graduation-cap"></i> ERP Sekolah
      </span>
      <nav class="hidden md:flex space-x-1 text-xs pl-3 overflow-x-auto">
        <button onclick="navigate('dashboard')" class="nav-link px-2.5 py-1.5 rounded hover:bg-[#583950] transition font-semibold" data-view="dashboard">Dashboard</button>
        <button onclick="navigate('students')" class="nav-link px-2.5 py-1.5 rounded hover:bg-[#583950] transition" data-view="students">Siswa</button>
        <button onclick="navigate('academics')" class="nav-link px-2.5 py-1.5 rounded hover:bg-[#583950] transition" data-view="academics">Akademik</button>
        <button onclick="navigate('attendance')" class="nav-link px-2.5 py-1.5 rounded hover:bg-[#583950] transition" data-view="attendance">Presensi</button>
        <button onclick="navigate('exams')" class="nav-link px-2.5 py-1.5 rounded hover:bg-[#583950] transition" data-view="exams">Ujian & Nilai</button>
        <button onclick="navigate('finance')" class="nav-link px-2.5 py-1.5 rounded hover:bg-[#583950] transition" data-view="finance">Keuangan (SPP)</button>
        <button onclick="navigate('inventory')" class="nav-link px-2.5 py-1.5 rounded hover:bg-[#583950] transition" data-view="inventory">Inventaris</button>
      </nav>
    </div>
    
    <div class="flex items-center space-x-2 text-xs shrink-0">
      <span class="bg-[#583950] px-2 py-0.5 rounded text-[11px] font-medium hidden lg:inline-flex items-center gap-1.5">
        <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> SMA Harapan Bangsa
      </span>
      
      <!-- User Profile & Account Switcher Dropdown -->
      <div class="relative">
        <button onclick="toggleUserDropdown()" class="flex items-center space-x-2 border-l border-purple-400/30 pl-2.5 py-1 hover:bg-[#583950] rounded transition pr-1">
          <img id="nav-avatar" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100" class="w-6 h-6 rounded-full border border-white/40 object-cover" alt="Avatar">
          <div class="text-left hidden sm:block max-w-[120px] truncate">
            <span class="font-medium text-xs block leading-tight truncate" id="nav-user-name">Bambang S.</span>
            <span class="text-[10px] text-purple-200 block uppercase" id="nav-user-role">Superadmin</span>
          </div>
          <i class="fa-solid fa-chevron-down text-[9px] text-purple-200"></i>
        </button>

        <!-- Dropdown Menu -->
        <div id="user-dropdown" class="hidden absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-slate-200 py-2 z-50 text-slate-700">
          <div class="px-4 py-2 border-b border-slate-100">
            <p class="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Akun Aktif</p>
            <p class="font-bold text-sm text-slate-800" id="drop-user-name">Bambang Sudarmono, M.Pd</p>
            <p class="text-xs text-slate-500" id="drop-user-email">admin@sekolah.demo</p>
          </div>
          <div class="py-1">
            <p class="px-4 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Ganti Persona (Demo)</p>
            <button onclick="switchUser('admin')" class="w-full text-left px-4 py-1.5 text-xs hover:bg-slate-50 flex items-center justify-between">
              <span class="font-medium text-slate-700">Superadmin (Kepala Sekolah)</span>
            </button>
            <button onclick="switchUser('finance')" class="w-full text-left px-4 py-1.5 text-xs hover:bg-slate-50 flex items-center justify-between">
              <span class="font-medium text-slate-700">Keuangan (Bendahara TU)</span>
            </button>
            <button onclick="switchUser('teacher')" class="w-full text-left px-4 py-1.5 text-xs hover:bg-slate-50 flex items-center justify-between">
              <span class="font-medium text-slate-700">Guru (Budi Santoso, S.Pd)</span>
            </button>
            <button onclick="switchUser('student')" class="w-full text-left px-4 py-1.5 text-xs hover:bg-slate-50 flex items-center justify-between">
              <span class="font-medium text-slate-700">Siswa (Andi Pratama)</span>
            </button>
            <button onclick="switchUser('guardian')" class="w-full text-left px-4 py-1.5 text-xs hover:bg-slate-50 flex items-center justify-between">
              <span class="font-medium text-slate-700">Wali Murid (Joko Pratama)</span>
            </button>
          </div>
          <div class="border-t border-slate-100 pt-1 mt-1">
            <button onclick="logout()" class="w-full text-left px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 font-bold flex items-center gap-2">
              <i class="fa-solid fa-arrow-right-from-bracket"></i> Logout dari Sistem
            </button>
          </div>
        </div>
      </div>
    </div>
  </header>

  <!-- Odoo Control Panel -->
  <section class="bg-white border-b border-slate-200 px-6 py-2.5 flex flex-col md:flex-row md:items-center justify-between gap-3 w-full">
    <div class="flex items-center space-x-3">
      <button onclick="openCreateModal()" class="bg-[#714B67] hover:bg-[#583950] text-white px-3 py-1.5 rounded text-xs font-semibold transition flex items-center gap-1.5">
        <i class="fa-solid fa-plus text-[10px]"></i> <span id="btn-create-label">Buat Baru</span>
      </button>
      <h1 class="text-base font-bold text-slate-800" id="current-view-title">Dashboard Operasional</h1>
    </div>

    <!-- Search & Filter Bar -->
    <div class="flex items-center space-x-2 flex-1 max-w-md justify-end">
      <div class="relative w-full">
        <i class="fa-solid fa-magnifying-glass absolute left-3 top-2.5 text-slate-400 text-xs"></i>
        <input id="search-input" oninput="handleSearch()" type="text" placeholder="Cari data..." class="w-full bg-slate-50 focus:bg-white text-xs pl-8 pr-3 py-1.5 rounded border border-slate-300 focus:border-[#714B67] focus:outline-none transition">
      </div>
      <div class="flex items-center bg-slate-50 rounded border border-slate-300 text-slate-600 text-xs">
        <button class="px-2.5 py-1.5 hover:bg-slate-100 rounded-l transition" title="Filter"><i class="fa-solid fa-filter"></i></button>
        <button class="px-2.5 py-1.5 hover:bg-slate-100 transition border-l border-slate-300" title="Group By"><i class="fa-solid fa-layer-group"></i></button>
      </div>
    </div>
  </section>

  <!-- Main Dynamic Workspace -->
  <main class="flex-1 p-6 max-w-7xl mx-auto w-full" id="main-content">
  </main>

  <!-- Login Modal / Overlay (When Logged Out) -->
  <div id="login-modal" class="hidden fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
    <div class="bg-white rounded-xl shadow-2xl max-w-md w-full p-8 border border-slate-200">
      <div class="text-center mb-6">
        <div class="w-12 h-12 bg-purple-50 text-[#714B67] rounded-full flex items-center justify-center text-xl mx-auto mb-2">
          <i class="fa-solid fa-graduation-cap"></i>
        </div>
        <h2 class="text-xl font-bold text-slate-800">ERP Sekolah</h2>
        <p class="text-xs text-slate-600 mt-1">Masuk untuk mengelola operasional sekolah</p>
      </div>

      <div class="space-y-4">
        <div>
          <label class="block text-xs font-semibold text-slate-700 uppercase mb-1">Email</label>
          <input id="login-email" type="email" value="admin@sekolah.demo" class="w-full text-sm px-3.5 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-[#714B67] focus:outline-none">
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-700 uppercase mb-1">Password</label>
          <input id="login-password" type="password" value="DemoPass123!" class="w-full text-sm px-3.5 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-[#714B67] focus:outline-none">
        </div>
        <button onclick="submitLogin()" class="w-full bg-[#714B67] hover:bg-[#583950] text-white font-semibold py-2 rounded-lg transition text-sm">
          Masuk ke Akun
        </button>
      </div>

      <div class="mt-6 pt-5 border-t border-slate-100 text-center">
        <p class="text-xs text-slate-500 font-medium mb-2.5">Atau masuk cepat dengan akun demo:</p>
        <div class="grid grid-cols-2 gap-2 text-xs">
          <button onclick="quickLogin('admin@sekolah.demo')" class="p-2 border border-slate-200 rounded hover:bg-slate-50 font-medium text-slate-700">Superadmin</button>
          <button onclick="quickLogin('finance@sekolah.demo')" class="p-2 border border-slate-200 rounded hover:bg-slate-50 font-medium text-slate-700">Keuangan</button>
          <button onclick="quickLogin('guru.budi@sekolah.demo')" class="p-2 border border-slate-200 rounded hover:bg-slate-50 font-medium text-slate-700">Guru Budi</button>
          <button onclick="quickLogin('student.andi@sekolah.demo')" class="p-2 border border-slate-200 rounded hover:bg-slate-50 font-medium text-slate-700">Siswa Andi</button>
        </div>
      </div>
    </div>
  </div>

  <!-- Create / Edit Record Modal -->
  <div id="create-modal" class="hidden fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
    <div class="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 border border-slate-200 max-h-[90vh] overflow-y-auto">
      <div class="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
        <h3 class="font-bold text-slate-800 text-base" id="modal-title">Tambah Data</h3>
        <button onclick="closeCreateModal()" class="text-slate-400 hover:text-slate-600"><i class="fa-solid fa-xmark text-base"></i></button>
      </div>
      <input type="hidden" id="edit-record-id" value="">
      <div id="modal-form-content" class="space-y-4 text-xs">
      </div>
      <div class="flex items-center justify-end space-x-2 mt-6 pt-4 border-t border-slate-100">
        <button onclick="closeCreateModal()" class="px-3 py-1.5 border rounded text-xs font-medium text-slate-600 hover:bg-slate-50">Batal</button>
        <button onclick="saveModalRecord()" class="px-3.5 py-1.5 bg-[#714B67] hover:bg-[#583950] text-white rounded text-xs font-semibold">Simpan Data</button>
      </div>
    </div>
  </div>

  <!-- Dedicated Payment Modal -->
  <div id="payment-modal" class="hidden fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
    <div class="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 border border-slate-200">
      <div class="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
        <h3 class="font-bold text-slate-800 text-base">Catat Pembayaran Tagihan</h3>
        <button onclick="closePaymentModal()" class="text-slate-400 hover:text-slate-600"><i class="fa-solid fa-xmark text-base"></i></button>
      </div>
      <input type="hidden" id="pay-move-id" value="">
      <input type="hidden" id="pay-student-id" value="">
      <div class="space-y-3 text-xs">
        <div>
          <label class="block font-semibold text-slate-700 mb-1">Nomor Tagihan / Invoice</label>
          <input id="pay-invoice-number" type="text" readonly class="w-full text-xs p-2 bg-slate-100 border border-slate-200 rounded font-mono text-slate-700">
        </div>
        <div>
          <label class="block font-semibold text-slate-700 mb-1">Jumlah Pembayaran (Rp) *</label>
          <input id="pay-amount" type="number" class="w-full text-xs p-2 border border-slate-300 rounded focus:border-[#714B67] focus:outline-none font-bold">
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block font-semibold text-slate-700 mb-1">Metode Pembayaran</label>
            <select id="pay-method" class="w-full text-xs p-2 border border-slate-300 rounded bg-white">
              <option value="bank_transfer">Transfer Bank (BCA)</option>
              <option value="cash">Kas Tunai (Kasir)</option>
            </select>
          </div>
          <div>
            <label class="block font-semibold text-slate-700 mb-1">Tanggal Bayar</label>
            <input id="pay-date" type="date" class="w-full text-xs p-2 border border-slate-300 rounded">
          </div>
        </div>
        <div>
          <label class="block font-semibold text-slate-700 mb-1">Nomor Referensi / Bukti Transfer</label>
          <input id="pay-reference" type="text" placeholder="e.g. TRF-BCA-20261027" class="w-full text-xs p-2 border border-slate-300 rounded focus:border-[#714B67] focus:outline-none">
        </div>
      </div>
      <div class="flex items-center justify-end space-x-2 mt-6 pt-4 border-t border-slate-100">
        <button onclick="closePaymentModal()" class="px-3 py-1.5 border rounded text-xs font-medium text-slate-600 hover:bg-slate-50">Batal</button>
        <button onclick="submitPayment()" class="px-3.5 py-1.5 bg-[#714B67] hover:bg-[#583950] text-white rounded text-xs font-semibold">Simpan Pembayaran</button>
      </div>
    </div>
  </div>

  <!-- Dedicated Report Card Modal -->
  <div id="report-modal" class="hidden fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
    <div class="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6 border border-slate-200 max-h-[90vh] overflow-y-auto">
      <div class="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
        <div>
          <h3 class="font-bold text-slate-800 text-base">Rapor Digital Akademik</h3>
          <p class="text-xs text-slate-500 mt-0.5" id="report-modal-subtitle">Semester Ganjil 2025/2026</p>
        </div>
        <button onclick="closeReportModal()" class="text-slate-400 hover:text-slate-600"><i class="fa-solid fa-xmark text-base"></i></button>
      </div>
      <div id="report-modal-body" class="space-y-4 text-xs">
      </div>
      <div class="flex items-center justify-end space-x-2 mt-6 pt-4 border-t border-slate-100">
        <button onclick="closeReportModal()" class="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-medium">Tutup</button>
      </div>
    </div>
  </div>

  <!-- App Client-Side Controller -->
  <script>
    var state = {
      currentUser: (function() {
        var saved = localStorage.getItem('erp_user');
        if (!saved) return null;
        try {
          return JSON.parse(saved);
        } catch (e) {
          return null;
        }
      })(),
      currentView: 'dashboard',
      cache: {
        students: [],
        academicYears: [],
        subjects: [],
        exams: [],
        invoices: [],
        inventory: []
      }
    };

    var demoUsers = {
      admin: { name: 'Bambang Sudarmono, M.Pd', role: 'superadmin', email: 'admin@sekolah.demo', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100' },
      finance: { name: 'Siti Rahmawati, S.E', role: 'accountant', email: 'finance@sekolah.demo', avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100' },
      teacher: { name: 'Budi Santoso, S.Pd', role: 'teacher', email: 'guru.budi@sekolah.demo', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100' },
      student: { name: 'Andi Pratama', role: 'student', email: 'student.andi@sekolah.demo', avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100' },
      guardian: { name: 'Joko Pratama', role: 'guardian', email: 'ortu.andi@sekolah.demo', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100' }
    };

    function init() {
      updateUserUI();
      if (!state.currentUser) {
        showLoginModal();
      } else {
        navigate('dashboard');
      }
    }

    function updateUserUI() {
      if (!state.currentUser) return;
      document.getElementById('nav-user-name').innerText = state.currentUser.name;
      document.getElementById('nav-user-role').innerText = state.currentUser.role;
      document.getElementById('nav-avatar').src = state.currentUser.avatar;
      document.getElementById('drop-user-name').innerText = state.currentUser.name;
      document.getElementById('drop-user-email').innerText = state.currentUser.email;
    }

    function toggleUserDropdown() {
      document.getElementById('user-dropdown').classList.toggle('hidden');
    }

    function switchUser(roleKey) {
      var user = demoUsers[roleKey];
      if (user) {
        state.currentUser = user;
        localStorage.setItem('erp_user', JSON.stringify(user));
        updateUserUI();
        toggleUserDropdown();
        navigate(state.currentView);
      }
    }

    function logout() {
      state.currentUser = null;
      localStorage.removeItem('erp_user');
      toggleUserDropdown();
      showLoginModal();
    }

    function showLoginModal() {
      document.getElementById('login-modal').classList.remove('hidden');
    }

    function quickLogin(email) {
      var found = Object.values(demoUsers).find(function(u) { return u.email === email; });
      if (found) {
        state.currentUser = found;
        localStorage.setItem('erp_user', JSON.stringify(found));
        document.getElementById('login-modal').classList.add('hidden');
        updateUserUI();
        navigate('dashboard');
      }
    }

    function submitLogin() {
      var email = document.getElementById('login-email').value;
      quickLogin(email);
    }

    async function navigate(viewName) {
      state.currentView = viewName;
      
      document.querySelectorAll('.nav-link').forEach(function(el) {
        if (el.getAttribute('data-view') === viewName) {
          el.classList.add('bg-[#583950]', 'font-bold');
        } else {
          el.classList.remove('bg-[#583950]', 'font-bold');
        }
      });

      var titles = {
        dashboard: 'Dashboard Operasional',
        students: 'Data Siswa & Profil',
        academics: 'Tahun Ajaran & Kurikulum',
        attendance: 'Jadwal & Presensi Kelas',
        exams: 'Ujian, Nilai & Rapor',
        finance: 'Keuangan, Tagihan SPP & Neraca',
        inventory: 'Gudang & Inventaris Sekolah'
      };
      document.getElementById('current-view-title').innerText = titles[viewName] || 'ERP Sekolah';

      var container = document.getElementById('main-content');
      container.innerHTML = '<div class="text-center py-16 text-slate-400"><i class="fa-solid fa-circle-notch fa-spin text-2xl"></i><p class="mt-2 text-xs">Memuat data dari Cloudflare D1...</p></div>';

      if (viewName === 'dashboard') renderDashboard();
      else if (viewName === 'students') renderStudents();
      else if (viewName === 'academics') renderAcademics();
      else if (viewName === 'attendance') renderAttendance();
      else if (viewName === 'exams') renderExams();
      else if (viewName === 'finance') renderFinance();
      else if (viewName === 'inventory') renderInventory();
    }

    async function renderDashboard() {
      var html = '<div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">' +
        '<div onclick="navigate(&apos;students&apos;)" class="bg-white p-4 rounded border border-slate-200 cursor-pointer hover:border-slate-400 transition">' +
          '<div class="text-xs font-semibold text-slate-600 uppercase tracking-wide">Total Siswa Aktif</div>' +
          '<div class="text-2xl font-bold text-slate-800 mt-1">50</div>' +
          '<div class="text-xs text-emerald-700 mt-1 font-medium">100% Terdaftar</div>' +
        '</div>' +
        '<div onclick="navigate(&apos;attendance&apos;)" class="bg-white p-4 rounded border border-slate-200 cursor-pointer hover:border-slate-400 transition">' +
          '<div class="text-xs font-semibold text-slate-600 uppercase tracking-wide">Kehadiran Hari Ini</div>' +
          '<div class="text-2xl font-bold text-slate-800 mt-1">96.8%</div>' +
          '<div class="text-xs text-emerald-700 mt-1 font-medium">48 Hadir / 2 Izin</div>' +
        '</div>' +
        '<div onclick="navigate(&apos;finance&apos;)" class="bg-white p-4 rounded border border-slate-200 cursor-pointer hover:border-slate-400 transition">' +
          '<div class="text-xs font-semibold text-slate-600 uppercase tracking-wide">Invoice SPP Terbayar</div>' +
          '<div class="text-2xl font-bold text-slate-800 mt-1">Rp 22.500.000</div>' +
          '<div class="text-xs text-slate-600 mt-1">45 dari 50 Siswa</div>' +
        '</div>' +
        '<div onclick="navigate(&apos;inventory&apos;)" class="bg-white p-4 rounded border border-slate-200 cursor-pointer hover:border-slate-400 transition">' +
          '<div class="text-xs font-semibold text-slate-600 uppercase tracking-wide">Stok Barang Gudang</div>' +
          '<div class="text-2xl font-bold text-slate-800 mt-1">142 Item</div>' +
          '<div class="text-xs text-slate-600 mt-1">Seragam & Buku</div>' +
        '</div>' +
      '</div>' +
      '<div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">' +
        '<div class="lg:col-span-2 bg-white rounded border border-slate-200 p-5">' +
          '<h2 class="font-bold text-sm text-slate-800 mb-3 border-b pb-2">Aktivitas Terkini Sekolah</h2>' +
          '<div class="space-y-3 text-xs text-slate-600">' +
            '<div class="flex justify-between items-center py-1 border-b border-slate-100"><span>Pembayaran SPP Siswa Andi Pratama</span><span class="font-mono text-emerald-700 font-medium">Rp 500.000 Lunas</span></div>' +
            '<div class="flex justify-between items-center py-1 border-b border-slate-100"><span>Presensi Kelas X-MIPA-1 Sesi Matematika Wajib</span><span class="text-slate-500">Selesai 09:00</span></div>' +
            '<div class="flex justify-between items-center py-1 border-b border-slate-100"><span>Penerimaan Stok Buku Matematika Kelas 10</span><span class="text-slate-500">80 pcs di Gudang Utama</span></div>' +
            '<div class="flex justify-between items-center py-1"><span>Publikasi Nilai UTS Semester Ganjil 2025/2026</span><span class="text-slate-500">KKM 75</span></div>' +
          '</div>' +
        '</div>' +
        '<div class="bg-white rounded border border-slate-200 p-5">' +
          '<h2 class="font-bold text-sm text-slate-800 mb-3 border-b pb-2">Infrastruktur Cloudflare</h2>' +
          '<div class="space-y-2.5 text-xs text-slate-700">' +
            '<div><span class="text-slate-500 block">Cloudflare D1:</span><code class="text-slate-800">erp-school-db (APAC)</code></div>' +
            '<div><span class="text-slate-500 block">Cloudflare R2:</span><code class="text-slate-800">erp-school-storage</code></div>' +
            '<div><span class="text-slate-500 block">Auth Session:</span><span class="text-emerald-700 font-semibold">Active & Encrypted</span></div>' +
          '</div>' +
        '</div>' +
      '</div>';
      document.getElementById('main-content').innerHTML = html;
    }

    async function renderStudents() {
      try {
        var res = await fetch('/api/students');
        var json = await res.json();
        var data = json.data || [];
        state.cache.students = data;

        var html = '<div class="bg-white rounded border border-slate-200 overflow-hidden">' +
          '<div class="p-3.5 border-b border-slate-200 flex items-center justify-between">' +
            '<span class="font-semibold text-xs text-slate-700">Total: ' + data.length + ' Siswa Terdaftar</span>' +
            '<button onclick="navigate(&apos;students&apos;)" class="text-xs text-purple-700 font-medium hover:underline"><i class="fa-solid fa-rotate-right"></i> Refresh</button>' +
          '</div>' +
          '<table class="w-full text-left text-xs text-slate-700">' +
            '<thead class="bg-slate-50 text-slate-600 uppercase font-semibold border-b border-slate-200">' +
              '<tr>' +
                '<th class="px-5 py-2.5">Foto & Nama</th>' +
                '<th class="px-5 py-2.5">NIS / NISN</th>' +
                '<th class="px-5 py-2.5">Gender</th>' +
                '<th class="px-5 py-2.5">Status</th>' +
                '<th class="px-5 py-2.5 text-right">Aksi</th>' +
              '</tr>' +
            '</thead>' +
            '<tbody class="divide-y divide-slate-100">';

        if (data.length === 0) {
          html += '<tr><td colspan="5" class="text-center py-8 text-slate-400">Belum ada data siswa.</td></tr>';
        } else {
          data.forEach(function(s) {
            html += '<tr class="hover:bg-slate-50 transition">' +
              '<td class="px-5 py-3 flex items-center gap-3">' +
                '<img src="' + (s.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100') + '" class="w-7 h-7 rounded-full object-cover border" alt="Avatar">' +
                '<div><span class="font-bold text-slate-800 block">' + s.name + '</span><span class="text-slate-500 text-[11px]">' + (s.address || 'Jakarta') + '</span></div>' +
              '</td>' +
              '<td class="px-5 py-3 font-mono">' + s.nis + ' / ' + s.nisn + '</td>' +
              '<td class="px-5 py-3 capitalize">' + s.gender + '</td>' +
              '<td class="px-5 py-3"><span class="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-100 text-emerald-800">' + s.status + '</span></td>' +
              '<td class="px-5 py-3 text-right space-x-1.5">' +
                '<button onclick="viewReportCard(\\\'' + s.id + '\\\')" class="bg-purple-50 text-purple-700 hover:bg-purple-100 px-2 py-1 rounded transition font-medium">Rapor</button>' +
                '<button onclick="openEditStudentModal(\\\'' + s.id + '\\\')" class="bg-slate-100 text-slate-700 hover:bg-slate-200 px-2 py-1 rounded transition font-medium">Edit</button>' +
                '<button onclick="deleteStudent(\\\'' + s.id + '\\\', \\\'' + s.name.replace(/'/g, "\\\\\\'") + '\\\')" class="bg-rose-50 text-rose-700 hover:bg-rose-100 px-2 py-1 rounded transition font-medium">Hapus</button>' +
              '</td>' +
            '</tr>';
          });
        }

        html += '</tbody></table></div>';
        document.getElementById('main-content').innerHTML = html;
      } catch (err) {
        document.getElementById('main-content').innerHTML = '<div class="p-6 bg-rose-50 text-rose-700 rounded">Gagal memuat data siswa: ' + err.message + '</div>';
      }
    }

    async function renderAcademics() {
      try {
        var yearsRes = await fetch('/api/academic/years');
        var subjectsRes = await fetch('/api/academic/subjects');
        var yearsJson = await yearsRes.json();
        var subjectsJson = await subjectsRes.json();
        var years = yearsJson.data || [];
        var subjects = subjectsJson.data || [];
        state.cache.academicYears = years;
        state.cache.subjects = subjects;

        var html = '<div class="space-y-6">' +
          '<div class="bg-white rounded border border-slate-200 overflow-hidden">' +
            '<div class="p-3.5 border-b border-slate-200 flex items-center justify-between">' +
              '<span class="font-semibold text-xs text-slate-700">Tahun Ajaran Aktif</span>' +
              '<div class="space-x-2">' +
                '<button onclick="openCreateAcademicYearModal()" class="bg-[#714B67] hover:bg-[#583950] text-white px-2.5 py-1 rounded text-xs font-medium transition"><i class="fa-solid fa-plus text-[10px]"></i> + Tahun Ajaran</button>' +
                '<button onclick="navigate(&apos;academics&apos;)" class="text-xs text-purple-700 font-medium hover:underline"><i class="fa-solid fa-rotate-right"></i> Refresh</button>' +
              '</div>' +
            '</div>' +
            '<table class="w-full text-left text-xs text-slate-700">' +
              '<thead class="bg-slate-50 text-slate-600 uppercase font-semibold border-b border-slate-200">' +
                '<tr>' +
                  '<th class="px-5 py-2.5">Nama Tahun Ajaran</th>' +
                  '<th class="px-5 py-2.5">Kode</th>' +
                  '<th class="px-5 py-2.5">Periode</th>' +
                  '<th class="px-5 py-2.5">Status</th>' +
                  '<th class="px-5 py-2.5 text-right">Aksi</th>' +
                '</tr>' +
              '</thead>' +
              '<tbody class="divide-y divide-slate-100">';

        if (years.length === 0) {
          html += '<tr><td colspan="5" class="text-center py-8 text-slate-400">Belum ada data tahun ajaran.</td></tr>';
        } else {
          years.forEach(function(y) {
            html += '<tr class="hover:bg-slate-50 transition">' +
              '<td class="px-5 py-3 font-bold text-slate-800">' + y.name + '</td>' +
              '<td class="px-5 py-3 font-mono">' + y.code + '</td>' +
              '<td class="px-5 py-3 text-slate-600">' + (y.startDate || '-') + ' s/d ' + (y.endDate || '-') + '</td>' +
              '<td class="px-5 py-3"><span class="px-2 py-0.5 rounded text-[11px] font-semibold ' + (y.status === 'active' ? 'bg-emerald-100 text-emerald-800' : (y.status === 'closed' ? 'bg-slate-100 text-slate-700' : 'bg-amber-100 text-amber-800')) + '">' + y.status + '</span></td>' +
              '<td class="px-5 py-3 text-right space-x-1.5">' +
                '<button onclick="openEditAcademicYearModal(&apos;' + y.id + '&apos;)" class="bg-slate-100 text-slate-700 hover:bg-slate-200 px-2 py-1 rounded transition font-medium">Edit</button>' +
                '<button onclick="deleteAcademicYear(&apos;' + y.id + '&apos;)" class="bg-rose-50 text-rose-700 hover:bg-rose-100 px-2 py-1 rounded transition font-medium">Hapus</button>' +
              '</td>' +
            '</tr>';
          });
        }

        html += '</tbody></table></div>' +
          '<div class="bg-white rounded border border-slate-200 overflow-hidden">' +
            '<div class="p-3.5 border-b border-slate-200 flex items-center justify-between">' +
              '<span class="font-semibold text-xs text-slate-700">Daftar Mata Pelajaran (Kurikulum)</span>' +
              '<button onclick="openCreateSubjectModal()" class="bg-[#714B67] hover:bg-[#583950] text-white px-2.5 py-1 rounded text-xs font-medium transition"><i class="fa-solid fa-plus text-[10px]"></i> + Tambah Mapel</button>' +
            '</div>' +
            '<table class="w-full text-left text-xs text-slate-700">' +
              '<thead class="bg-slate-50 text-slate-600 uppercase font-semibold border-b border-slate-200">' +
                '<tr>' +
                  '<th class="px-5 py-2.5">Nama Mata Pelajaran</th>' +
                  '<th class="px-5 py-2.5">Kode</th>' +
                  '<th class="px-5 py-2.5">Tipe</th>' +
                  '<th class="px-5 py-2.5">Bobot</th>' +
                  '<th class="px-5 py-2.5 text-right">Aksi</th>' +
                '</tr>' +
              '</thead>' +
              '<tbody class="divide-y divide-slate-100">';

        if (subjects.length === 0) {
          html += '<tr><td colspan="5" class="text-center py-8 text-slate-400">Belum ada data mata pelajaran.</td></tr>';
        } else {
          subjects.forEach(function(sub) {
            html += '<tr class="hover:bg-slate-50 transition">' +
              '<td class="px-5 py-3 font-bold text-slate-800">' + sub.name + '</td>' +
              '<td class="px-5 py-3 font-mono">' + sub.code + '</td>' +
              '<td class="px-5 py-3"><span class="px-2 py-0.5 rounded text-[11px] font-semibold ' + (sub.type === 'compulsory' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800') + '">' + (sub.type || 'compulsory') + '</span></td>' +
              '<td class="px-5 py-3 text-slate-600">' + (sub.weightage || 100) + '</td>' +
              '<td class="px-5 py-3 text-right space-x-1.5">' +
                '<button onclick="openEditSubjectModal(&apos;' + sub.id + '&apos;)" class="bg-slate-100 text-slate-700 hover:bg-slate-200 px-2 py-1 rounded transition font-medium">Edit</button>' +
                '<button onclick="deleteSubject(&apos;' + sub.id + '&apos;)" class="bg-rose-50 text-rose-700 hover:bg-rose-100 px-2 py-1 rounded transition font-medium">Hapus</button>' +
              '</td>' +
            '</tr>';
          });
        }

        html += '</tbody></table></div></div>';
        document.getElementById('main-content').innerHTML = html;
      } catch (err) {
        document.getElementById('main-content').innerHTML = '<div class="p-6 bg-rose-50 text-rose-700 rounded">Gagal memuat data akademik: ' + err.message + '</div>';
      }
    }

    async function renderAttendance() {
      try {
        var ttRes = await fetch('/api/attendance/timetables');
        var sheetsRes = await fetch('/api/attendance/sheets');
        var ttJson = await ttRes.json();
        var sheetsJson = await sheetsRes.json();
        var timetables = ttJson.data || [];
        var sheets = sheetsJson.data || [];

        var html = '<div class="space-y-6">' +
          '<div class="bg-white rounded border border-slate-200 overflow-hidden">' +
            '<div class="p-3.5 border-b border-slate-200 flex items-center justify-between">' +
              '<h3 class="font-bold text-slate-800 text-xs">Sesi Presensi Kelas Real-Time</h3>' +
              '<div class="space-x-2">' +
                '<button onclick="openCreateAttendanceModal()" class="bg-[#714B67] hover:bg-[#583950] text-white px-2.5 py-1 rounded text-xs font-medium transition"><i class="fa-solid fa-plus text-[10px]"></i> + Buat Sesi Presensi Baru</button>' +
                '<button onclick="navigate(&apos;attendance&apos;)" class="text-xs text-purple-700 font-medium hover:underline"><i class="fa-solid fa-rotate-right"></i> Refresh</button>' +
              '</div>' +
            '</div>' +
            '<table class="w-full text-left text-xs text-slate-700">' +
              '<thead class="bg-slate-50 text-slate-600 uppercase font-semibold border-b border-slate-200">' +
                '<tr>' +
                  '<th class="px-5 py-2.5">Tanggal</th>' +
                  '<th class="px-5 py-2.5">Kelas / Rombel</th>' +
                  '<th class="px-5 py-2.5">Pengajar / Guru</th>' +
                  '<th class="px-5 py-2.5">Kehadiran (H / S / I / A)</th>' +
                  '<th class="px-5 py-2.5">Status</th>' +
                '</tr>' +
              '</thead>' +
              '<tbody class="divide-y divide-slate-100">';

        if (sheets.length === 0) {
          html += '<tr><td colspan="5" class="text-center py-6 text-slate-400">Belum ada sesi presensi tersimpan.</td></tr>';
        } else {
          sheets.forEach(function(sh) {
            html += '<tr class="hover:bg-slate-50 transition">' +
              '<td class="px-5 py-3 font-mono font-bold text-slate-800">' + sh.date + '</td>' +
              '<td class="px-5 py-3 font-medium text-slate-800">' + (sh.classroomId || 'X-MIPA-1') + '</td>' +
              '<td class="px-5 py-3 text-slate-600">' + (sh.facultyId || 'Budi Santoso, S.Pd') + '</td>' +
              '<td class="px-5 py-3"><span class="font-bold text-emerald-700">' + (sh.totalPresent || 0) + ' Hadir</span>, ' + (sh.totalSick || 0) + ' Sakit, ' + (sh.totalExcused || 0) + ' Izin, ' + (sh.totalAbsent || 0) + ' Alpa</td>' +
              '<td class="px-5 py-3"><span class="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-100 text-emerald-800">' + sh.status + '</span></td>' +
            '</tr>';
          });
        }

        html += '</tbody></table></div>' +
          '<div class="bg-white rounded border border-slate-200 overflow-hidden">' +
            '<div class="p-3.5 border-b border-slate-200"><h3 class="font-bold text-slate-800 text-xs">Jadwal Pelajaran Mingguan</h3></div>' +
            '<div class="p-5">' +
              '<div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">' +
                '<div class="p-3.5 bg-slate-50 rounded border border-slate-200"><span class="font-semibold text-purple-800 uppercase block mb-1">Senin (07:30 - 09:00)</span><p class="font-bold text-slate-800">Matematika Wajib</p><p class="text-slate-500 mt-0.5">Kelas: X-MIPA-1 | Guru: Budi Santoso, S.Pd</p></div>' +
                '<div class="p-3.5 bg-slate-50 rounded border border-slate-200"><span class="font-semibold text-purple-800 uppercase block mb-1">Selasa (09:15 - 10:45)</span><p class="font-bold text-slate-800">Fisika Dasar</p><p class="text-slate-500 mt-0.5">Kelas: X-MIPA-1 | Guru: Dewi Lestari, M.Si</p></div>' +
                '<div class="p-3.5 bg-slate-50 rounded border border-slate-200"><span class="font-semibold text-purple-800 uppercase block mb-1">Rabu (07:30 - 09:00)</span><p class="font-bold text-slate-800">Kimia Analitik</p><p class="text-slate-500 mt-0.5">Kelas: X-MIPA-2 | Guru: Staf Pengajar</p></div>' +
              '</div>' +
            '</div>' +
          '</div></div>';

        document.getElementById('main-content').innerHTML = html;
      } catch (err) {
        document.getElementById('main-content').innerHTML = '<div class="p-6 bg-rose-50 text-rose-700 rounded">Error: ' + err.message + '</div>';
      }
    }

    async function renderExams() {
      try {
        var res = await fetch('/api/exams/sessions');
        var json = await res.json();
        var data = json.data || [];
        state.cache.exams = data;

        var html = '<div class="bg-white rounded border border-slate-200 overflow-hidden">' +
          '<div class="p-3.5 border-b border-slate-200 flex items-center justify-between">' +
            '<h3 class="font-bold text-slate-800 text-xs">Sesi Ujian Semester Ganjil 2025/2026</h3>' +
            '<button onclick="navigate(&apos;exams&apos;)" class="text-xs text-purple-700 font-medium hover:underline"><i class="fa-solid fa-rotate-right"></i> Refresh</button>' +
          '</div>' +
          '<table class="w-full text-left text-xs text-slate-700">' +
            '<thead class="bg-slate-50 text-slate-600 uppercase font-semibold border-b border-slate-200">' +
              '<tr>' +
                '<th class="px-5 py-2.5">Nama Ujian</th>' +
                '<th class="px-5 py-2.5">Mata Pelajaran</th>' +
                '<th class="px-5 py-2.5">Tanggal Ujian</th>' +
                '<th class="px-5 py-2.5">Passing Marks (KKM)</th>' +
                '<th class="px-5 py-2.5">Bobot</th>' +
                '<th class="px-5 py-2.5">Status</th>' +
                '<th class="px-5 py-2.5 text-right">Aksi</th>' +
              '</tr>' +
            '</thead>' +
            '<tbody class="divide-y divide-slate-100">';

        if (data.length === 0) {
          html += '<tr><td colspan="7" class="text-center py-8 text-slate-400">Belum ada sesi ujian. Klik tombol Buat Data untuk menambahkan.</td></tr>';
        } else {
          data.forEach(function(exam) {
            var isPublished = exam.status === 'published';
            var statusBadge = isPublished
              ? '<span class="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-100 text-emerald-800">Published</span>'
              : (exam.status === 'closed'
                ? '<span class="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700">Closed</span>'
                : '<span class="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-100 text-amber-800">Draft</span>');

            html += '<tr class="hover:bg-slate-50 transition">' +
              '<td class="px-5 py-3 font-bold text-slate-800">' + exam.name + '</td>' +
              '<td class="px-5 py-3 text-slate-600">' + (exam.subjectId || 'Umum') + '</td>' +
              '<td class="px-5 py-3 text-slate-600">' + (exam.examDate || '-') + '</td>' +
              '<td class="px-5 py-3 font-bold">' + (exam.passingMarks || 75) + '</td>' +
              '<td class="px-5 py-3">' + (exam.weightage || 30) + '%</td>' +
              '<td class="px-5 py-3">' + statusBadge + '</td>' +
              '<td class="px-5 py-3 text-right space-x-1.5">' +
                '<button onclick="openEditExamModal(&apos;' + exam.id + '&apos;)" class="bg-slate-100 text-slate-700 hover:bg-slate-200 px-2 py-1 rounded transition font-medium">Edit</button>' +
                '<button onclick="deleteExamSession(&apos;' + exam.id + '&apos;)" class="bg-rose-50 text-rose-700 hover:bg-rose-100 px-2 py-1 rounded transition font-medium">Hapus</button>' +
              '</td>' +
            '</tr>';
          });
        }

        html += '</tbody></table></div>';
        document.getElementById('main-content').innerHTML = html;
      } catch (err) {
        document.getElementById('main-content').innerHTML = '<div class="p-6 bg-rose-50 text-rose-700 rounded">Error: ' + err.message + '</div>';
      }
    }

    async function renderFinance() {
      try {
        var invRes = await fetch('/api/finance/invoices');
        var tbRes = await fetch('/api/finance/trial-balance');
        var invJson = await invRes.json();
        var tbJson = await tbRes.json();
        var invoices = invJson.data || [];
        state.cache.invoices = invoices;

        var html = '<div class="bg-slate-800 text-white p-5 rounded border border-slate-700 mb-6 flex items-center justify-between">' +
          '<div>' +
            '<span class="text-xs uppercase font-bold text-slate-300 tracking-wider">Neraca Saldo (Double-Entry Bookkeeping)</span>' +
            '<p class="text-xl font-bold mt-1">Debit: Rp ' + (tbJson.totalDebit || 0).toLocaleString('id-ID') + ' | Credit: Rp ' + (tbJson.totalCredit || 0).toLocaleString('id-ID') + '</p>' +
            '<p class="text-xs text-emerald-400 mt-1"><i class="fa-solid fa-check"></i> ' + (tbJson.isBalanced ? 'Jurnal Akuntansi Berimbang (Debit = Credit)' : 'Tidak Berimbang') + '</p>' +
          '</div>' +
          '<div class="text-right"><span class="text-xs bg-slate-700 px-3 py-1 rounded font-mono">' + (tbJson.lineCount || 0) + ' Journal Lines</span></div>' +
        '</div>' +
        '<div class="bg-white rounded border border-slate-200 overflow-hidden">' +
          '<div class="p-3.5 border-b border-slate-200 flex items-center justify-between">' +
            '<h3 class="font-bold text-slate-800 text-xs">Daftar Tagihan SPP (Invoices)</h3>' +
            '<button onclick="navigate(&apos;finance&apos;)" class="text-xs text-purple-700 font-medium hover:underline"><i class="fa-solid fa-rotate-right"></i> Refresh</button>' +
          '</div>' +
          '<table class="w-full text-left text-xs text-slate-700">' +
            '<thead class="bg-slate-50 text-slate-600 uppercase font-semibold border-b border-slate-200">' +
              '<tr>' +
                '<th class="px-5 py-2.5">No. Invoice</th>' +
                '<th class="px-5 py-2.5">Tanggal & Jatuh Tempo</th>' +
                '<th class="px-5 py-2.5">Total Biaya</th>' +
                '<th class="px-5 py-2.5">Sisa Tagihan</th>' +
                '<th class="px-5 py-2.5">Status Bayar</th>' +
                '<th class="px-5 py-2.5 text-right">Aksi</th>' +
              '</tr>' +
            '</thead>' +
            '<tbody class="divide-y divide-slate-100">';

        if (invoices.length === 0) {
          html += '<tr><td colspan="6" class="text-center py-8 text-slate-400">Belum ada data tagihan SPP.</td></tr>';
        } else {
          invoices.forEach(function(inv) {
            var isPaid = inv.paymentState === 'paid';
            html += '<tr class="hover:bg-slate-50">' +
              '<td class="px-5 py-3 font-bold font-mono text-slate-800">' + inv.name + '</td>' +
              '<td class="px-5 py-3 text-slate-600">' + inv.date + ' (Due: ' + (inv.invoiceDueDate || '-') + ')</td>' +
              '<td class="px-5 py-3 font-bold">Rp ' + (inv.amountTotal || 0).toLocaleString('id-ID') + '</td>' +
              '<td class="px-5 py-3 text-slate-600">Rp ' + (inv.amountResidual || 0).toLocaleString('id-ID') + '</td>' +
              '<td class="px-5 py-3"><span class="px-2 py-0.5 rounded text-[11px] font-semibold ' + (isPaid ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800') + '">' + (isPaid ? 'Lunas' : 'Belum Lunas') + '</span></td>' +
              '<td class="px-5 py-3 text-right space-x-1.5">' +
                (!isPaid ? '<button onclick="openPaymentModal(&apos;' + inv.id + '&apos;)" class="bg-[#714B67] hover:bg-[#583950] text-white px-2 py-1 rounded transition font-semibold">Catat Bayar</button>' : '') +
                '<button onclick="viewInvoiceDetail(&apos;' + inv.id + '&apos;)" class="bg-slate-100 text-slate-700 hover:bg-slate-200 px-2 py-1 rounded transition font-medium">Detail</button>' +
                (!isPaid ? '<button onclick="deleteInvoice(&apos;' + inv.id + '&apos;)" class="bg-rose-50 text-rose-700 hover:bg-rose-100 px-2 py-1 rounded transition font-medium">Hapus</button>' : '') +
              '</td>' +
            '</tr>';
          });
        }

        html += '</tbody></table></div>';
        document.getElementById('main-content').innerHTML = html;
      } catch (err) {
        document.getElementById('main-content').innerHTML = '<div class="p-6 bg-rose-50 text-rose-700 rounded">Error: ' + err.message + '</div>';
      }
    }

    async function renderInventory() {
      try {
        var res = await fetch('/api/inventory/products');
        var json = await res.json();
        var data = json.data || [];
        state.cache.inventory = data;

        var html = '<div class="bg-white rounded border border-slate-200 overflow-hidden">' +
          '<div class="p-3.5 border-b border-slate-200 flex items-center justify-between">' +
            '<h3 class="font-bold text-slate-800 text-xs">Daftar Barang & Aset Sekolah</h3>' +
            '<button onclick="navigate(&apos;inventory&apos;)" class="text-xs text-purple-700 font-medium hover:underline"><i class="fa-solid fa-rotate-right"></i> Refresh</button>' +
          '</div>' +
          '<table class="w-full text-left text-xs text-slate-700">' +
            '<thead class="bg-slate-50 text-slate-600 uppercase font-semibold border-b border-slate-200">' +
              '<tr>' +
                '<th class="px-5 py-2.5">Nama Produk / Item</th>' +
                '<th class="px-5 py-2.5">Kode</th>' +
                '<th class="px-5 py-2.5">Tipe</th>' +
                '<th class="px-5 py-2.5">Satuan</th>' +
                '<th class="px-5 py-2.5">Harga Standar</th>' +
                '<th class="px-5 py-2.5">Nomor Seri Aset</th>' +
                '<th class="px-5 py-2.5 text-right">Aksi</th>' +
              '</tr>' +
            '</thead>' +
            '<tbody class="divide-y divide-slate-100">';

        if (data.length === 0) {
          html += '<tr><td colspan="7" class="text-center py-8 text-slate-400">Belum ada data barang / aset.</td></tr>';
        } else {
          data.forEach(function(p) {
            html += '<tr class="hover:bg-slate-50 transition">' +
              '<td class="px-5 py-3 font-bold text-slate-800">' + p.name + '</td>' +
              '<td class="px-5 py-3 font-mono">' + p.code + '</td>' +
              '<td class="px-5 py-3 uppercase">' + p.type + '</td>' +
              '<td class="px-5 py-3">' + p.uom + '</td>' +
              '<td class="px-5 py-3">Rp ' + (p.standardPrice || 0).toLocaleString('id-ID') + '</td>' +
              '<td class="px-5 py-3 font-mono text-slate-500">' + (p.serialNumber || '-') + '</td>' +
              '<td class="px-5 py-3 text-right space-x-1.5">' +
                '<button onclick="openEditProductModal(&apos;' + p.id + '&apos;)" class="bg-slate-100 text-slate-700 hover:bg-slate-200 px-2 py-1 rounded transition font-medium">Edit</button>' +
                '<button onclick="deleteProduct(&apos;' + p.id + '&apos;)" class="bg-rose-50 text-rose-700 hover:bg-rose-100 px-2 py-1 rounded transition font-medium">Hapus</button>' +
              '</td>' +
            '</tr>';
          });
        }

        html += '</tbody></table></div>';
        document.getElementById('main-content').innerHTML = html;
      } catch (err) {
        document.getElementById('main-content').innerHTML = '<div class="p-6 bg-rose-50 text-rose-700 rounded">Error: ' + err.message + '</div>';
      }
    }

    function openCreateModal() {
      document.getElementById('edit-record-id').value = '';
      document.getElementById('modal-title').innerText = 'Tambah Data ' + state.currentView;
      var content = document.getElementById('modal-form-content');
      if (state.currentView === 'students') {
        content.innerHTML = renderStudentFormHtml({});
      } else if (state.currentView === 'academics') {
        content.innerHTML = '<div class="space-y-4">' +
          '<div class="flex gap-4 border-b border-slate-200 pb-3">' +
            '<button type="button" onclick="renderAcademicModalTab(&apos;year&apos;)" id="tab-btn-ay" class="text-xs font-bold px-3 py-1.5 rounded bg-purple-50 text-[#714B67] border border-purple-200">+ Tahun Ajaran</button>' +
            '<button type="button" onclick="renderAcademicModalTab(&apos;subject&apos;)" id="tab-btn-subj" class="text-xs font-medium px-3 py-1.5 rounded hover:bg-slate-50 text-slate-600 border border-transparent">+ Mata Pelajaran</button>' +
          '</div>' +
          '<div id="academic-modal-body">' + renderAcademicYearFormHtml({}) + '</div>' +
        '</div>';
      } else if (state.currentView === 'exams') {
        content.innerHTML = renderExamFormHtml({});
      } else if (state.currentView === 'inventory') {
        content.innerHTML = renderProductFormHtml({});
      } else if (state.currentView === 'finance') {
        content.innerHTML = renderInvoiceFormHtml({});
      } else {
        content.innerHTML = '<div><label class="block font-semibold text-slate-700 mb-1">Nama Item / Dokumen</label><input id="form-name" type="text" placeholder="Nama..." class="w-full text-xs p-2 border border-slate-300 rounded focus:border-[#714B67] focus:outline-none"></div>';
      }
      document.getElementById('create-modal').classList.remove('hidden');
    }

    function renderAcademicModalTab(tab) {
      var body = document.getElementById('academic-modal-body');
      var btnAy = document.getElementById('tab-btn-ay');
      var btnSubj = document.getElementById('tab-btn-subj');
      if (tab === 'year') {
        btnAy.className = 'text-xs font-bold px-3 py-1.5 rounded bg-purple-50 text-[#714B67] border border-purple-200';
        btnSubj.className = 'text-xs font-medium px-3 py-1.5 rounded hover:bg-slate-50 text-slate-600 border border-transparent';
        body.innerHTML = renderAcademicYearFormHtml({});
      } else {
        btnSubj.className = 'text-xs font-bold px-3 py-1.5 rounded bg-purple-50 text-[#714B67] border border-purple-200';
        btnAy.className = 'text-xs font-medium px-3 py-1.5 rounded hover:bg-slate-50 text-slate-600 border border-transparent';
        body.innerHTML = renderSubjectFormHtml({});
      }
    }

    function openCreateAcademicYearModal() {
      document.getElementById('edit-record-id').value = '';
      document.getElementById('modal-title').innerText = 'Tambah Tahun Ajaran';
      var content = document.getElementById('modal-form-content');
      content.innerHTML = renderAcademicYearFormHtml({});
      document.getElementById('create-modal').classList.remove('hidden');
    }

    function openCreateSubjectModal() {
      document.getElementById('edit-record-id').value = '';
      document.getElementById('modal-title').innerText = 'Tambah Mata Pelajaran';
      var content = document.getElementById('modal-form-content');
      content.innerHTML = renderSubjectFormHtml({});
      document.getElementById('create-modal').classList.remove('hidden');
    }

    function openEditStudentModal(id) {
      var student = state.cache.students.find(function(x) { return x.id === id; }) || {};
      document.getElementById('edit-record-id').value = student.id || id;
      document.getElementById('modal-title').innerText = 'Edit Data Siswa';
      var content = document.getElementById('modal-form-content');
      content.innerHTML = renderStudentFormHtml(student);
      document.getElementById('create-modal').classList.remove('hidden');
    }

    function openEditAcademicYearModal(id) {
      var year = state.cache.academicYears.find(function(x) { return x.id === id; }) || {};
      document.getElementById('edit-record-id').value = year.id || id;
      document.getElementById('modal-title').innerText = 'Edit Tahun Ajaran';
      var content = document.getElementById('modal-form-content');
      content.innerHTML = renderAcademicYearFormHtml(year);
      document.getElementById('create-modal').classList.remove('hidden');
    }

    function openEditSubjectModal(id) {
      var subject = state.cache.subjects.find(function(x) { return x.id === id; }) || {};
      document.getElementById('edit-record-id').value = subject.id || id;
      document.getElementById('modal-title').innerText = 'Edit Mata Pelajaran';
      var content = document.getElementById('modal-form-content');
      content.innerHTML = renderSubjectFormHtml(subject);
      document.getElementById('create-modal').classList.remove('hidden');
    }

    function openEditExamModal(id) {
      var exam = state.cache.exams.find(function(x) { return x.id === id; }) || {};
      document.getElementById('edit-record-id').value = exam.id || id;
      document.getElementById('modal-title').innerText = 'Edit Sesi Ujian';
      var content = document.getElementById('modal-form-content');
      content.innerHTML = renderExamFormHtml(exam);
      document.getElementById('create-modal').classList.remove('hidden');
    }

    function openEditProductModal(id) {
      var product = state.cache.inventory.find(function(x) { return x.id === id; }) || {};
      document.getElementById('edit-record-id').value = product.id || id;
      document.getElementById('modal-title').innerText = 'Edit Produk / Aset';
      var content = document.getElementById('modal-form-content');
      content.innerHTML = renderProductFormHtml(product);
      document.getElementById('create-modal').classList.remove('hidden');
    }

    function renderExamFormHtml(e) {
      var statusVal = e.status || 'draft';
      var today = new Date().toISOString().split('T')[0];
      return '<div class="space-y-3">' +
        '<div>' +
          '<label class="block font-semibold text-slate-700 mb-1">Nama Ujian *</label>' +
          '<input id="form-name" type="text" value="' + (e.name || '') + '" placeholder="e.g. UTS Matematika Wajib" class="w-full text-xs p-2 border border-slate-300 rounded focus:border-[#714B67] focus:outline-none">' +
        '</div>' +
        '<div class="grid grid-cols-2 gap-3">' +
          '<div>' +
            '<label class="block font-semibold text-slate-700 mb-1">Mata Pelajaran *</label>' +
            '<input id="form-exam-subject" type="text" value="' + (e.subjectId || 'MAT-10') + '" placeholder="e.g. MAT-10" class="w-full text-xs p-2 border border-slate-300 rounded focus:border-[#714B67] focus:outline-none">' +
          '</div>' +
          '<div>' +
            '<label class="block font-semibold text-slate-700 mb-1">Tanggal Ujian *</label>' +
            '<input id="form-exam-date" type="date" value="' + (e.examDate || today) + '" class="w-full text-xs p-2 border border-slate-300 rounded focus:border-[#714B67] focus:outline-none">' +
          '</div>' +
        '</div>' +
        '<div class="grid grid-cols-2 gap-3">' +
          '<div>' +
            '<label class="block font-semibold text-slate-700 mb-1">Passing Marks / KKM *</label>' +
            '<input id="form-exam-passing" type="number" value="' + (e.passingMarks !== undefined ? e.passingMarks : 75) + '" placeholder="75" class="w-full text-xs p-2 border border-slate-300 rounded focus:border-[#714B67] focus:outline-none">' +
          '</div>' +
          '<div>' +
            '<label class="block font-semibold text-slate-700 mb-1">Bobot Penilaian (%) *</label>' +
            '<input id="form-exam-weight" type="number" value="' + (e.weightage !== undefined ? e.weightage : 30) + '" placeholder="30" class="w-full text-xs p-2 border border-slate-300 rounded focus:border-[#714B67] focus:outline-none">' +
          '</div>' +
        '</div>' +
        '<div>' +
          '<label class="block font-semibold text-slate-700 mb-1">Status</label>' +
          '<select id="form-exam-status" class="w-full text-xs p-2 border border-slate-300 rounded focus:border-[#714B67] focus:outline-none bg-white">' +
            '<option value="draft"' + (statusVal === 'draft' ? ' selected' : '') + '>Draft</option>' +
            '<option value="published"' + (statusVal === 'published' ? ' selected' : '') + '>Published</option>' +
            '<option value="closed"' + (statusVal === 'closed' ? ' selected' : '') + '>Closed</option>' +
          '</select>' +
        '</div>' +
      '</div>';
    }

    function renderInvoiceFormHtml(inv) {
      var defaultInvNumber = 'INV/' + new Date().getFullYear() + '/' + Math.floor(Math.random() * 9000 + 1000);
      var today = new Date().toISOString().split('T')[0];
      var nextMonth = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      var studentOptions = '<option value="">-- Pilih Siswa / Partner --</option>';
      (state.cache.students || []).forEach(function(s) {
        var isSelected = (inv.studentId === s.id) || (inv.partnerId === s.id);
        studentOptions += '<option value="' + s.id + '"' + (isSelected ? ' selected' : '') + '>' + s.name + ' (' + s.nis + ')</option>';
      });

      return '<div class="space-y-3">' +
        '<div>' +
          '<label class="block font-semibold text-slate-700 mb-1">Nomor Invoice *</label>' +
          '<input id="form-inv-number" type="text" value="' + (inv.name || defaultInvNumber) + '" placeholder="e.g. INV/2026/10/001" class="w-full text-xs p-2 border border-slate-300 rounded focus:border-[#714B67] focus:outline-none font-mono">' +
        '</div>' +
        '<div class="grid grid-cols-2 gap-3">' +
          '<div>' +
            '<label class="block font-semibold text-slate-700 mb-1">Tanggal Invoice *</label>' +
            '<input id="form-inv-date" type="date" value="' + (inv.date || today) + '" class="w-full text-xs p-2 border border-slate-300 rounded focus:border-[#714B67] focus:outline-none">' +
          '</div>' +
          '<div>' +
            '<label class="block font-semibold text-slate-700 mb-1">Tanggal Jatuh Tempo *</label>' +
            '<input id="form-inv-due-date" type="date" value="' + (inv.invoiceDueDate || nextMonth) + '" class="w-full text-xs p-2 border border-slate-300 rounded focus:border-[#714B67] focus:outline-none">' +
          '</div>' +
        '</div>' +
        '<div>' +
          '<label class="block font-semibold text-slate-700 mb-1">Pilih Siswa / Partner *</label>' +
          '<select id="form-inv-partner-id" class="w-full text-xs p-2 border border-slate-300 rounded focus:border-[#714B67] focus:outline-none bg-white">' +
            studentOptions +
          '</select>' +
        '</div>' +
        '<div>' +
          '<label class="block font-semibold text-slate-700 mb-1">Nama Siswa / Partner (Manual / Opsional)</label>' +
          '<input id="form-name" type="text" value="' + (inv.studentName || '') + '" placeholder="e.g. Andi Pratama / Siswa Kelas X" class="w-full text-xs p-2 border border-slate-300 rounded focus:border-[#714B67] focus:outline-none">' +
        '</div>' +
        '<div>' +
          '<label class="block font-semibold text-slate-700 mb-1">Nominal Biaya / Amount (Rp) *</label>' +
          '<input id="form-inv-amount" type="number" value="' + (inv.amountTotal || 500000) + '" placeholder="500000" class="w-full text-xs p-2 border border-slate-300 rounded focus:border-[#714B67] focus:outline-none">' +
        '</div>' +
        '<div>' +
          '<label class="block font-semibold text-slate-700 mb-1">Keterangan / Deskripsi</label>' +
          '<textarea id="form-inv-desc" rows="2" placeholder="e.g. Iuran SPP Bulan November 2026" class="w-full text-xs p-2 border border-slate-300 rounded focus:border-[#714B67] focus:outline-none">' + (inv.description || 'Iuran SPP Siswa') + '</textarea>' +
        '</div>' +
      '</div>';
    }

    function renderProductFormHtml(p) {
      var typeVal = p.type || 'storable';
      var uomVal = p.uom || 'pcs';
      return '<div class="space-y-3">' +
        '<div>' +
          '<label class="block font-semibold text-slate-700 mb-1">Nama Produk / Barang *</label>' +
          '<input id="form-name" type="text" value="' + (p.name || '') + '" placeholder="e.g. Meja Belajar Siswa" class="w-full text-xs p-2 border border-slate-300 rounded focus:border-[#714B67] focus:outline-none">' +
        '</div>' +
        '<div>' +
          '<label class="block font-semibold text-slate-700 mb-1">Kode Produk *</label>' +
          '<input id="form-prod-code" type="text" value="' + (p.code || '') + '" placeholder="e.g. AST-MJ01" class="w-full text-xs p-2 border border-slate-300 rounded focus:border-[#714B67] focus:outline-none">' +
        '</div>' +
        '<div class="grid grid-cols-2 gap-3">' +
          '<div>' +
            '<label class="block font-semibold text-slate-700 mb-1">Tipe Produk</label>' +
            '<select id="form-prod-type" class="w-full text-xs p-2 border border-slate-300 rounded focus:border-[#714B67] focus:outline-none bg-white">' +
              '<option value="storable"' + (typeVal === 'storable' ? ' selected' : '') + '>Storable (Barang Stok)</option>' +
              '<option value="consumable"' + (typeVal === 'consumable' ? ' selected' : '') + '>Consumable (Barang Habis Pakai)</option>' +
              '<option value="service"' + (typeVal === 'service' ? ' selected' : '') + '>Service (Jasa)</option>' +
            '</select>' +
          '</div>' +
          '<div>' +
            '<label class="block font-semibold text-slate-700 mb-1">Satuan / UoM</label>' +
            '<select id="form-prod-uom" class="w-full text-xs p-2 border border-slate-300 rounded focus:border-[#714B67] focus:outline-none bg-white">' +
              '<option value="pcs"' + (uomVal === 'pcs' ? ' selected' : '') + '>pcs</option>' +
              '<option value="unit"' + (uomVal === 'unit' ? ' selected' : '') + '>unit</option>' +
              '<option value="set"' + (uomVal === 'set' ? ' selected' : '') + '>set</option>' +
              '<option value="rim"' + (uomVal === 'rim' ? ' selected' : '') + '>rim</option>' +
              '<option value="box"' + (uomVal === 'box' ? ' selected' : '') + '>box</option>' +
            '</select>' +
          '</div>' +
        '</div>' +
        '<div class="grid grid-cols-2 gap-3">' +
          '<div>' +
            '<label class="block font-semibold text-slate-700 mb-1">Harga Standar (Rp)</label>' +
            '<input id="form-prod-standard-price" type="number" value="' + (p.standardPrice !== undefined ? p.standardPrice : 0) + '" placeholder="0" class="w-full text-xs p-2 border border-slate-300 rounded focus:border-[#714B67] focus:outline-none">' +
          '</div>' +
          '<div>' +
            '<label class="block font-semibold text-slate-700 mb-1">Nomor Seri Aset (Opsional)</label>' +
            '<input id="form-prod-serial" type="text" value="' + (p.serialNumber || '') + '" placeholder="e.g. SN-123456" class="w-full text-xs p-2 border border-slate-300 rounded focus:border-[#714B67] focus:outline-none">' +
          '</div>' +
        '</div>' +
      '</div>';
    }

    function renderSubjectFormHtml(sub) {
      var typeVal = sub.type || 'compulsory';
      return '<div class="space-y-3">' +
        '<input type="hidden" id="form-academic-type" value="subject">' +
        '<div>' +
          '<label class="block font-semibold text-slate-700 mb-1">Nama Mata Pelajaran *</label>' +
          '<input id="form-name" type="text" value="' + (sub.name || '') + '" placeholder="e.g. Matematika Wajib" class="w-full text-xs p-2 border border-slate-300 rounded focus:border-[#714B67] focus:outline-none">' +
        '</div>' +
        '<div>' +
          '<label class="block font-semibold text-slate-700 mb-1">Kode Mata Pelajaran *</label>' +
          '<input id="form-subj-code" type="text" value="' + (sub.code || '') + '" placeholder="e.g. MAT-10" class="w-full text-xs p-2 border border-slate-300 rounded focus:border-[#714B67] focus:outline-none">' +
        '</div>' +
        '<div class="grid grid-cols-2 gap-3">' +
          '<div>' +
            '<label class="block font-semibold text-slate-700 mb-1">Tipe Mapel</label>' +
            '<select id="form-subj-type" class="w-full text-xs p-2 border border-slate-300 rounded focus:border-[#714B67] focus:outline-none bg-white">' +
              '<option value="compulsory"' + (typeVal === 'compulsory' ? ' selected' : '') + '>Wajib (Compulsory)</option>' +
              '<option value="elective"' + (typeVal === 'elective' ? ' selected' : '') + '>Peminatan (Elective)</option>' +
            '</select>' +
          '</div>' +
          '<div>' +
            '<label class="block font-semibold text-slate-700 mb-1">Bobot Penilaian</label>' +
            '<input id="form-subj-weightage" type="number" value="' + (sub.weightage !== undefined ? sub.weightage : 100) + '" placeholder="100" class="w-full text-xs p-2 border border-slate-300 rounded focus:border-[#714B67] focus:outline-none">' +
          '</div>' +
        '</div>' +
      '</div>';
    }

    function renderAcademicYearFormHtml(y) {
      var statusVal = y.status || 'active';
      return '<div class="space-y-3">' +
        '<input type="hidden" id="form-academic-type" value="year">' +
        '<div>' +
          '<label class="block font-semibold text-slate-700 mb-1">Nama Tahun Ajaran *</label>' +
          '<input id="form-name" type="text" value="' + (y.name || '') + '" placeholder="e.g. 2026/2027" class="w-full text-xs p-2 border border-slate-300 rounded focus:border-[#714B67] focus:outline-none">' +
        '</div>' +
        '<div>' +
          '<label class="block font-semibold text-slate-700 mb-1">Kode *</label>' +
          '<input id="form-ay-code" type="text" value="' + (y.code || '') + '" placeholder="e.g. AY-2627" class="w-full text-xs p-2 border border-slate-300 rounded focus:border-[#714B67] focus:outline-none">' +
        '</div>' +
        '<div class="grid grid-cols-2 gap-3">' +
          '<div>' +
            '<label class="block font-semibold text-slate-700 mb-1">Tanggal Mulai *</label>' +
            '<input id="form-start-date" type="date" value="' + (y.startDate || '') + '" class="w-full text-xs p-2 border border-slate-300 rounded focus:border-[#714B67] focus:outline-none">' +
          '</div>' +
          '<div>' +
            '<label class="block font-semibold text-slate-700 mb-1">Tanggal Selesai *</label>' +
            '<input id="form-end-date" type="date" value="' + (y.endDate || '') + '" class="w-full text-xs p-2 border border-slate-300 rounded focus:border-[#714B67] focus:outline-none">' +
          '</div>' +
        '</div>' +
        '<div>' +
          '<label class="block font-semibold text-slate-700 mb-1">Status</label>' +
          '<select id="form-ay-status" class="w-full text-xs p-2 border border-slate-300 rounded focus:border-[#714B67] focus:outline-none bg-white">' +
            '<option value="draft"' + (statusVal === 'draft' ? ' selected' : '') + '>Draft</option>' +
            '<option value="active"' + (statusVal === 'active' ? ' selected' : '') + '>Aktif (Active)</option>' +
            '<option value="closed"' + (statusVal === 'closed' ? ' selected' : '') + '>Selesai (Closed)</option>' +
          '</select>' +
        '</div>' +
      '</div>';
    }

    function renderStudentFormHtml(s) {
      var genderVal = s.gender || 'male';
      var statusVal = s.status || 'active';
      return '<div class="space-y-3">' +
        '<div>' +
          '<label class="block font-semibold text-slate-700 mb-1">Nama Lengkap *</label>' +
          '<input id="form-name" type="text" value="' + (s.name || '') + '" placeholder="Nama Siswa..." class="w-full text-xs p-2 border border-slate-300 rounded focus:border-[#714B67] focus:outline-none">' +
        '</div>' +
        '<div class="grid grid-cols-2 gap-3">' +
          '<div>' +
            '<label class="block font-semibold text-slate-700 mb-1">NIS *</label>' +
            '<input id="form-nis" type="text" value="' + (s.nis || '') + '" placeholder="e.g. 20260101" class="w-full text-xs p-2 border border-slate-300 rounded focus:border-[#714B67] focus:outline-none">' +
          '</div>' +
          '<div>' +
            '<label class="block font-semibold text-slate-700 mb-1">NISN *</label>' +
            '<input id="form-nisn" type="text" value="' + (s.nisn || '') + '" placeholder="e.g. 0012345678" class="w-full text-xs p-2 border border-slate-300 rounded focus:border-[#714B67] focus:outline-none">' +
          '</div>' +
        '</div>' +
        '<div class="grid grid-cols-2 gap-3">' +
          '<div>' +
            '<label class="block font-semibold text-slate-700 mb-1">Jenis Kelamin</label>' +
            '<select id="form-gender" class="w-full text-xs p-2 border border-slate-300 rounded focus:border-[#714B67] focus:outline-none bg-white">' +
              '<option value="male"' + (genderVal === 'male' ? ' selected' : '') + '>Laki-laki (Male)</option>' +
              '<option value="female"' + (genderVal === 'female' ? ' selected' : '') + '>Perempuan (Female)</option>' +
            '</select>' +
          '</div>' +
          '<div>' +
            '<label class="block font-semibold text-slate-700 mb-1">Status</label>' +
            '<select id="form-status" class="w-full text-xs p-2 border border-slate-300 rounded focus:border-[#714B67] focus:outline-none bg-white">' +
              '<option value="active"' + (statusVal === 'active' ? ' selected' : '') + '>Aktif (Active)</option>' +
              '<option value="graduated"' + (statusVal === 'graduated' ? ' selected' : '') + '>Lulus (Graduated)</option>' +
              '<option value="transferred"' + (statusVal === 'transferred' ? ' selected' : '') + '>Pindah (Transferred)</option>' +
              '<option value="inactive"' + (statusVal === 'inactive' ? ' selected' : '') + '>Nonaktif (Inactive)</option>' +
            '</select>' +
          '</div>' +
        '</div>' +
        '<div class="grid grid-cols-2 gap-3">' +
          '<div>' +
            '<label class="block font-semibold text-slate-700 mb-1">Tempat Lahir</label>' +
            '<input id="form-birth-place" type="text" value="' + (s.birthPlace || '') + '" placeholder="e.g. Jakarta" class="w-full text-xs p-2 border border-slate-300 rounded focus:border-[#714B67] focus:outline-none">' +
          '</div>' +
          '<div>' +
            '<label class="block font-semibold text-slate-700 mb-1">Tanggal Lahir</label>' +
            '<input id="form-birth-date" type="date" value="' + (s.birthDate || '') + '" class="w-full text-xs p-2 border border-slate-300 rounded focus:border-[#714B67] focus:outline-none">' +
          '</div>' +
        '</div>' +
        '<div>' +
          '<label class="block font-semibold text-slate-700 mb-1">Alamat Tinggal</label>' +
          '<textarea id="form-address" rows="2" placeholder="Alamat lengkap..." class="w-full text-xs p-2 border border-slate-300 rounded focus:border-[#714B67] focus:outline-none">' + (s.address || '') + '</textarea>' +
        '</div>' +
      '</div>';
    }

    function closeCreateModal() {
      document.getElementById('create-modal').classList.add('hidden');
      document.getElementById('edit-record-id').value = '';
    }

    async function saveModalRecord() {
      var nameInput = document.getElementById('form-name');
      var nameVal = nameInput ? nameInput.value.trim() : '';
      if (!nameVal) { alert('Nama wajib diisi.'); return; }

      var editId = document.getElementById('edit-record-id').value;

      try {
        var isAttendanceInput = document.getElementById('form-is-attendance');
        if (isAttendanceInput && isAttendanceInput.value === 'true') {
          var attDate = document.getElementById('form-att-date').value;
          var attClass = document.getElementById('form-att-class').value;
          var attAndi = document.getElementById('form-att-andi').value;
          var attBella = document.getElementById('form-att-bella').value;

          var attRes = await fetch('/api/attendance/sheets', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              schoolId: 'school_sma_hb',
              classroomId: attClass,
              facultyId: 'fac_budi',
              date: attDate,
              status: 'confirmed',
              lines: [
                { studentId: 'std_andi', status: attAndi, remark: 'Presensi harian' },
                { studentId: 'std_bella', status: attBella, remark: 'Presensi harian' }
              ]
            })
          });
          if (!attRes.ok) {
            var errAtt = await attRes.json();
            throw new Error(errAtt.error || 'Gagal menyimpan sesi presensi');
          }
        } else if (state.currentView === 'students') {
          var nisInput = document.getElementById('form-nis');
          var nisnInput = document.getElementById('form-nisn');
          var genderInput = document.getElementById('form-gender');
          var statusInput = document.getElementById('form-status');
          var birthPlaceInput = document.getElementById('form-birth-place');
          var birthDateInput = document.getElementById('form-birth-date');
          var addressInput = document.getElementById('form-address');

          var nisVal = nisInput && nisInput.value.trim() ? nisInput.value.trim() : ('2026' + Math.floor(Math.random() * 9000 + 1000));
          var nisnVal = nisnInput && nisnInput.value.trim() ? nisnInput.value.trim() : (nisVal + '0');
          var genderVal = genderInput ? genderInput.value : 'male';
          var statusVal = statusInput ? statusInput.value : 'active';
          var birthPlaceVal = birthPlaceInput ? birthPlaceInput.value.trim() : '';
          var birthDateVal = birthDateInput ? birthDateInput.value : '';
          var addressVal = addressInput ? addressInput.value.trim() : '';

          var payload = {
            schoolId: 'sch_smp_01',
            name: nameVal,
            nis: nisVal,
            nisn: nisnVal,
            gender: genderVal,
            status: statusVal,
            birthPlace: birthPlaceVal,
            birthDate: birthDateVal,
            address: addressVal
          };

          if (editId) {
            var updateRes = await fetch('/api/students/' + editId, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload)
            });
            if (!updateRes.ok) {
              var errData = await updateRes.json();
              throw new Error(errData.error || 'Gagal mengupdate siswa');
            }
          } else {
            var createRes = await fetch('/api/students', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload)
            });
            if (!createRes.ok) {
              var errData = await createRes.json();
              throw new Error(errData.error || 'Gagal menambahkan siswa');
            }
          }
        } else if (state.currentView === 'academics') {
          var academicTypeInput = document.getElementById('form-academic-type');
          var isSubject = academicTypeInput && academicTypeInput.value === 'subject';

          if (isSubject) {
            var subjCodeInput = document.getElementById('form-subj-code');
            var subjTypeInput = document.getElementById('form-subj-type');
            var subjWeightInput = document.getElementById('form-subj-weightage');

            var subjCodeVal = subjCodeInput && subjCodeInput.value.trim() ? subjCodeInput.value.trim() : ('SUB-' + Math.floor(Math.random() * 90 + 10));
            var subjTypeVal = subjTypeInput ? subjTypeInput.value : 'compulsory';
            var subjWeightVal = subjWeightInput ? Number(subjWeightInput.value) : 100;

            var subjPayload = {
              schoolId: 'sch_smp_01',
              name: nameVal,
              code: subjCodeVal,
              type: subjTypeVal,
              weightage: subjWeightVal
            };

            if (editId) {
              var updateSubjRes = await fetch('/api/academic/subjects/' + editId, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(subjPayload)
              });
              if (!updateSubjRes.ok) {
                var errSubjData = await updateSubjRes.json();
                throw new Error(errSubjData.error || 'Gagal mengupdate mata pelajaran');
              }
            } else {
              var createSubjRes = await fetch('/api/academic/subjects', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(subjPayload)
              });
              if (!createSubjRes.ok) {
                var errSubjData = await createSubjRes.json();
                throw new Error(errSubjData.error || 'Gagal menambahkan mata pelajaran');
              }
            }
          } else {
            var codeInput = document.getElementById('form-ay-code');
            var startDateInput = document.getElementById('form-start-date');
            var endDateInput = document.getElementById('form-end-date');
            var statusInput = document.getElementById('form-ay-status');

            var codeVal = codeInput && codeInput.value.trim() ? codeInput.value.trim() : ('AY-' + Math.floor(Math.random() * 90 + 10));
            var startDateVal = startDateInput ? startDateInput.value : '';
            var endDateVal = endDateInput ? endDateInput.value : '';
            var statusVal = statusInput ? statusInput.value : 'active';

            var ayPayload = {
              schoolId: 'sch_smp_01',
              name: nameVal,
              code: codeVal,
              startDate: startDateVal,
              endDate: endDateVal,
              status: statusVal
            };

            if (editId) {
              var updateAyRes = await fetch('/api/academic/years/' + editId, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(ayPayload)
              });
              if (!updateAyRes.ok) {
                var errData = await updateAyRes.json();
                throw new Error(errData.error || 'Gagal mengupdate tahun ajaran');
              }
            } else {
              var createAyRes = await fetch('/api/academic/years', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(ayPayload)
              });
              if (!createAyRes.ok) {
                var errData = await createAyRes.json();
                throw new Error(errData.error || 'Gagal menambahkan tahun ajaran');
              }
            }
          }
        } else if (state.currentView === 'exams') {
          var subjectInput = document.getElementById('form-exam-subject');
          var examDateInput = document.getElementById('form-exam-date');
          var passingInput = document.getElementById('form-exam-passing');
          var weightInput = document.getElementById('form-exam-weight');
          var statusExamInput = document.getElementById('form-exam-status');

          var subjectVal = subjectInput && subjectInput.value.trim() ? subjectInput.value.trim() : 'MAT-10';
          var examDateVal = examDateInput ? examDateInput.value : new Date().toISOString().split('T')[0];
          var passingVal = passingInput ? Number(passingInput.value) : 75;
          var weightVal = weightInput ? Number(weightInput.value) : 30;
          var statusExamVal = statusExamInput ? statusExamInput.value : 'draft';

          var examPayload = {
            schoolId: 'sch_smp_01',
            academicYearId: 'ay_2025_ganjil',
            termId: 'term_01',
            classroomId: 'cls_x_mipa_1',
            subjectId: subjectVal,
            name: nameVal,
            examDate: examDateVal,
            totalMarks: 100,
            passingMarks: passingVal,
            weightage: weightVal,
            status: statusExamVal
          };

          if (editId) {
            var updateExamRes = await fetch('/api/exams/sessions/' + editId, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(examPayload)
            });
            if (!updateExamRes.ok) {
              var errExamData = await updateExamRes.json();
              throw new Error(errExamData.error || 'Gagal mengupdate sesi ujian');
            }
          } else {
            var createExamRes = await fetch('/api/exams/sessions', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(examPayload)
            });
            if (!createExamRes.ok) {
              var errExamData = await createExamRes.json();
              throw new Error(errExamData.error || 'Gagal membuat sesi ujian');
            }
          }
        } else if (state.currentView === 'inventory') {
          var prodCodeInput = document.getElementById('form-prod-code');
          var prodTypeInput = document.getElementById('form-prod-type');
          var prodUomInput = document.getElementById('form-prod-uom');
          var prodPriceInput = document.getElementById('form-prod-standard-price');
          var prodSerialInput = document.getElementById('form-prod-serial');

          var prodCodeVal = prodCodeInput && prodCodeInput.value.trim() ? prodCodeInput.value.trim() : ('PRD-' + Math.floor(Math.random() * 900 + 100));
          var prodTypeVal = prodTypeInput ? prodTypeInput.value : 'storable';
          var prodUomVal = prodUomInput ? prodUomInput.value : 'pcs';
          var prodPriceVal = prodPriceInput ? Number(prodPriceInput.value) : 0;
          var prodSerialVal = prodSerialInput && prodSerialInput.value.trim() ? prodSerialInput.value.trim() : null;

          var prodPayload = {
            schoolId: 'sch_smp_01',
            name: nameVal,
            code: prodCodeVal,
            type: prodTypeVal,
            uom: prodUomVal,
            standardPrice: prodPriceVal,
            serialNumber: prodSerialVal
          };

          if (editId) {
            var updateProdRes = await fetch('/api/inventory/products/' + editId, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(prodPayload)
            });
            if (!updateProdRes.ok) {
              var errData = await updateProdRes.json();
              throw new Error(errData.error || 'Gagal mengupdate produk');
            }
          } else {
            var createProdRes = await fetch('/api/inventory/products', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(prodPayload)
            });
            if (!createProdRes.ok) {
              var errData = await createProdRes.json();
              throw new Error(errData.error || 'Gagal menambahkan produk');
            }
          }
        } else if (state.currentView === 'finance') {
          var invNumberInput = document.getElementById('form-inv-number');
          var invDateInput = document.getElementById('form-inv-date');
          var invDueDateInput = document.getElementById('form-inv-due-date');
          var invPartnerInput = document.getElementById('form-inv-partner-id');
          var invAmountInput = document.getElementById('form-inv-amount');
          var invDescInput = document.getElementById('form-inv-desc');

          var invNumberVal = invNumberInput && invNumberInput.value.trim() ? invNumberInput.value.trim() : ('INV/' + new Date().getFullYear() + '/' + Math.floor(Math.random() * 9000 + 1000));
          var invDateVal = invDateInput ? invDateInput.value : new Date().toISOString().split('T')[0];
          var invDueDateVal = invDueDateInput ? invDueDateInput.value : null;
          var invPartnerIdVal = invPartnerInput && invPartnerInput.value ? invPartnerInput.value : null;
          var invAmountVal = invAmountInput ? Number(invAmountInput.value) : 500000;
          var invDescVal = invDescInput && invDescInput.value.trim() ? invDescInput.value.trim() : 'Tagihan SPP Siswa';

          var invPayload = {
            schoolId: 'school_sma_hb',
            journalId: 'jrn_sale',
            partnerId: invPartnerIdVal,
            studentId: invPartnerIdVal,
            name: invNumberVal,
            date: invDateVal,
            dueDate: invDueDateVal,
            amountTotal: invAmountVal,
            description: invDescVal + (nameVal ? ' - ' + nameVal : ''),
            receivableAccountId: 'coa_ar',
            incomeAccountId: 'coa_rev_spp'
          };

          var createInvRes = await fetch('/api/finance/invoices', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(invPayload)
          });
          if (!createInvRes.ok) {
            var errInvData = await createInvRes.json();
            throw new Error(errInvData.error || 'Gagal membuat tagihan SPP');
          }
        }
        closeCreateModal();
        navigate(state.currentView);
      } catch (err) {
        alert('Gagal menyimpan ke D1: ' + err.message);
      }
    }

    async function deleteStudent(studentId, studentName) {
      if (!confirm('Apakah Anda yakin ingin menghapus siswa "' + studentName + '"? Data yang dihapus tidak dapat dikembalikan.')) {
        return;
      }
      try {
        var res = await fetch('/api/students/' + studentId, {
          method: 'DELETE'
        });
        if (!res.ok) {
          var errData = await res.json();
          throw new Error(errData.error || 'Gagal menghapus siswa');
        }
        renderStudents();
      } catch (err) {
        alert('Gagal menghapus siswa: ' + err.message);
      }
    }

    async function deleteAcademicYear(yearId, yearName) {
      if (!confirm('Apakah Anda yakin ingin menghapus tahun ajaran "' + yearName + '"? Data yang dihapus tidak dapat dikembalikan.')) {
        return;
      }
      try {
        var res = await fetch('/api/academic/years/' + yearId, {
          method: 'DELETE'
        });
        if (!res.ok) {
          var errData = await res.json();
          throw new Error(errData.error || 'Gagal menghapus tahun ajaran');
        }
        renderAcademics();
      } catch (err) {
        alert('Gagal menghapus tahun ajaran: ' + err.message);
      }
    }

    async function deleteSubject(subjectId, subjectName) {
      if (!confirm('Apakah Anda yakin ingin menghapus mata pelajaran "' + subjectName + '"? Data yang dihapus tidak dapat dikembalikan.')) {
        return;
      }
      try {
        var res = await fetch('/api/academic/subjects/' + subjectId, {
          method: 'DELETE'
        });
        if (!res.ok) {
          var errData = await res.json();
          throw new Error(errData.error || 'Gagal menghapus mata pelajaran');
        }
        renderAcademics();
      } catch (err) {
        alert('Gagal menghapus mata pelajaran: ' + err.message);
      }
    }

    async function deleteExamSession(sessionId, sessionName) {
      if (!confirm('Apakah Anda yakin ingin menghapus sesi ujian "' + sessionName + '"? Seluruh nilai terkait akan dihapus secara atomik.')) {
        return;
      }
      try {
        var res = await fetch('/api/exams/sessions/' + sessionId, {
          method: 'DELETE'
        });
        if (!res.ok) {
          var errData = await res.json();
          throw new Error(errData.error || 'Gagal menghapus sesi ujian');
        }
        renderExams();
      } catch (err) {
        alert('Gagal menghapus sesi ujian: ' + err.message);
      }
    }

    async function deleteProduct(productId, productName) {
      if (!confirm('Apakah Anda yakin ingin menghapus barang/produk "' + productName + '"? Data yang dihapus tidak dapat dikembalikan.')) {
        return;
      }
      try {
        var res = await fetch('/api/inventory/products/' + productId, {
          method: 'DELETE'
        });
        if (!res.ok) {
          var errData = await res.json();
          throw new Error(errData.error || 'Gagal menghapus produk');
        }
        renderInventory();
      } catch (err) {
        alert('Gagal menghapus produk: ' + err.message);
      }
    }

    async function deleteInvoice(invoiceId, invoiceName) {
      if (!confirm('Apakah Anda yakin ingin menghapus tagihan "' + invoiceName + '"? Ayat jurnal double-entry terkait akan dibatalkan/dihapus secara atomik dari D1.')) {
        return;
      }
      try {
        var res = await fetch('/api/finance/invoices/' + invoiceId, {
          method: 'DELETE'
        });
        if (!res.ok) {
          var errData = await res.json();
          throw new Error(errData.error || 'Gagal menghapus tagihan');
        }
        renderFinance();
      } catch (err) {
        alert('Gagal menghapus tagihan: ' + err.message);
      }
    }

    function viewInvoiceDetail(id) {
      var inv = state.cache.invoices.find(function(x) { return x.id === id; }) || {};
      alert('Detail Tagihan ' + (inv.name || id) + ':\\n' +
        'Status Bayar: ' + (inv.paymentState === 'paid' ? 'LUNAS' : 'BELUM LUNAS') + '\\n' +
        'Total: Rp ' + (inv.amountTotal || 0).toLocaleString('id-ID') + '\\n' +
        'Sisa: Rp ' + (inv.amountResidual || 0).toLocaleString('id-ID') + '\\n' +
        'Jatuh Tempo: ' + (inv.invoiceDueDate || '-'));
    }

    function openCreateAttendanceModal() {
      document.getElementById('edit-record-id').value = '';
      document.getElementById('modal-title').innerText = 'Buat Sesi Presensi Kelas';
      var content = document.getElementById('modal-form-content');
      var today = new Date().toISOString().split('T')[0];
      content.innerHTML = '<div class="space-y-3">' +
        '<input type="hidden" id="form-is-attendance" value="true">' +
        '<div>' +
          '<label class="block font-semibold text-slate-700 mb-1">Nama Sesi / Catatan *</label>' +
          '<input id="form-name" type="text" value="Presensi Matematika Wajib" placeholder="e.g. Sesi Presensi Pagi" class="w-full text-xs p-2 border border-slate-300 rounded focus:border-[#714B67] focus:outline-none">' +
        '</div>' +
        '<div class="grid grid-cols-2 gap-3">' +
          '<div>' +
            '<label class="block font-semibold text-slate-700 mb-1">Tanggal Presensi *</label>' +
            '<input id="form-att-date" type="date" value="' + today + '" class="w-full text-xs p-2 border border-slate-300 rounded">' +
          '</div>' +
          '<div>' +
            '<label class="block font-semibold text-slate-700 mb-1">Kelas / Rombel</label>' +
            '<select id="form-att-class" class="w-full text-xs p-2 border border-slate-300 rounded bg-white">' +
              '<option value="cls_x_ipa_1">X-MIPA-1</option>' +
              '<option value="cls_x_ipa_2">X-MIPA-2</option>' +
            '</select>' +
          '</div>' +
        '</div>' +
        '<div class="p-3 bg-purple-50/50 rounded border border-purple-100">' +
          '<span class="font-semibold text-slate-800 block mb-2">Checklist Kehadiran Siswa Kelas</span>' +
          '<div class="space-y-2">' +
            '<div class="flex items-center justify-between py-1 border-b border-purple-100/60">' +
              '<span class="font-medium text-slate-800">Andi Pratama</span>' +
              '<select id="form-att-andi" class="text-xs p-1 border border-slate-300 rounded bg-white">' +
                '<option value="present">Hadir (Present)</option>' +
                '<option value="sick">Sakit (Sick)</option>' +
                '<option value="excused">Izin (Excused)</option>' +
                '<option value="absent">Alpa (Absent)</option>' +
              '</select>' +
            '</div>' +
            '<div class="flex items-center justify-between py-1">' +
              '<span class="font-medium text-slate-800">Bella Cantika</span>' +
              '<select id="form-att-bella" class="text-xs p-1 border border-slate-300 rounded bg-white">' +
                '<option value="present">Hadir (Present)</option>' +
                '<option value="sick">Sakit (Sick)</option>' +
                '<option value="excused">Izin (Excused)</option>' +
                '<option value="absent">Alpa (Absent)</option>' +
              '</select>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div>';
      document.getElementById('create-modal').classList.remove('hidden');
    }

    function openPaymentModal(invoiceId) {
      var inv = (state.cache.invoices || []).find(function(x) { return x.id === invoiceId; });
      if (!inv) return;
      document.getElementById('pay-move-id').value = inv.id;
      document.getElementById('pay-student-id').value = inv.studentId || '';
      document.getElementById('pay-invoice-number').value = inv.name + ' (Sisa: Rp ' + (inv.amountResidual || 0).toLocaleString('id-ID') + ')';
      document.getElementById('pay-amount').value = inv.amountResidual || inv.amountTotal || 500000;
      document.getElementById('pay-date').value = new Date().toISOString().split('T')[0];
      document.getElementById('pay-reference').value = 'TRF-BCA-' + Math.floor(Math.random() * 900000 + 100000);
      document.getElementById('payment-modal').classList.remove('hidden');
    }

    function closePaymentModal() {
      document.getElementById('payment-modal').classList.add('hidden');
    }

    async function submitPayment() {
      var moveId = document.getElementById('pay-move-id').value;
      var studentId = document.getElementById('pay-student-id').value;
      var amount = Number(document.getElementById('pay-amount').value);
      var method = document.getElementById('pay-method').value;
      var paymentDate = document.getElementById('pay-date').value;
      var ref = document.getElementById('pay-reference').value;

      if (!amount || amount <= 0) {
        alert('Nominal pembayaran harus lebih dari 0.');
        return;
      }

      try {
        var res = await fetch('/api/finance/payments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            schoolId: 'school_sma_hb',
            moveId: moveId,
            studentId: studentId,
            amount: amount,
            paymentMethod: method,
            paymentDate: paymentDate,
            reference: ref
          })
        });

        if (!res.ok) {
          var err = await res.json();
          throw new Error(err.error || 'Gagal menyimpan pembayaran');
        }

        closePaymentModal();
        alert('Pembayaran berhasil dicatat! Status tagihan telah diperbarui secara otomatis.');
        renderFinance();
      } catch (e) {
        alert('Gagal mencatat pembayaran: ' + e.message);
      }
    }

    async function viewReportCard(studentId) {
      var modal = document.getElementById('report-modal');
      var body = document.getElementById('report-modal-body');
      var subtitle = document.getElementById('report-modal-subtitle');
      modal.classList.remove('hidden');
      body.innerHTML = '<div class="text-center py-8 text-slate-400"><i class="fa-solid fa-circle-notch fa-spin text-xl"></i><p class="mt-2 text-xs">Memuat rapor dari Cloudflare D1...</p></div>';

      try {
        var res = await fetch('/api/exams/report-card/' + studentId);
        var json = await res.json();
        var student = json.student || {};
        var marks = json.marks || [];

        subtitle.innerText = 'Siswa: ' + (student.name || studentId) + ' (NIS: ' + (student.nis || '-') + ') | Semester Ganjil 2025/2026';

        var html = '<div class="grid grid-cols-3 gap-3 p-3 bg-purple-50 rounded border border-purple-100 text-xs">' +
          '<div><span class="text-slate-500 block">Total Mata Pelajaran</span><span class="font-bold text-slate-800 text-sm">' + marks.length + ' Mapel</span></div>' +
          '<div><span class="text-slate-500 block">Rata-rata Nilai</span><span class="font-bold text-emerald-700 text-sm">' + (json.averageScore || 0).toFixed(1) + '</span></div>' +
          '<div><span class="text-slate-500 block">Status Hasil Belajar</span><span class="font-bold text-slate-800 text-sm">TUNTAS</span></div>' +
        '</div>' +
        '<table class="w-full text-left text-xs text-slate-700 border border-slate-200 rounded mt-3">' +
          '<thead class="bg-slate-50 text-slate-600 uppercase font-semibold border-b border-slate-200">' +
            '<tr>' +
              '<th class="px-4 py-2.5">Mata Pelajaran</th>' +
              '<th class="px-4 py-2.5">Nilai Angka</th>' +
              '<th class="px-4 py-2.5">Predikat / Grade</th>' +
              '<th class="px-4 py-2.5">Catatan Akademik</th>' +
            '</tr>' +
          '</thead>' +
          '<tbody class="divide-y divide-slate-100">';

        if (marks.length === 0) {
          html += '<tr><td colspan="4" class="text-center py-6 text-slate-400">Belum ada rekap nilai ujian untuk siswa ini.</td></tr>';
        } else {
          marks.forEach(function(m) {
            html += '<tr class="hover:bg-slate-50">' +
              '<td class="px-4 py-2.5 font-bold text-slate-800">' + (m.subjectName || m.subjectCode || 'Mapel') + '</td>' +
              '<td class="px-4 py-2.5 font-bold font-mono text-slate-800">' + m.marksObtained + '</td>' +
              '<td class="px-4 py-2.5"><span class="px-2 py-0.5 rounded text-[11px] font-bold ' + (m.grade === 'A' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800') + '">' + m.grade + '</span></td>' +
              '<td class="px-4 py-2.5 text-slate-600">' + (m.remark || '-') + '</td>' +
            '</tr>';
          });
        }

        html += '</tbody></table>';
        body.innerHTML = html;
      } catch (err) {
        body.innerHTML = '<div class="p-4 bg-rose-50 text-rose-700 rounded">Gagal memuat rapor: ' + err.message + '</div>';
      }
    }

    function closeReportModal() {
      document.getElementById('report-modal').classList.add('hidden');
    }

    window.onload = init;
  </script>
</body>
</html>`;
