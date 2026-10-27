import React, { useState } from 'react';
import { DEMO_USERS, UserProfile } from './types';

interface LoginViewProps {
  onLogin: (user: UserProfile) => void;
}

const PERSONA_DETAILS: Record<string, { label: string; badge: string; desc: string }> = {
  admin: {
    label: 'Kepala Sekolah / Admin',
    badge: 'Superadmin',
    desc: 'Akses penuh seluruh modul, konfigurasi akademik, dan otorisasi sistem'
  },
  finance: {
    label: 'Bendahara / Keuangan',
    badge: 'Finance',
    desc: 'Kelola penagihan SPP, jurnal pembayaran, dan laporan neraca saldo'
  },
  teacher: {
    label: 'Guru Pengajar',
    badge: 'Teacher',
    desc: 'Pencatatan presensi kelas dan penilaian sesi ujian siswa'
  },
  student: {
    label: 'Siswa',
    badge: 'Student',
    desc: 'Lihat jadwal pelajaran, status kehadiran, dan perolehan rapor'
  },
  guardian: {
    label: 'Orang Tua / Wali',
    badge: 'Guardian',
    desc: 'Pantau tagihan SPP putra/putri dan capaian hasil belajar'
  }
};

export default function LoginView({ onLogin }: LoginViewProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleManualLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      setError('Silakan masukkan alamat email');
      return;
    }
    if (!password) {
      setError('Silakan masukkan password');
      return;
    }

    // Check if email matches any demo persona
    const matchingKey = Object.keys(DEMO_USERS).find(
      (k) => DEMO_USERS[k].email.toLowerCase() === cleanEmail
    );

    if (matchingKey) {
      onLogin(DEMO_USERS[matchingKey]);
      return;
    }

    // Default fallback user profile if custom credentials entered
    const defaultName = cleanEmail.split('@')[0].replace(/[._-]/g, ' ');
    const formattedName = defaultName
      .split(' ')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');

    const customUser: UserProfile = {
      name: formattedName || 'Pengguna Terdaftar',
      role: 'staff',
      email: cleanEmail,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'
    };

    onLogin(customUser);
  };

  const handlePersonaSelect = (user: UserProfile) => {
    setEmail(user.email);
    setPassword('••••••••');
    setError(null);
    onLogin(user);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-between text-slate-800">
      {/* Top Brand Bar */}
      <header className="bg-[#714B67] text-white px-6 py-3.5 shadow-sm">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded bg-[#583950] flex items-center justify-center font-bold text-white border border-purple-300/30">
              <i className="fa-solid fa-graduation-cap text-base"></i>
            </div>
            <div>
              <span className="font-bold text-sm tracking-tight block leading-tight">SMA Harapan Bangsa</span>
              <span className="text-[11px] text-purple-200 block">Sistem Informasi & ERP Terpadu Sekolah</span>
            </div>
          </div>
          <div className="text-xs text-purple-100 hidden sm:flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>Tahun Ajaran 2026/2027 Aktif</span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-6xl w-full mx-auto px-4 py-8 md:py-12 flex-1 flex flex-col justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Login Form */}
          <section className="lg:col-span-5 bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-xs">
            <div className="mb-6">
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">Masuk ke Portal ERP</h1>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                Gunakan kredensial akun Anda atau pilih salah satu profil demo sekolah di panel sebelah kanan untuk akses instan.
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <i className="fa-solid fa-circle-exclamation shrink-0"></i>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleManualLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5" htmlFor="login-email">
                  Alamat Email
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                    <i className="fa-solid fa-envelope text-xs"></i>
                  </span>
                  <input
                    id="login-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama@sekolah.demo"
                    className="w-full text-xs pl-9 pr-3 py-2.5 rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-[#714B67] focus:border-[#714B67] text-slate-900 placeholder:text-slate-400"
                    autoComplete="email"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5" htmlFor="login-password">
                  Kata Sandi
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                    <i className="fa-solid fa-lock text-xs"></i>
                  </span>
                  <input
                    id="login-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full text-xs pl-9 pr-3 py-2.5 rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-[#714B67] focus:border-[#714B67] text-slate-900 placeholder:text-slate-400"
                    autoComplete="current-password"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full bg-[#714B67] hover:bg-[#583950] text-white text-xs font-semibold py-2.5 px-4 rounded-lg transition duration-150 ease-in-out shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                >
                  <i className="fa-solid fa-arrow-right-to-bracket"></i>
                  <span>Masuk ke Sistem</span>
                </button>
              </div>
            </form>

            <div className="mt-6 pt-5 border-t border-slate-200">
              <div className="flex items-center justify-between text-[11px] text-slate-600">
                <span>Memerlukan bantuan teknis?</span>
                <span className="font-semibold text-[#714B67]">Helpdesk IT Sekolah</span>
              </div>
            </div>
          </section>

          {/* Right Column: Demo Persona Cards */}
          <section className="lg:col-span-7 space-y-3">
            <div className="mb-2">
              <h2 className="text-base font-bold text-slate-900 tracking-tight">Akun Persona Demo (1-Click Login)</h2>
              <p className="text-xs text-slate-600 mt-0.5">
                Pilih peran di bawah ini untuk menguji hak akses dan tampilan fitur yang disesuaikan per departemen:
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {Object.entries(DEMO_USERS).map(([key, user]) => {
                const meta = PERSONA_DETAILS[key] || {
                  label: user.name,
                  badge: user.role,
                  desc: 'Akses sistem operasional'
                };

                return (
                  <div
                    key={key}
                    onClick={() => handlePersonaSelect(user)}
                    className="bg-white border border-slate-200 rounded-lg p-3.5 hover:border-[#714B67] hover:shadow-sm transition cursor-pointer flex flex-col justify-between text-left group"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center space-x-2.5">
                          <img
                            src={user.avatar}
                            alt={user.name}
                            className="w-9 h-9 rounded-full object-cover border border-slate-200 shrink-0"
                          />
                          <div>
                            <div className="text-xs font-bold text-slate-900 leading-tight group-hover:text-[#714B67] transition">
                              {user.name}
                            </div>
                            <div className="text-[11px] text-slate-600 leading-tight mt-0.5">
                              {user.email}
                            </div>
                          </div>
                        </div>
                        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200 shrink-0">
                          {meta.badge}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 line-clamp-2 mt-2 leading-relaxed">
                        {meta.desc}
                      </p>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
                      <span className="font-semibold text-slate-700">{meta.label}</span>
                      <span className="inline-flex items-center text-[#714B67] font-semibold gap-1 group-hover:translate-x-0.5 transition-transform">
                        Masuk <i className="fa-solid fa-chevron-right text-[9px]"></i>
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 px-6 text-center text-xs text-slate-600">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>SMA Harapan Bangsa &copy; 2026. Seluruh hak cipta dilindungi undang-undang.</span>
          <span className="text-slate-500 text-[11px]">Sistem Terdistribusi Berbasis Cloudflare D1 + React</span>
        </div>
      </footer>
    </div>
  );
}
