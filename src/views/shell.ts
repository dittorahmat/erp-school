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

  <!-- App Client-Side Controller -->
  <script>
    var state = {
      currentUser: JSON.parse(localStorage.getItem('erp_user') || JSON.stringify({
        name: 'Bambang Sudarmono, M.Pd',
        role: 'superadmin',
        email: 'admin@sekolah.demo',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'
      })),
      currentView: 'dashboard'
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
        '<div onclick="navigate(\\'students\\')" class="bg-white p-4 rounded border border-slate-200 cursor-pointer hover:border-slate-400 transition">' +
          '<div class="text-xs font-semibold text-slate-600 uppercase tracking-wide">Total Siswa Aktif</div>' +
          '<div class="text-2xl font-bold text-slate-800 mt-1">50</div>' +
          '<div class="text-xs text-emerald-700 mt-1 font-medium">100% Terdaftar</div>' +
        '</div>' +
        '<div onclick="navigate(\\'attendance\\')" class="bg-white p-4 rounded border border-slate-200 cursor-pointer hover:border-slate-400 transition">' +
          '<div class="text-xs font-semibold text-slate-600 uppercase tracking-wide">Kehadiran Hari Ini</div>' +
          '<div class="text-2xl font-bold text-slate-800 mt-1">96.8%</div>' +
          '<div class="text-xs text-emerald-700 mt-1 font-medium">48 Hadir / 2 Izin</div>' +
        '</div>' +
        '<div onclick="navigate(\\'finance\\')" class="bg-white p-4 rounded border border-slate-200 cursor-pointer hover:border-slate-400 transition">' +
          '<div class="text-xs font-semibold text-slate-600 uppercase tracking-wide">Invoice SPP Terbayar</div>' +
          '<div class="text-2xl font-bold text-slate-800 mt-1">Rp 22.500.000</div>' +
          '<div class="text-xs text-slate-600 mt-1">45 dari 50 Siswa</div>' +
        '</div>' +
        '<div onclick="navigate(\\'inventory\\')" class="bg-white p-4 rounded border border-slate-200 cursor-pointer hover:border-slate-400 transition">' +
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

        var html = '<div class="bg-white rounded border border-slate-200 overflow-hidden">' +
          '<div class="p-3.5 border-b border-slate-200 flex items-center justify-between">' +
            '<span class="font-semibold text-xs text-slate-700">Total: ' + data.length + ' Siswa Terdaftar</span>' +
            '<button onclick="navigate(\\'students\\')" class="text-xs text-purple-700 font-medium hover:underline"><i class="fa-solid fa-rotate-right"></i> Refresh</button>' +
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
            var studentJson = JSON.stringify(s).replace(/"/g, '&quot;');
            html += '<tr class="hover:bg-slate-50 transition">' +
              '<td class="px-5 py-3 flex items-center gap-3">' +
                '<img src="' + (s.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100') + '" class="w-7 h-7 rounded-full object-cover border" alt="Avatar">' +
                '<div><span class="font-bold text-slate-800 block">' + s.name + '</span><span class="text-slate-500 text-[11px]">' + (s.address || 'Jakarta') + '</span></div>' +
              '</td>' +
              '<td class="px-5 py-3 font-mono">' + s.nis + ' / ' + s.nisn + '</td>' +
              '<td class="px-5 py-3 capitalize">' + s.gender + '</td>' +
              '<td class="px-5 py-3"><span class="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-100 text-emerald-800">' + s.status + '</span></td>' +
              '<td class="px-5 py-3 text-right space-x-1.5">' +
                '<button onclick="viewReportCard(\\'' + s.id + '\\')" class="bg-purple-50 text-purple-700 hover:bg-purple-100 px-2 py-1 rounded transition font-medium">Rapor</button>' +
                '<button onclick=\\'openEditStudentModal(' + studentJson + ')\\' class="bg-slate-100 text-slate-700 hover:bg-slate-200 px-2 py-1 rounded transition font-medium">Edit</button>' +
                '<button onclick="deleteStudent(\\'' + s.id + '\\', \\'' + s.name.replace(/'/g, "\\\\'") + '\\')" class="bg-rose-50 text-rose-700 hover:bg-rose-100 px-2 py-1 rounded transition font-medium">Hapus</button>' +
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
        var res = await fetch('/api/academic/years');
        var json = await res.json();
        var years = json.data || [];

        var html = '<div class="bg-white rounded border border-slate-200 overflow-hidden">' +
          '<div class="p-3.5 border-b border-slate-200"><span class="font-semibold text-xs text-slate-700">Tahun Ajaran Aktif</span></div>' +
          '<table class="w-full text-left text-xs text-slate-700">' +
            '<thead class="bg-slate-50 text-slate-600 uppercase font-semibold border-b border-slate-200">' +
              '<tr><th class="px-5 py-2.5">Nama Tahun Ajaran</th><th class="px-5 py-2.5">Kode</th><th class="px-5 py-2.5">Periode</th><th class="px-5 py-2.5">Status</th></tr>' +
            '</thead>' +
            '<tbody class="divide-y divide-slate-100">';

        years.forEach(function(y) {
          html += '<tr class="hover:bg-slate-50">' +
            '<td class="px-5 py-3 font-bold text-slate-800">' + y.name + '</td>' +
            '<td class="px-5 py-3 font-mono">' + y.code + '</td>' +
            '<td class="px-5 py-3 text-slate-600">' + y.startDate + ' s/d ' + y.endDate + '</td>' +
            '<td class="px-5 py-3"><span class="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-100 text-emerald-800">' + y.status + '</span></td>' +
          '</tr>';
        });

        html += '</tbody></table></div>';
        document.getElementById('main-content').innerHTML = html;
      } catch (err) {
        document.getElementById('main-content').innerHTML = '<div class="p-6 bg-rose-50 text-rose-700 rounded">Gagal memuat data akademik: ' + err.message + '</div>';
      }
    }

    async function renderAttendance() {
      try {
        var res = await fetch('/api/attendance/timetables');
        var json = await res.json();

        var html = '<div class="bg-white rounded border border-slate-200 overflow-hidden">' +
          '<div class="p-3.5 border-b border-slate-200"><h3 class="font-bold text-slate-800 text-xs">Jadwal Pelajaran Mingguan</h3></div>' +
          '<div class="p-5">' +
            '<div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">' +
              '<div class="p-3.5 bg-slate-50 rounded border border-slate-200"><span class="font-semibold text-purple-800 uppercase block mb-1">Senin (07:30 - 09:00)</span><p class="font-bold text-slate-800">Matematika Wajib</p><p class="text-slate-500 mt-0.5">Kelas: X-MIPA-1 | Guru: Budi Santoso, S.Pd</p></div>' +
              '<div class="p-3.5 bg-slate-50 rounded border border-slate-200"><span class="font-semibold text-purple-800 uppercase block mb-1">Selasa (09:15 - 10:45)</span><p class="font-bold text-slate-800">Fisika Dasar</p><p class="text-slate-500 mt-0.5">Kelas: X-MIPA-1 | Guru: Dewi Lestari, M.Si</p></div>' +
              '<div class="p-3.5 bg-slate-50 rounded border border-slate-200"><span class="font-semibold text-purple-800 uppercase block mb-1">Rabu (07:30 - 09:00)</span><p class="font-bold text-slate-800">Kimia Analitik</p><p class="text-slate-500 mt-0.5">Kelas: X-MIPA-2 | Guru: Staf Pengajar</p></div>' +
            '</div>' +
          '</div>' +
        '</div>';
        document.getElementById('main-content').innerHTML = html;
      } catch (err) {
        document.getElementById('main-content').innerHTML = '<div class="p-6 bg-rose-50 text-rose-700 rounded">Error: ' + err.message + '</div>';
      }
    }

    async function renderExams() {
      var html = '<div class="bg-white rounded border border-slate-200 overflow-hidden">' +
        '<div class="p-3.5 border-b border-slate-200"><h3 class="font-bold text-slate-800 text-xs">Sesi Ujian Semester Ganjil 2025/2026</h3></div>' +
        '<table class="w-full text-left text-xs text-slate-700">' +
          '<thead class="bg-slate-50 text-slate-600 uppercase font-semibold border-b border-slate-200">' +
            '<tr><th class="px-5 py-2.5">Nama Ujian</th><th class="px-5 py-2.5">Mata Pelajaran</th><th class="px-5 py-2.5">Tanggal Ujian</th><th class="px-5 py-2.5">Passing Marks (KKM)</th><th class="px-5 py-2.5">Status</th></tr>' +
          '</thead>' +
          '<tbody class="divide-y divide-slate-100">' +
            '<tr class="hover:bg-slate-50"><td class="px-5 py-3 font-bold text-slate-800">UTS Semester Ganjil</td><td class="px-5 py-3">Matematika Wajib (MAT-10)</td><td class="px-5 py-3 text-slate-600">2026-10-15</td><td class="px-5 py-3 font-bold">75</td><td class="px-5 py-3"><span class="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-100 text-emerald-800">Published</span></td></tr>' +
            '<tr class="hover:bg-slate-50"><td class="px-5 py-3 font-bold text-slate-800">Tugas Praktikum 1</td><td class="px-5 py-3">Fisika Dasar (FIS-10)</td><td class="px-5 py-3 text-slate-600">2026-10-20</td><td class="px-5 py-3 font-bold">75</td><td class="px-5 py-3"><span class="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-100 text-emerald-800">Published</span></td></tr>' +
          '</tbody>' +
        '</table>' +
      '</div>';
      document.getElementById('main-content').innerHTML = html;
    }

    async function renderFinance() {
      try {
        var invRes = await fetch('/api/finance/invoices');
        var tbRes = await fetch('/api/finance/trial-balance');
        var invJson = await invRes.json();
        var tbJson = await tbRes.json();
        var invoices = invJson.data || [];

        var html = '<div class="bg-slate-800 text-white p-5 rounded border border-slate-700 mb-6 flex items-center justify-between">' +
          '<div>' +
            '<span class="text-xs uppercase font-bold text-slate-300 tracking-wider">Neraca Saldo (Double-Entry Bookkeeping)</span>' +
            '<p class="text-xl font-bold mt-1">Debit: Rp ' + (tbJson.totalDebit || 0).toLocaleString('id-ID') + ' | Credit: Rp ' + (tbJson.totalCredit || 0).toLocaleString('id-ID') + '</p>' +
            '<p class="text-xs text-emerald-400 mt-1"><i class="fa-solid fa-check"></i> ' + (tbJson.isBalanced ? 'Jurnal Akuntansi Berimbang (Debit = Credit)' : 'Tidak Berimbang') + '</p>' +
          '</div>' +
          '<div class="text-right"><span class="text-xs bg-slate-700 px-3 py-1 rounded font-mono">' + (tbJson.lineCount || 0) + ' Journal Lines</span></div>' +
        '</div>' +
        '<div class="bg-white rounded border border-slate-200 overflow-hidden">' +
          '<div class="p-3.5 border-b border-slate-200"><h3 class="font-bold text-slate-800 text-xs">Daftar Tagihan SPP (Invoices)</h3></div>' +
          '<table class="w-full text-left text-xs text-slate-700">' +
            '<thead class="bg-slate-50 text-slate-600 uppercase font-semibold border-b border-slate-200">' +
              '<tr><th class="px-5 py-2.5">No. Invoice</th><th class="px-5 py-2.5">Tanggal & Jatuh Tempo</th><th class="px-5 py-2.5">Total Biaya</th><th class="px-5 py-2.5">Sisa Tagihan</th><th class="px-5 py-2.5">Status Bayar</th></tr>' +
            '</thead>' +
            '<tbody class="divide-y divide-slate-100">';

        invoices.forEach(function(inv) {
          var isPaid = inv.paymentState === 'paid';
          html += '<tr class="hover:bg-slate-50">' +
            '<td class="px-5 py-3 font-bold font-mono text-slate-800">' + inv.name + '</td>' +
            '<td class="px-5 py-3 text-slate-600">' + inv.date + ' (Due: ' + (inv.invoiceDueDate || '-') + ')</td>' +
            '<td class="px-5 py-3 font-bold">Rp ' + (inv.amountTotal || 0).toLocaleString('id-ID') + '</td>' +
            '<td class="px-5 py-3 text-slate-600">Rp ' + (inv.amountResidual || 0).toLocaleString('id-ID') + '</td>' +
            '<td class="px-5 py-3"><span class="px-2 py-0.5 rounded text-[11px] font-semibold ' + (isPaid ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800') + '">' + (isPaid ? 'Lunas' : 'Belum Lunas') + '</span></td>' +
          '</tr>';
        });

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

        var html = '<div class="bg-white rounded border border-slate-200 overflow-hidden">' +
          '<div class="p-3.5 border-b border-slate-200"><h3 class="font-bold text-slate-800 text-xs">Daftar Barang & Aset Sekolah</h3></div>' +
          '<table class="w-full text-left text-xs text-slate-700">' +
            '<thead class="bg-slate-50 text-slate-600 uppercase font-semibold border-b border-slate-200">' +
              '<tr><th class="px-5 py-2.5">Nama Produk / Item</th><th class="px-5 py-2.5">Kode</th><th class="px-5 py-2.5">Tipe</th><th class="px-5 py-2.5">Satuan</th><th class="px-5 py-2.5">Harga Standar</th><th class="px-5 py-2.5">Nomor Seri Aset</th></tr>' +
            '</thead>' +
            '<tbody class="divide-y divide-slate-100">';

        data.forEach(function(p) {
          html += '<tr class="hover:bg-slate-50">' +
            '<td class="px-5 py-3 font-bold text-slate-800">' + p.name + '</td>' +
            '<td class="px-5 py-3 font-mono">' + p.code + '</td>' +
            '<td class="px-5 py-3 uppercase">' + p.type + '</td>' +
            '<td class="px-5 py-3">' + p.uom + '</td>' +
            '<td class="px-5 py-3">Rp ' + (p.standardPrice || 0).toLocaleString('id-ID') + '</td>' +
            '<td class="px-5 py-3 font-mono text-slate-500">' + (p.serialNumber || '-') + '</td>' +
          '</tr>';
        });

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
      } else {
        content.innerHTML = '<div><label class="block font-semibold text-slate-700 mb-1">Nama Item / Dokumen</label><input id="form-name" type="text" placeholder="Nama..." class="w-full text-xs p-2 border border-slate-300 rounded focus:border-[#714B67] focus:outline-none"></div>';
      }
      document.getElementById('create-modal').classList.remove('hidden');
    }

    function openEditStudentModal(student) {
      document.getElementById('edit-record-id').value = student.id;
      document.getElementById('modal-title').innerText = 'Edit Data Siswa';
      var content = document.getElementById('modal-form-content');
      content.innerHTML = renderStudentFormHtml(student);
      document.getElementById('create-modal').classList.remove('hidden');
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
        if (state.currentView === 'students') {
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
        } else if (state.currentView === 'inventory') {
          await fetch('/api/inventory/products', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ schoolId: 'sch_smp_01', name: nameVal, code: 'PRD-' + Math.floor(Math.random() * 900 + 100), standardPrice: 50000, type: 'storable' })
          });
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

    function viewReportCard(studentId) {
      alert('Membuka Rapor Digital Siswa ID: ' + studentId + ' (Terhubung dengan database D1)');
    }

    window.onload = init;
  </script>
</body>
</html>`;
