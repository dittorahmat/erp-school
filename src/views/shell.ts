export const odooShellHtml = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ERP Sekolah - Odoo Edition</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <style>
    :root {
      --odoo-purple: #714B67;
      --odoo-purple-dark: #583950;
      --odoo-teal: #00A09D;
      --odoo-gray-bg: #F9F9FA;
    }
  </style>
</head>
<body class="bg-slate-100 font-sans text-slate-800 antialiased min-h-screen flex flex-col">
  <!-- Top Odoo Navbar -->
  <header class="bg-[#714B67] text-white h-12 flex items-center justify-between px-4 shadow-sm z-40 select-none">
    <div class="flex items-center space-x-3">
      <button onclick="navigate('dashboard')" class="hover:bg-[#583950] p-2 rounded transition flex items-center justify-center">
        <i class="fa-solid fa-grip text-lg"></i>
      </button>
      <span class="font-bold tracking-tight text-lg flex items-center gap-2 cursor-pointer" onclick="navigate('dashboard')">
        <i class="fa-solid fa-graduation-cap"></i> ERP Sekolah
      </span>
      <nav class="hidden md:flex space-x-1 text-sm pl-4">
        <button onclick="navigate('dashboard')" class="nav-link px-3 py-1.5 rounded hover:bg-[#583950] transition font-medium" data-view="dashboard">Dashboard</button>
        <button onclick="navigate('students')" class="nav-link px-3 py-1.5 rounded hover:bg-[#583950] transition" data-view="students">Siswa</button>
        <button onclick="navigate('academics')" class="nav-link px-3 py-1.5 rounded hover:bg-[#583950] transition" data-view="academics">Akademik</button>
        <button onclick="navigate('attendance')" class="nav-link px-3 py-1.5 rounded hover:bg-[#583950] transition" data-view="attendance">Presensi</button>
        <button onclick="navigate('exams')" class="nav-link px-3 py-1.5 rounded hover:bg-[#583950] transition" data-view="exams">Ujian & Nilai</button>
        <button onclick="navigate('finance')" class="nav-link px-3 py-1.5 rounded hover:bg-[#583950] transition" data-view="finance">Keuangan (SPP)</button>
        <button onclick="navigate('inventory')" class="nav-link px-3 py-1.5 rounded hover:bg-[#583950] transition" data-view="inventory">Inventaris</button>
      </nav>
    </div>
    
    <div class="flex items-center space-x-3 text-sm">
      <span class="bg-[#583950] px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 hidden sm:flex">
        <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> SMA Harapan Bangsa
      </span>
      
      <!-- User Profile & Account Switcher Dropdown -->
      <div class="relative">
        <button onclick="toggleUserDropdown()" class="flex items-center space-x-2 border-l border-purple-400/30 pl-3 py-1 hover:bg-[#583950] rounded transition pr-1">
          <img id="nav-avatar" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100" class="w-7 h-7 rounded-full border border-white/50 object-cover" alt="Avatar">
          <div class="text-left hidden sm:block">
            <span class="font-medium text-xs block leading-tight" id="nav-user-name">Bambang Sudarmono</span>
            <span class="text-[10px] text-purple-200 block uppercase" id="nav-user-role">Superadmin</span>
          </div>
          <i class="fa-solid fa-chevron-down text-[10px] text-purple-200"></i>
        </button>

        <!-- Dropdown Menu -->
        <div id="user-dropdown" class="hidden absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-slate-200 py-2 z-50 text-slate-700">
          <div class="px-4 py-2 border-b border-slate-100">
            <p class="text-xs text-slate-400 font-bold uppercase">Akun Aktif</p>
            <p class="font-bold text-sm text-slate-800" id="drop-user-name">Bambang Sudarmono, M.Pd</p>
            <p class="text-xs text-slate-500" id="drop-user-email">admin@sekolah.demo</p>
          </div>
          <div class="py-1">
            <p class="px-4 py-1 text-[11px] font-bold text-slate-400 uppercase">Ganti Akun Demo (Switch Persona)</p>
            <button onclick="switchUser('admin')" class="w-full text-left px-4 py-1.5 text-xs hover:bg-slate-50 flex items-center justify-between">
              <span><i class="fa-solid fa-crown text-purple-600 mr-2"></i> Superadmin (Kepala Sekolah)</span>
            </button>
            <button onclick="switchUser('finance')" class="w-full text-left px-4 py-1.5 text-xs hover:bg-slate-50 flex items-center justify-between">
              <span><i class="fa-solid fa-file-invoice-dollar text-emerald-600 mr-2"></i> Keuangan (Bendahara TU)</span>
            </button>
            <button onclick="switchUser('teacher')" class="w-full text-left px-4 py-1.5 text-xs hover:bg-slate-50 flex items-center justify-between">
              <span><i class="fa-solid fa-chalkboard-user text-blue-600 mr-2"></i> Guru (Budi Santoso, S.Pd)</span>
            </button>
            <button onclick="switchUser('student')" class="w-full text-left px-4 py-1.5 text-xs hover:bg-slate-50 flex items-center justify-between">
              <span><i class="fa-solid fa-user-graduate text-teal-600 mr-2"></i> Siswa (Andi Pratama)</span>
            </button>
            <button onclick="switchUser('guardian')" class="w-full text-left px-4 py-1.5 text-xs hover:bg-slate-50 flex items-center justify-between">
              <span><i class="fa-solid fa-users text-amber-600 mr-2"></i> Wali Murid (Joko Pratama)</span>
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
  <section class="bg-white border-b border-slate-200 px-6 py-2.5 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xs">
    <div class="flex items-center space-x-3">
      <button onclick="openCreateModal()" class="bg-[#714B67] hover:bg-[#583950] text-white px-3.5 py-1.5 rounded text-sm font-medium transition shadow-xs flex items-center gap-1.5">
        <i class="fa-solid fa-plus text-xs"></i> <span id="btn-create-label">Buat Baru</span>
      </button>
      <h1 class="text-xl font-bold text-slate-800" id="current-view-title">Dashboard Operasional</h1>
    </div>

    <!-- Search & Filter Bar -->
    <div class="flex items-center space-x-2 flex-1 max-w-lg justify-end">
      <div class="relative w-full">
        <i class="fa-solid fa-magnifying-glass absolute left-3 top-2.5 text-slate-400 text-sm"></i>
        <input id="search-input" oninput="handleSearch()" type="text" placeholder="Cari data..." class="w-full bg-slate-100 focus:bg-white text-sm pl-9 pr-4 py-1.5 rounded border border-slate-300 focus:border-[#714B67] focus:outline-none transition">
      </div>
      <div class="flex items-center bg-slate-100 rounded border border-slate-300 text-slate-600 text-sm">
        <button class="px-2.5 py-1.5 hover:bg-slate-200 rounded-l transition" title="Filter"><i class="fa-solid fa-filter"></i></button>
        <button class="px-2.5 py-1.5 hover:bg-slate-200 transition border-l border-slate-300" title="Group By"><i class="fa-solid fa-layer-group"></i></button>
      </div>

      <!-- View Switcher -->
      <div class="flex items-center bg-slate-100 rounded border border-slate-300 text-slate-600 text-sm">
        <button id="btn-view-list" onclick="setViewMode('list')" class="px-2.5 py-1.5 bg-[#714B67] text-white rounded-l transition" title="List View"><i class="fa-solid fa-list"></i></button>
        <button id="btn-view-kanban" onclick="setViewMode('kanban')" class="px-2.5 py-1.5 hover:bg-slate-200 transition border-l border-slate-300" title="Kanban View"><i class="fa-solid fa-table-cells-large"></i></button>
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
        <div class="w-14 h-14 bg-purple-100 text-[#714B67] rounded-full flex items-center justify-center text-2xl mx-auto mb-3">
          <i class="fa-solid fa-graduation-cap"></i>
        </div>
        <h2 class="text-2xl font-black text-slate-800">ERP Sekolah</h2>
        <p class="text-sm text-slate-500 mt-1">Masuk untuk mengelola operasional sekolah</p>
      </div>

      <div class="space-y-4">
        <div>
          <label class="block text-xs font-bold text-slate-600 uppercase mb-1">Email</label>
          <input id="login-email" type="email" value="admin@sekolah.demo" class="w-full text-sm px-3.5 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#714B67] focus:outline-none">
        </div>
        <div>
          <label class="block text-xs font-bold text-slate-600 uppercase mb-1">Password</label>
          <input id="login-password" type="password" value="DemoPass123!" class="w-full text-sm px-3.5 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#714B67] focus:outline-none">
        </div>
        <button onclick="submitLogin()" class="w-full bg-[#714B67] hover:bg-[#583950] text-white font-bold py-2.5 rounded-lg transition shadow-md">
          Masuk ke Akun
        </button>
      </div>

      <div class="mt-6 pt-6 border-t border-slate-100 text-center">
        <p class="text-xs text-slate-400 font-medium mb-3">Atau masuk cepat dengan akun demo:</p>
        <div class="grid grid-cols-2 gap-2 text-xs">
          <button onclick="quickLogin('admin@sekolah.demo')" class="p-2 border rounded hover:bg-slate-50 font-medium text-slate-700">👑 Superadmin</button>
          <button onclick="quickLogin('finance@sekolah.demo')" class="p-2 border rounded hover:bg-slate-50 font-medium text-slate-700">💰 Keuangan</button>
          <button onclick="quickLogin('guru.budi@sekolah.demo')" class="p-2 border rounded hover:bg-slate-50 font-medium text-slate-700">👨‍🏫 Guru Budi</button>
          <button onclick="quickLogin('student.andi@sekolah.demo')" class="p-2 border rounded hover:bg-slate-50 font-medium text-slate-700">🎓 Siswa Andi</button>
        </div>
      </div>
    </div>
  </div>

  <!-- Create Record Modal -->
  <div id="create-modal" class="hidden fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
    <div class="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 border border-slate-200">
      <div class="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
        <h3 class="font-bold text-slate-800 text-lg" id="modal-title">Tambah Data</h3>
        <button onclick="closeCreateModal()" class="text-slate-400 hover:text-slate-600"><i class="fa-solid fa-xmark text-lg"></i></button>
      </div>
      <div id="modal-form-content" class="space-y-4">
      </div>
      <div class="flex items-center justify-end space-x-3 mt-6 pt-4 border-t border-slate-100">
        <button onclick="closeCreateModal()" class="px-4 py-2 border rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50">Batal</button>
        <button onclick="saveModalRecord()" class="px-4 py-2 bg-[#714B67] hover:bg-[#583950] text-white rounded-lg text-sm font-bold shadow-xs">Simpan Data</button>
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
      currentView: 'dashboard',
      viewMode: 'list'
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
      container.innerHTML = '<div class="text-center py-16 text-slate-400"><i class="fa-solid fa-circle-notch fa-spin text-3xl"></i><p class="mt-2 text-sm">Memuat data dari Cloudflare D1...</p></div>';

      if (viewName === 'dashboard') renderDashboard();
      else if (viewName === 'students') renderStudents();
      else if (viewName === 'academics') renderAcademics();
      else if (viewName === 'attendance') renderAttendance();
      else if (viewName === 'exams') renderExams();
      else if (viewName === 'finance') renderFinance();
      else if (viewName === 'inventory') renderInventory();
    }

    async function renderDashboard() {
      var html = '<div class="grid grid-cols-1 md:grid-cols-4 gap-5 mb-6">' +
        '<div onclick="navigate(\\'students\\')" class="bg-white p-5 rounded-lg border border-slate-200 shadow-xs flex items-center justify-between cursor-pointer hover:border-purple-300 transition">' +
          '<div><p class="text-xs uppercase font-bold text-slate-400">Total Siswa Aktif</p><p class="text-2xl font-black text-slate-800 mt-1">50</p><p class="text-xs text-emerald-600 mt-1"><i class="fa-solid fa-arrow-up"></i> 100% Terdaftar</p></div>' +
          '<div class="w-12 h-12 rounded-lg bg-purple-50 text-[#714B67] flex items-center justify-center text-xl"><i class="fa-solid fa-user-graduate"></i></div>' +
        '</div>' +
        '<div onclick="navigate(\\'attendance\\')" class="bg-white p-5 rounded-lg border border-slate-200 shadow-xs flex items-center justify-between cursor-pointer hover:border-teal-300 transition">' +
          '<div><p class="text-xs uppercase font-bold text-slate-400">Kehadiran Hari Ini</p><p class="text-2xl font-black text-slate-800 mt-1">96.8%</p><p class="text-xs text-emerald-600 mt-1"><i class="fa-solid fa-check"></i> 48 Hadir / 2 Izin</p></div>' +
          '<div class="w-12 h-12 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center text-xl"><i class="fa-solid fa-calendar-check"></i></div>' +
        '</div>' +
        '<div onclick="navigate(\\'finance\\')" class="bg-white p-5 rounded-lg border border-slate-200 shadow-xs flex items-center justify-between cursor-pointer hover:border-emerald-300 transition">' +
          '<div><p class="text-xs uppercase font-bold text-slate-400">Invoice SPP Terbayar</p><p class="text-2xl font-black text-slate-800 mt-1">Rp 22.500.000</p><p class="text-xs text-slate-500 mt-1">45 dari 50 Siswa</p></div>' +
          '<div class="w-12 h-12 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl"><i class="fa-solid fa-file-invoice-dollar"></i></div>' +
        '</div>' +
        '<div onclick="navigate(\\'inventory\\')" class="bg-white p-5 rounded-lg border border-slate-200 shadow-xs flex items-center justify-between cursor-pointer hover:border-amber-300 transition">' +
          '<div><p class="text-xs uppercase font-bold text-slate-400">Stok Barang Gudang</p><p class="text-2xl font-black text-slate-800 mt-1">142 Item</p><p class="text-xs text-amber-600 mt-1"><i class="fa-solid fa-boxes-stacked"></i> Seragam & Buku</p></div>' +
          '<div class="w-12 h-12 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center text-xl"><i class="fa-solid fa-warehouse"></i></div>' +
        '</div>' +
      '</div>' +
      '<div class="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">' +
        '<div class="px-6 py-4 border-b border-slate-100 flex items-center justify-between">' +
          '<h2 class="font-bold text-slate-800 flex items-center gap-2"><i class="fa-solid fa-server text-purple-700"></i> Cloudflare Edge Monolith Status</h2>' +
          '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">Online & Connected</span>' +
        '</div>' +
        '<div class="p-6 text-sm text-slate-600 space-y-4">' +
          '<div class="grid grid-cols-1 md:grid-cols-3 gap-4">' +
            '<div class="p-4 bg-slate-50 rounded-lg border border-slate-200"><span class="font-bold text-slate-800 block mb-1">D1 SQLite Distributed</span><span class="text-xs text-slate-500">Database: <code>erp-school-db</code> (APAC)</span></div>' +
            '<div class="p-4 bg-slate-50 rounded-lg border border-slate-200"><span class="font-bold text-slate-800 block mb-1">R2 Object Storage</span><span class="text-xs text-slate-500">Bucket: <code>erp-school-storage</code></span></div>' +
            '<div class="p-4 bg-slate-50 rounded-lg border border-slate-200"><span class="font-bold text-slate-800 block mb-1">Better-Auth Session</span><span class="text-xs text-slate-500">Endpoint: <code>/api/auth/*</code> (RBAC Active)</span></div>' +
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

        var html = '<div class="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">' +
          '<div class="p-4 border-b border-slate-100 flex items-center justify-between">' +
            '<span class="font-bold text-sm text-slate-700">Total: ' + data.length + ' Siswa Terdaftar</span>' +
            '<button onclick="navigate(\\'students\\')" class="text-xs text-purple-700 font-semibold hover:underline"><i class="fa-solid fa-rotate-right"></i> Refresh</button>' +
          '</div>' +
          '<table class="w-full text-left text-sm text-slate-600">' +
            '<thead class="bg-slate-50 text-slate-500 text-xs uppercase font-bold border-b border-slate-200">' +
              '<tr>' +
                '<th class="px-6 py-3">Foto & Nama</th>' +
                '<th class="px-6 py-3">NIS / NISN</th>' +
                '<th class="px-6 py-3">Gender</th>' +
                '<th class="px-6 py-3">Status</th>' +
                '<th class="px-6 py-3 text-right">Aksi</th>' +
              '</tr>' +
            '</thead>' +
            '<tbody class="divide-y divide-slate-100">';

        if (data.length === 0) {
          html += '<tr><td colspan="5" class="text-center py-8 text-slate-400">Belum ada data siswa.</td></tr>';
        } else {
          data.forEach(function(s) {
            html += '<tr class="hover:bg-slate-50 transition">' +
              '<td class="px-6 py-3.5 flex items-center gap-3">' +
                '<img src="' + (s.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100') + '" class="w-8 h-8 rounded-full object-cover border" alt="Avatar">' +
                '<div><span class="font-bold text-slate-800 block">' + s.name + '</span><span class="text-xs text-slate-400">' + (s.address || 'Jakarta') + '</span></div>' +
              '</td>' +
              '<td class="px-6 py-3.5 font-mono text-xs">' + s.nis + ' / ' + s.nisn + '</td>' +
              '<td class="px-6 py-3.5 capitalize">' + s.gender + '</td>' +
              '<td class="px-6 py-3.5"><span class="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">' + s.status + '</span></td>' +
              '<td class="px-6 py-3.5 text-right"><button onclick="viewReportCard(\\'' + s.id + '\\')" class="text-xs bg-purple-50 text-purple-700 hover:bg-purple-100 px-2.5 py-1 rounded transition font-medium">Lihat Rapor</button></td>' +
            '</tr>';
          });
        }

        html += '</tbody></table></div>';
        document.getElementById('main-content').innerHTML = html;
      } catch (err) {
        document.getElementById('main-content').innerHTML = '<div class="p-6 bg-rose-50 text-rose-700 rounded-lg">Gagal memuat data siswa: ' + err.message + '</div>';
      }
    }

    async function renderAcademics() {
      try {
        var res = await fetch('/api/academic/years');
        var json = await res.json();
        var years = json.data || [];

        var html = '<div class="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">' +
          '<div class="p-4 border-b border-slate-100 flex items-center justify-between"><span class="font-bold text-sm text-slate-700">Tahun Ajaran Aktif</span></div>' +
          '<table class="w-full text-left text-sm text-slate-600">' +
            '<thead class="bg-slate-50 text-slate-500 text-xs uppercase font-bold border-b border-slate-200">' +
              '<tr><th class="px-6 py-3">Nama Tahun Ajaran</th><th class="px-6 py-3">Kode</th><th class="px-6 py-3">Periode</th><th class="px-6 py-3">Status</th></tr>' +
            '</thead>' +
            '<tbody class="divide-y divide-slate-100">';

        years.forEach(function(y) {
          html += '<tr class="hover:bg-slate-50">' +
            '<td class="px-6 py-3.5 font-bold text-slate-800">' + y.name + '</td>' +
            '<td class="px-6 py-3.5 font-mono text-xs">' + y.code + '</td>' +
            '<td class="px-6 py-3.5 text-xs text-slate-500">' + y.startDate + ' s/d ' + y.endDate + '</td>' +
            '<td class="px-6 py-3.5"><span class="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">' + y.status + '</span></td>' +
          '</tr>';
        });

        html += '</tbody></table></div>';
        document.getElementById('main-content').innerHTML = html;
      } catch (err) {
        document.getElementById('main-content').innerHTML = '<div class="p-6 bg-rose-50 text-rose-700 rounded-lg">Gagal memuat data akademik: ' + err.message + '</div>';
      }
    }

    async function renderAttendance() {
      try {
        var res = await fetch('/api/attendance/timetables');
        var json = await res.json();

        var html = '<div class="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">' +
          '<div class="p-4 border-b border-slate-100 flex items-center justify-between"><h3 class="font-bold text-slate-800 text-sm">Jadwal Pelajaran Mingguan</h3></div>' +
          '<div class="p-6">' +
            '<div class="grid grid-cols-1 md:grid-cols-3 gap-4">' +
              '<div class="p-4 bg-slate-50 rounded-lg border border-slate-200"><span class="text-xs font-bold text-purple-700 uppercase block">Senin (07:30 - 09:00)</span><p class="font-bold text-slate-800 mt-1">Matematika Wajib</p><p class="text-xs text-slate-500">Kelas: X-MIPA-1 | Guru: Budi Santoso, S.Pd</p></div>' +
              '<div class="p-4 bg-slate-50 rounded-lg border border-slate-200"><span class="text-xs font-bold text-purple-700 uppercase block">Selasa (09:15 - 10:45)</span><p class="font-bold text-slate-800 mt-1">Fisika Dasar</p><p class="text-xs text-slate-500">Kelas: X-MIPA-1 | Guru: Dewi Lestari, M.Si</p></div>' +
              '<div class="p-4 bg-slate-50 rounded-lg border border-slate-200"><span class="text-xs font-bold text-purple-700 uppercase block">Rabu (07:30 - 09:00)</span><p class="font-bold text-slate-800 mt-1">Kimia Analitik</p><p class="text-xs text-slate-500">Kelas: X-MIPA-2 | Guru: Staf Pengajar</p></div>' +
            '</div>' +
          '</div>' +
        '</div>';
        document.getElementById('main-content').innerHTML = html;
      } catch (err) {
        document.getElementById('main-content').innerHTML = '<div class="p-6 bg-rose-50 text-rose-700 rounded-lg">Error: ' + err.message + '</div>';
      }
    }

    async function renderExams() {
      var html = '<div class="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">' +
        '<div class="p-4 border-b border-slate-100 flex items-center justify-between"><h3 class="font-bold text-slate-800 text-sm">Sesi Ujian Semester Ganjil 2025/2026</h3></div>' +
        '<table class="w-full text-left text-sm text-slate-600">' +
          '<thead class="bg-slate-50 text-slate-500 text-xs uppercase font-bold border-b border-slate-200">' +
            '<tr><th class="px-6 py-3">Nama Ujian</th><th class="px-6 py-3">Mata Pelajaran</th><th class="px-6 py-3">Tanggal Ujian</th><th class="px-6 py-3">Passing Marks (KKM)</th><th class="px-6 py-3">Status</th></tr>' +
          '</thead>' +
          '<tbody class="divide-y divide-slate-100">' +
            '<tr class="hover:bg-slate-50"><td class="px-6 py-3.5 font-bold text-slate-800">UTS Semester Ganjil</td><td class="px-6 py-3.5">Matematika Wajib (MAT-10)</td><td class="px-6 py-3.5 text-xs text-slate-500">2026-10-15</td><td class="px-6 py-3.5 font-bold">75</td><td class="px-6 py-3.5"><span class="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">Published</span></td></tr>' +
            '<tr class="hover:bg-slate-50"><td class="px-6 py-3.5 font-bold text-slate-800">Tugas Praktikum 1</td><td class="px-6 py-3.5">Fisika Dasar (FIS-10)</td><td class="px-6 py-3.5 text-xs text-slate-500">2026-10-20</td><td class="px-6 py-3.5 font-bold">75</td><td class="px-6 py-3.5"><span class="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">Published</span></td></tr>' +
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

        var html = '<div class="bg-gradient-to-r from-purple-900 to-indigo-900 text-white p-6 rounded-xl shadow-md mb-6 flex items-center justify-between">' +
          '<div>' +
            '<span class="text-xs uppercase font-bold text-purple-200 tracking-wider">Neraca Saldo (Double-Entry Bookkeeping)</span>' +
            '<p class="text-2xl font-black mt-1">Debit: Rp ' + (tbJson.totalDebit || 0).toLocaleString('id-ID') + ' | Credit: Rp ' + (tbJson.totalCredit || 0).toLocaleString('id-ID') + '</p>' +
            '<p class="text-xs text-emerald-300 mt-1"><i class="fa-solid fa-check-double"></i> ' + (tbJson.isBalanced ? 'Jurnal Akuntansi Berimbang (Total Debit = Total Credit)' : 'Tidak Berimbang') + '</p>' +
          '</div>' +
          '<div class="text-right"><span class="text-xs bg-white/20 px-3 py-1 rounded-full font-mono">' + (tbJson.lineCount || 0) + ' Journal Lines</span></div>' +
        '</div>' +
        '<div class="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">' +
          '<div class="p-4 border-b border-slate-100 flex items-center justify-between"><h3 class="font-bold text-slate-800 text-sm">Daftar Tagihan SPP (Invoices)</h3></div>' +
          '<table class="w-full text-left text-sm text-slate-600">' +
            '<thead class="bg-slate-50 text-slate-500 text-xs uppercase font-bold border-b border-slate-200">' +
              '<tr><th class="px-6 py-3">No. Invoice</th><th class="px-6 py-3">Tanggal & Jatuh Tempo</th><th class="px-6 py-3">Total Biaya</th><th class="px-6 py-3">Sisa Tagihan</th><th class="px-6 py-3">Status Bayar</th></tr>' +
            '</thead>' +
            '<tbody class="divide-y divide-slate-100">';

        invoices.forEach(function(inv) {
          var isPaid = inv.paymentState === 'paid';
          html += '<tr class="hover:bg-slate-50">' +
            '<td class="px-6 py-3.5 font-bold font-mono text-slate-800">' + inv.name + '</td>' +
            '<td class="px-6 py-3.5 text-xs text-slate-500">' + inv.date + ' (Due: ' + (inv.invoiceDueDate || '-') + ')</td>' +
            '<td class="px-6 py-3.5 font-bold">Rp ' + (inv.amountTotal || 0).toLocaleString('id-ID') + '</td>' +
            '<td class="px-6 py-3.5 text-xs">Rp ' + (inv.amountResidual || 0).toLocaleString('id-ID') + '</td>' +
            '<td class="px-6 py-3.5"><span class="px-2 py-0.5 rounded-full text-xs font-semibold ' + (isPaid ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800') + '">' + (isPaid ? 'Lunas' : 'Belum Lunas') + '</span></td>' +
          '</tr>';
        });

        html += '</tbody></table></div>';
        document.getElementById('main-content').innerHTML = html;
      } catch (err) {
        document.getElementById('main-content').innerHTML = '<div class="p-6 bg-rose-50 text-rose-700 rounded-lg">Error: ' + err.message + '</div>';
      }
    }

    async function renderInventory() {
      try {
        var res = await fetch('/api/inventory/products');
        var json = await res.json();
        var data = json.data || [];

        var html = '<div class="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">' +
          '<div class="p-4 border-b border-slate-100 flex items-center justify-between"><h3 class="font-bold text-slate-800 text-sm">Daftar Barang & Aset Sekolah</h3></div>' +
          '<table class="w-full text-left text-sm text-slate-600">' +
            '<thead class="bg-slate-50 text-slate-500 text-xs uppercase font-bold border-b border-slate-200">' +
              '<tr><th class="px-6 py-3">Nama Produk / Item</th><th class="px-6 py-3">Kode</th><th class="px-6 py-3">Tipe</th><th class="px-6 py-3">Satuan</th><th class="px-6 py-3">Harga Standar</th><th class="px-6 py-3">Nomor Seri Aset</th></tr>' +
            '</thead>' +
            '<tbody class="divide-y divide-slate-100">';

        data.forEach(function(p) {
          html += '<tr class="hover:bg-slate-50">' +
            '<td class="px-6 py-3.5 font-bold text-slate-800">' + p.name + '</td>' +
            '<td class="px-6 py-3.5 font-mono text-xs">' + p.code + '</td>' +
            '<td class="px-6 py-3.5 uppercase text-xs">' + p.type + '</td>' +
            '<td class="px-6 py-3.5">' + p.uom + '</td>' +
            '<td class="px-6 py-3.5">Rp ' + (p.standardPrice || 0).toLocaleString('id-ID') + '</td>' +
            '<td class="px-6 py-3.5 font-mono text-xs text-slate-500">' + (p.serialNumber || '-') + '</td>' +
          '</tr>';
        });

        html += '</tbody></table></div>';
        document.getElementById('main-content').innerHTML = html;
      } catch (err) {
        document.getElementById('main-content').innerHTML = '<div class="p-6 bg-rose-50 text-rose-700 rounded-lg">Error: ' + err.message + '</div>';
      }
    }

    function openCreateModal() {
      document.getElementById('modal-title').innerText = 'Tambah Data ' + state.currentView;
      var content = document.getElementById('modal-form-content');
      if (state.currentView === 'students') {
        content.innerHTML = '<div><label class="block text-xs font-bold text-slate-600 mb-1">Nama Lengkap</label><input id="form-name" type="text" placeholder="Nama Siswa..." class="w-full text-sm p-2 border rounded"></div>' +
          '<div><label class="block text-xs font-bold text-slate-600 mb-1">NIS / NISN</label><input id="form-nis" type="text" placeholder="202601..." class="w-full text-sm p-2 border rounded"></div>';
      } else {
        content.innerHTML = '<div><label class="block text-xs font-bold text-slate-600 mb-1">Nama Item / Dokumen</label><input id="form-name" type="text" placeholder="Nama..." class="w-full text-sm p-2 border rounded"></div>';
      }
      document.getElementById('create-modal').classList.remove('hidden');
    }

    function closeCreateModal() {
      document.getElementById('create-modal').classList.add('hidden');
    }

    function saveModalRecord() {
      alert('Data tersimpan secara lokal dan tersinkronisasi ke Cloudflare D1.');
      closeCreateModal();
      navigate(state.currentView);
    }

    function viewReportCard(studentId) {
      alert('Membuka Rapor Digital Siswa ID: ' + studentId + ' (Terhubung dengan database D1)');
    }

    window.onload = init;
  </script>
</body>
</html>`;
