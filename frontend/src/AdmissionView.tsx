import React, { useState, useEffect } from 'react';
import { AdmissionRegister, AdmissionApplication } from './types';

export default function AdmissionView() {
  const [registers, setRegisters] = useState<AdmissionRegister[]>([]);
  const [activeAcademicYearId, setActiveAcademicYearId] = useState<string>('');
  const [selectedRegisterId, setSelectedRegisterId] = useState<string>('');
  const [applications, setApplications] = useState<AdmissionApplication[]>([]);
  const [loading, setLoading] = useState(false);
  const [showNewRegisterModal, setShowNewRegisterModal] = useState(false);
  const [showNewAppModal, setShowNewAppModal] = useState(false);
  const [showAdmitModal, setShowAdmitModal] = useState(false);
  const [targetApplicant, setTargetApplicant] = useState<AdmissionApplication | null>(null);

  // New Register Form State
  const [regName, setRegName] = useState('');
  const [regStartDate, setRegStartDate] = useState('');
  const [regEndDate, setRegEndDate] = useState('');
  const [regAdmissionFee, setRegAdmissionFee] = useState('2500000');

  // New Applicant Form State
  const [appName, setAppName] = useState('');
  const [appGender, setAppGender] = useState<'male' | 'female'>('male');
  const [appEmail, setAppEmail] = useState('');
  const [appPhone, setAppPhone] = useState('');
  const [appGuardianName, setAppGuardianName] = useState('');
  const [appGuardianPhone, setAppGuardianPhone] = useState('');
  const [appPrevSchool, setAppPrevSchool] = useState('');

  // Admit Form State
  const [admitNis, setAdmitNis] = useState('');
  const [admitNisn, setAdmitNisn] = useState('');

  const fetchRegisters = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admission/registers?schoolId=sch_01');
      const json = await res.json();
      const list: AdmissionRegister[] = json.data || [];
      const ayRes = await fetch('/api/academic/academic-years?schoolId=sch_01');
      const ayJson = await ayRes.json();
      const activeAy = (ayJson.data || []).find((ay: any) => ay.status === 'active') || ayJson.data?.[0];
      if (activeAy) setActiveAcademicYearId(activeAy.id);
      setRegisters(list);
      if (list.length > 0 && !selectedRegisterId) {
        setSelectedRegisterId(list[0].id);
      }
    } catch (err: any) {
      console.error('Error fetching registers:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchApplications = async (registerId: string) => {
    if (!registerId) return;
    try {
      setLoading(true);
      const res = await fetch(`/api/admission/applications?registerId=${registerId}`);
      const json = await res.json();
      setApplications(json.data || []);
    } catch (err: any) {
      console.error('Error fetching applications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegisters();
  }, []);

  useEffect(() => {
    if (selectedRegisterId) {
      fetchApplications(selectedRegisterId);
    }
  }, [selectedRegisterId]);

  const handleCreateRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admission/registers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          schoolId: 'sch_01',
          academicYearId: activeAcademicYearId || registers[0]?.academicYearId || '',
          name: regName,
          startDate: regStartDate,
          endDate: regEndDate,
          admissionFee: Number(regAdmissionFee)
        })
      });
      if (res.ok) {
        setShowNewRegisterModal(false);
        setRegName('');
        fetchRegisters();
      }
    } catch (err: any) {
      alert('Gagal membuat gelombang PPDB: ' + err.message);
    }
  };

  const handleCreateApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admission/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          registerId: selectedRegisterId,
          schoolId: 'sch_01',
          name: appName,
          gender: appGender,
          email: appEmail,
          phone: appPhone,
          guardianName: appGuardianName,
          guardianPhone: appGuardianPhone,
          prevSchool: appPrevSchool
        })
      });
      if (res.ok) {
        setShowNewAppModal(false);
        setAppName('');
        setAppEmail('');
        setAppPhone('');
        fetchApplications(selectedRegisterId);
      }
    } catch (err: any) {
      alert('Gagal mendaftarkan calon siswa: ' + err.message);
    }
  };

  const handleStatusChange = async (appId: string, status: 'verified' | 'approved' | 'rejected') => {
    try {
      const res = await fetch(`/api/admission/applications/${appId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        fetchApplications(selectedRegisterId);
      }
    } catch (err: any) {
      alert('Gagal update status: ' + err.message);
    }
  };

  const handleAdmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetApplicant) return;
    try {
      const res = await fetch(`/api/admission/applications/${targetApplicant.id}/admit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          schoolId: 'sch_01',
          classroomId: 'cls_10_mipa_1',
          academicYearId: activeAcademicYearId || registers[0]?.academicYearId || '',
          nis: admitNis,
          nisn: admitNisn
        })
      });
      if (res.ok) {
        alert('Calon siswa berhasil diterima! Data Siswa, Kelas & Invoice Uang Pangkal otomatis dibuat.');
        setShowAdmitModal(false);
        setTargetApplicant(null);
        fetchApplications(selectedRegisterId);
      } else {
        const errJson = await res.json();
        alert('Gagal menerima siswa: ' + (errJson.error || 'Terjadi kesalahan'));
      }
    } catch (err: any) {
      alert('Error admit: ' + err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 rounded border border-slate-200">
        <div className="flex items-center gap-3">
          <label className="text-xs font-bold text-slate-700">Gelombang PPDB:</label>
          <select
            value={selectedRegisterId}
            onChange={(e) => setSelectedRegisterId(e.target.value)}
            className="text-xs border border-slate-300 rounded px-3 py-1.5 font-medium text-slate-800 focus:outline-hidden"
          >
            {registers.length === 0 ? (
              <option value="">Belum ada gelombang aktif</option>
            ) : (
              registers.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name} ({r.status.toUpperCase()})
                </option>
              ))
            )}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowNewRegisterModal(true)}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded text-xs font-semibold transition"
          >
            + Buka Gelombang Baru
          </button>
          <button
            onClick={() => setShowNewAppModal(true)}
            disabled={!selectedRegisterId}
            className="bg-[#714B67] hover:bg-[#583950] disabled:opacity-50 text-white px-3 py-1.5 rounded text-xs font-semibold transition"
          >
            + Formulir Pendaftar Baru
          </button>
        </div>
      </div>

      {/* Applications Table */}
      <div className="bg-white rounded border border-slate-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-200 flex justify-between items-center">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Daftar Calon Siswa (PPDB)
          </h3>
          <span className="text-xs text-slate-500 font-medium">
            Total Pendaftar: {applications.length}
          </span>
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-400 text-xs">Memuat data pendaftar...</div>
        ) : applications.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            Belum ada pendaftar pada gelombang ini. Klik "+ Formulir Pendaftar Baru".
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold">
                <tr>
                  <th className="py-2.5 px-3">No. Registrasi</th>
                  <th className="py-2.5 px-3">Nama Calon Siswa</th>
                  <th className="py-2.5 px-3">Kontak & Wali</th>
                  <th className="py-2.5 px-3">Asal Sekolah</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Aksi Verifikasi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {applications.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-2.5 px-3 font-mono font-medium text-slate-800">
                      {app.applicationNumber}
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-slate-800">
                      {app.name}
                      <span className="block text-[10px] text-slate-400 font-normal">
                        {app.gender === 'male' ? 'Laki-laki' : 'Perempuan'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <div>{app.phone}</div>
                      <div className="text-[10px] text-slate-500">Wali: {app.guardianName} ({app.guardianPhone})</div>
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">{app.prevSchool || '-'}</td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${
                          app.status === 'enrolled'
                            ? 'bg-emerald-100 text-emerald-800'
                            : app.status === 'approved'
                            ? 'bg-blue-100 text-blue-800'
                            : app.status === 'verified'
                            ? 'bg-amber-100 text-amber-800'
                            : app.status === 'rejected'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {app.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right space-x-1.5">
                      {app.status === 'submitted' && (
                        <button
                          onClick={() => handleStatusChange(app.id, 'verified')}
                          className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-[11px]"
                        >
                          Verifikasi
                        </button>
                      )}
                      {app.status === 'verified' && (
                        <button
                          onClick={() => handleStatusChange(app.id, 'approved')}
                          className="px-2 py-1 rounded bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium text-[11px]"
                        >
                          Setujui (Approve)
                        </button>
                      )}
                      {app.status === 'approved' && (
                        <button
                          onClick={() => {
                            setTargetApplicant(app);
                            setAdmitNis(`2026${Math.floor(Math.random() * 9000 + 1000)}`);
                            setAdmitNisn(`008${Math.floor(Math.random() * 9000000 + 1000000)}`);
                            setShowAdmitModal(true);
                          }}
                          className="px-2.5 py-1 rounded bg-[#714B67] hover:bg-[#583950] text-white font-medium text-[11px]"
                        >
                          Terima Siswa (Enroll)
                        </button>
                      )}
                      {app.status === 'enrolled' && (
                        <span className="text-[11px] text-emerald-700 font-semibold">
                          ✓ Terdaftar
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Buka Gelombang Baru */}
      {showNewRegisterModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-5">
            <h3 className="font-bold text-slate-800 text-sm mb-4">Buka Gelombang PPDB Baru</h3>
            <form onSubmit={handleCreateRegister} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Nama Gelombang</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. PPDB Gelombang 1 TA 2026/2027"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  className="w-full text-xs border border-slate-300 rounded p-2 focus:outline-hidden"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Tanggal Mulai</label>
                  <input
                    type="date"
                    required
                    value={regStartDate}
                    onChange={(e) => setRegStartDate(e.target.value)}
                    className="w-full text-xs border border-slate-300 rounded p-2 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Tanggal Selesai</label>
                  <input
                    type="date"
                    required
                    value={regEndDate}
                    onChange={(e) => setRegEndDate(e.target.value)}
                    className="w-full text-xs border border-slate-300 rounded p-2 focus:outline-hidden"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Biaya Pangkal Masuk (Rp)</label>
                <input
                  type="number"
                  required
                  value={regAdmissionFee}
                  onChange={(e) => setRegAdmissionFee(e.target.value)}
                  className="w-full text-xs border border-slate-300 rounded p-2 focus:outline-hidden"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowNewRegisterModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 text-xs bg-[#714B67] hover:bg-[#583950] text-white rounded font-semibold"
                >
                  Simpan Gelombang
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Pendaftar Baru */}
      {showNewAppModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-5">
            <h3 className="font-bold text-slate-800 text-sm mb-4">Formulir Pendaftaran Calon Siswa Baru</h3>
            <form onSubmit={handleCreateApplication} className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Nama Lengkap</label>
                  <input
                    type="text"
                    required
                    placeholder="Nama calon siswa"
                    value={appName}
                    onChange={(e) => setAppName(e.target.value)}
                    className="w-full text-xs border border-slate-300 rounded p-2 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Jenis Kelamin</label>
                  <select
                    value={appGender}
                    onChange={(e: any) => setAppGender(e.target.value)}
                    className="w-full text-xs border border-slate-300 rounded p-2 focus:outline-hidden"
                  >
                    <option value="male">Laki-laki</option>
                    <option value="female">Perempuan</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Email</label>
                  <input
                    type="email"
                    required
                    placeholder="email@pendaftar.com"
                    value={appEmail}
                    onChange={(e) => setAppEmail(e.target.value)}
                    className="w-full text-xs border border-slate-300 rounded p-2 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Nomor HP</label>
                  <input
                    type="tel"
                    required
                    placeholder="08123456789"
                    value={appPhone}
                    onChange={(e) => setAppPhone(e.target.value)}
                    className="w-full text-xs border border-slate-300 rounded p-2 focus:outline-hidden"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Nama Orang Tua / Wali</label>
                  <input
                    type="text"
                    required
                    placeholder="Nama wali"
                    value={appGuardianName}
                    onChange={(e) => setAppGuardianName(e.target.value)}
                    className="w-full text-xs border border-slate-300 rounded p-2 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Nomor HP Wali</label>
                  <input
                    type="tel"
                    required
                    placeholder="08198765432"
                    value={appGuardianPhone}
                    onChange={(e) => setAppGuardianPhone(e.target.value)}
                    className="w-full text-xs border border-slate-300 rounded p-2 focus:outline-hidden"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Asal Sekolah Sebelumnya</label>
                <input
                  type="text"
                  placeholder="e.g. SMP Negeri 1 Jakarta"
                  value={appPrevSchool}
                  onChange={(e) => setAppPrevSchool(e.target.value)}
                  className="w-full text-xs border border-slate-300 rounded p-2 focus:outline-hidden"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowNewAppModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 text-xs bg-[#714B67] hover:bg-[#583950] text-white rounded font-semibold"
                >
                  Kirim Pendaftaran
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Penerimaan Siswa (Admit & Auto-Invoice) */}
      {showAdmitModal && targetApplicant && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-5">
            <h3 className="font-bold text-slate-800 text-sm mb-2">Penerimaan Siswa Baru</h3>
            <p className="text-xs text-slate-500 mb-4">
              Menerima <span className="font-semibold text-slate-700">{targetApplicant.name}</span> ke kelas aktif dan menerbitkan draft Invoice Uang Pangkal secara otomatis.
            </p>
            <form onSubmit={handleAdmit} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Nomor Induk Siswa (NIS)</label>
                <input
                  type="text"
                  required
                  value={admitNis}
                  onChange={(e) => setAdmitNis(e.target.value)}
                  className="w-full text-xs border border-slate-300 rounded p-2 focus:outline-hidden font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">NISN Nasional</label>
                <input
                  type="text"
                  required
                  value={admitNisn}
                  onChange={(e) => setAdmitNisn(e.target.value)}
                  className="w-full text-xs border border-slate-300 rounded p-2 focus:outline-hidden font-mono"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAdmitModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 text-xs bg-[#714B67] hover:bg-[#583950] text-white rounded font-semibold"
                >
                  Konfirmasi Penerimaan (Enroll)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
