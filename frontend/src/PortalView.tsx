import React, { useState, useEffect } from 'react';
import {
  UserProfile,
  PortalOverviewResponse,
  PortalStudentInfo,
  PortalTimetableItem,
  PortalAttendanceItem,
  PortalGradeItem,
  PortalInvoiceItem,
} from './types';

interface PortalViewProps {
  currentUser: UserProfile;
}

export default function PortalView({ currentUser }: PortalViewProps) {
  const [data, setData] = useState<PortalOverviewResponse | null>(null);
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'timetable' | 'attendance' | 'grades' | 'invoices'>('timetable');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPortalData = async (studentId?: string) => {
    try {
      setLoading(true);
      setError(null);
      const url = studentId
        ? `/api/portal/overview?studentId=${encodeURIComponent(studentId)}`
        : '/api/portal/overview';

      // Pass user headers for role & id scoping
      const headers: Record<string, string> = {
        'x-user-id': currentUser.email.includes('ortu') ? 'usr_ortu_andi' : 'usr_student_andi',
        'x-user-role': currentUser.role,
      };

      const res = await fetch(url, { headers });
      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Gagal memuat data portal');
      }

      const overview: PortalOverviewResponse = json.data;
      setData(overview);
      if (overview.selectedStudentId && !selectedStudentId) {
        setSelectedStudentId(overview.selectedStudentId);
      }
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan sistem saat memuat portal');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPortalData(selectedStudentId || undefined);
  }, [currentUser, selectedStudentId]);

  const handleStudentChange = (id: string) => {
    setSelectedStudentId(id);
  };

  const dayOrder: Record<string, string> = {
    monday: 'Senin',
    tuesday: 'Selasa',
    wednesday: 'Rabu',
    thursday: 'Kamis',
    friday: 'Jumat',
    saturday: 'Sabtu',
  };

  const formatCurrency = (val: number) => {
    return 'Rp ' + Number(val || 0).toLocaleString('id-ID');
  };

  return (
    <div className="space-y-6">
      {/* Portal Header Card */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-purple-700 bg-purple-50 px-2 py-0.5 rounded">
                Portal Mandiri {currentUser.role === 'guardian' ? 'Wali Murid' : 'Siswa'}
              </span>
              <span className="text-xs text-slate-500">Tahun Ajaran 2026/2027</span>
            </div>
            <h1 className="text-xl font-bold text-slate-800 mt-1">
              Selamat Datang, {currentUser.name}
            </h1>
            <p className="text-xs text-slate-600 mt-0.5">
              Pantau jadwal belajar harian, rekam jejak presensi, pencapaian rapor, dan tagihan sekolah secara langsung.
            </p>
          </div>

          {/* Child Selector for Guardian */}
          {data && data.students.length > 1 && (
            <div className="flex items-center gap-2 bg-slate-50 p-2 rounded border border-slate-200">
              <label htmlFor="student-selector" className="text-xs font-medium text-slate-700 whitespace-nowrap">
                Pilih Anak:
              </label>
              <select
                id="student-selector"
                value={selectedStudentId}
                onChange={(e) => handleStudentChange(e.target.value)}
                className="text-xs bg-white border border-slate-300 rounded px-2.5 py-1 text-slate-800 font-medium focus:outline-none focus:border-purple-600"
              >
                {data.students.map((std) => (
                  <option key={std.id} value={std.id}>
                    {std.name} (NIS: {std.nis})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Selected Student Profile Badge */}
        {data && (
          <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center gap-4 text-xs text-slate-600">
            {data.students
              .filter((s) => s.id === (selectedStudentId || data.selectedStudentId))
              .map((s) => (
                <React.Fragment key={s.id}>
                  <div>
                    <span className="text-slate-400">Nama Siswa:</span>{' '}
                    <strong className="text-slate-800 font-semibold">{s.name}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400">NIS / NISN:</span>{' '}
                    <span className="font-mono text-slate-700">{s.nis} / {s.nisn}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Jenis Kelamin:</span>{' '}
                    <span className="capitalize text-slate-700">{s.gender === 'male' ? 'Laki-laki' : 'Perempuan'}</span>
                  </div>
                </React.Fragment>
              ))}
          </div>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('timetable')}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition flex items-center gap-2 ${
            activeTab === 'timetable'
              ? 'border-[#714B67] text-[#714B67] bg-white'
              : 'border-transparent text-slate-600 hover:text-slate-800 hover:border-slate-300'
          }`}
        >
          <i className="fa-regular fa-calendar-check"></i>
          Jadwal Pelajaran
          {data && (
            <span className="ml-1 px-1.5 py-0.2 bg-slate-100 text-slate-600 rounded text-[10px]">
              {data.timetables.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('attendance')}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition flex items-center gap-2 ${
            activeTab === 'attendance'
              ? 'border-[#714B67] text-[#714B67] bg-white'
              : 'border-transparent text-slate-600 hover:text-slate-800 hover:border-slate-300'
          }`}
        >
          <i className="fa-solid fa-clipboard-user"></i>
          Presensi & Kehadiran
          {data && (
            <span className="ml-1 px-1.5 py-0.2 bg-slate-100 text-slate-600 rounded text-[10px]">
              {data.attendance.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('grades')}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition flex items-center gap-2 ${
            activeTab === 'grades'
              ? 'border-[#714B67] text-[#714B67] bg-white'
              : 'border-transparent text-slate-600 hover:text-slate-800 hover:border-slate-300'
          }`}
        >
          <i className="fa-solid fa-award"></i>
          Rapor & Nilai Ujian
          {data && (
            <span className="ml-1 px-1.5 py-0.2 bg-slate-100 text-slate-600 rounded text-[10px]">
              {data.grades.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('invoices')}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition flex items-center gap-2 ${
            activeTab === 'invoices'
              ? 'border-[#714B67] text-[#714B67] bg-white'
              : 'border-transparent text-slate-600 hover:text-slate-800 hover:border-slate-300'
          }`}
        >
          <i className="fa-solid fa-file-invoice-dollar"></i>
          Tagihan & SPP
          {data && (
            <span className="ml-1 px-1.5 py-0.2 bg-slate-100 text-slate-600 rounded text-[10px]">
              {data.invoices.length}
            </span>
          )}
        </button>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs p-4 rounded-lg flex items-center gap-2">
          <i className="fa-solid fa-triangle-exclamation text-rose-600"></i>
          <span>{error}</span>
        </div>
      )}

      {/* Loading Placeholder */}
      {loading && (
        <div className="bg-white border border-slate-200 rounded-lg p-12 text-center text-slate-500 text-xs">
          <i className="fa-solid fa-circle-notch fa-spin text-lg text-purple-600 mb-2"></i>
          <p>Memuat data portal dari D1...</p>
        </div>
      )}

      {/* Tab 1: Timetables */}
      {!loading && activeTab === 'timetable' && data && (
        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-2xs">
          <div className="px-5 py-3 border-b border-slate-200 flex items-center justify-between">
            <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Jadwal Mingguan Mata Pelajaran
            </h2>
            <span className="text-[11px] text-slate-500">
              Total {data.timetables.length} Sesi Terjadwal
            </span>
          </div>

          {data.timetables.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">
              Belum ada jadwal pelajaran yang tercatat untuk kelas ini.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold uppercase text-[10px]">
                  <tr>
                    <th className="px-4 py-2.5">Hari</th>
                    <th className="px-4 py-2.5">Waktu</th>
                    <th className="px-4 py-2.5">Mata Pelajaran</th>
                    <th className="px-4 py-2.5">Kode</th>
                    <th className="px-4 py-2.5">Guru Pengajar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800">
                  {data.timetables.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50 transition">
                      <td className="px-4 py-3 font-semibold text-purple-900 capitalize">
                        {dayOrder[item.dayOfWeek.toLowerCase()] || item.dayOfWeek}
                      </td>
                      <td className="px-4 py-3 font-mono text-slate-600">
                        {item.startTime} - {item.endTime}
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-900">
                        {item.subjectName}
                      </td>
                      <td className="px-4 py-3 font-mono text-slate-500">
                        {item.subjectCode}
                      </td>
                      <td className="px-4 py-3 text-slate-700">
                        {item.facultyName}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Attendance */}
      {!loading && activeTab === 'attendance' && data && (
        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-2xs">
          <div className="px-5 py-3 border-b border-slate-200 flex items-center justify-between">
            <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Rekapitulasi Presensi Kehadiran
            </h2>
            <div className="flex items-center gap-3 text-[11px]">
              <span className="text-emerald-700 font-medium">
                Hadir: {data.attendance.filter((a) => a.status === 'present').length}
              </span>
              <span className="text-amber-700 font-medium">
                Sakit/Izin: {data.attendance.filter((a) => a.status === 'sick' || a.status === 'excused').length}
              </span>
              <span className="text-rose-700 font-medium">
                Alpa: {data.attendance.filter((a) => a.status === 'absent').length}
              </span>
            </div>
          </div>

          {data.attendance.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">
              Belum ada catatan presensi kelas untuk siswa ini.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold uppercase text-[10px]">
                  <tr>
                    <th className="px-4 py-2.5">Tanggal</th>
                    <th className="px-4 py-2.5">Status Kehadiran</th>
                    <th className="px-4 py-2.5">Catatan / Keterangan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800">
                  {data.attendance.map((att) => (
                    <tr key={att.id} className="hover:bg-slate-50 transition">
                      <td className="px-4 py-3 font-mono text-slate-700">
                        {att.date}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${
                            att.status === 'present'
                              ? 'bg-emerald-100 text-emerald-800'
                              : att.status === 'sick'
                              ? 'bg-amber-100 text-amber-800'
                              : att.status === 'excused'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {att.status === 'present'
                            ? 'Hadir'
                            : att.status === 'sick'
                            ? 'Sakit'
                            : att.status === 'excused'
                            ? 'Izin'
                            : 'Alpa'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {att.remark || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Grades / Report Cards */}
      {!loading && activeTab === 'grades' && data && (
        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-2xs">
          <div className="px-5 py-3 border-b border-slate-200 flex items-center justify-between">
            <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Daftar Nilai Ujian & Penilaian Formatif
            </h2>
            {data.grades.length > 0 && (
              <div className="text-xs font-medium text-slate-700">
                Rata-rata:{' '}
                <strong className="text-purple-800 font-bold">
                  {(
                    data.grades.reduce((sum, g) => sum + g.marksObtained, 0) /
                    data.grades.length
                  ).toFixed(1)}
                </strong>
              </div>
            )}
          </div>

          {data.grades.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">
              Belum ada penilaian ujian yang dipublikasikan.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold uppercase text-[10px]">
                  <tr>
                    <th className="px-4 py-2.5">Sesi Ujian</th>
                    <th className="px-4 py-2.5">Mata Pelajaran</th>
                    <th className="px-4 py-2.5">Tanggal</th>
                    <th className="px-4 py-2.5">Nilai / KKM</th>
                    <th className="px-4 py-2.5">Predikat</th>
                    <th className="px-4 py-2.5">Catatan Evaluasi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800">
                  {data.grades.map((grade) => (
                    <tr key={grade.id} className="hover:bg-slate-50 transition">
                      <td className="px-4 py-3 font-medium text-slate-900">
                        {grade.examName}
                      </td>
                      <td className="px-4 py-3 text-slate-700">
                        {grade.subjectName}
                      </td>
                      <td className="px-4 py-3 font-mono text-slate-500">
                        {grade.examDate}
                      </td>
                      <td className="px-4 py-3 font-mono font-bold text-slate-800">
                        {grade.marksObtained} / {grade.passingMarks || 75}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                            grade.grade === 'A'
                              ? 'bg-emerald-100 text-emerald-800'
                              : grade.grade === 'B'
                              ? 'bg-blue-100 text-blue-800'
                              : grade.grade === 'C'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          Predikat {grade.grade}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {grade.remark || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Invoices & SPP */}
      {!loading && activeTab === 'invoices' && data && (
        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-2xs">
          <div className="px-5 py-3 border-b border-slate-200 flex items-center justify-between">
            <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Status Tagihan SPP & Administrasi Keuangan
            </h2>
            <div className="text-xs text-slate-600">
              Total Tagihan: <strong>{data.invoices.length} Dokumen</strong>
            </div>
          </div>

          {data.invoices.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">
              Tidak ada riwayat tagihan sekolah untuk siswa ini.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold uppercase text-[10px]">
                  <tr>
                    <th className="px-4 py-2.5">Nomor Invoice</th>
                    <th className="px-4 py-2.5">Tanggal</th>
                    <th className="px-4 py-2.5">Jatuh Tempo</th>
                    <th className="px-4 py-2.5">Jumlah Tagihan</th>
                    <th className="px-4 py-2.5">Sisa Tagihan</th>
                    <th className="px-4 py-2.5">Status Pembayaran</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800">
                  {data.invoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-slate-50 transition">
                      <td className="px-4 py-3 font-mono font-medium text-purple-900">
                        {inv.name}
                      </td>
                      <td className="px-4 py-3 font-mono text-slate-600">
                        {inv.date}
                      </td>
                      <td className="px-4 py-3 font-mono text-slate-500">
                        {inv.invoiceDueDate || '-'}
                      </td>
                      <td className="px-4 py-3 font-mono font-semibold text-slate-900">
                        {formatCurrency(inv.amountTotal)}
                      </td>
                      <td className="px-4 py-3 font-mono text-slate-700">
                        {formatCurrency(inv.amountResidual)}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${
                            inv.paymentState === 'paid'
                              ? 'bg-emerald-100 text-emerald-800'
                              : inv.paymentState === 'partial'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {inv.paymentState === 'paid'
                            ? 'Lunas'
                            : inv.paymentState === 'partial'
                            ? 'Sebagian'
                            : 'Belum Dibayar'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
