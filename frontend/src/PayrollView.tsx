import React, { useState, useEffect } from 'react';
import type { Employee, SalaryStructure, Payslip, PayslipBatchRun } from './types';

interface PayrollViewProps {
  schoolId?: string;
}

export function PayrollView({ schoolId = 'school_sma_hb' }: PayrollViewProps) {
  const [activeTab, setActiveTab] = useState<'employees' | 'contracts' | 'batches'>('employees');
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [structures, setStructures] = useState<SalaryStructure[]>([]);
  const [batches, setBatches] = useState<PayslipBatchRun[]>([]);
  const [payslips, setPayslips] = useState<Payslip[]>([]);
  const [loading, setLoading] = useState(false);

  // Modals
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [employeeFormData, setEmployeeFormData] = useState<Partial<Employee>>({
    name: '',
    nip: '',
    email: '',
    phone: '',
    type: 'faculty',
    department: 'Kurikulum',
    jobTitle: '',
    bankName: 'BCA',
    bankAccountNumber: '',
    status: 'active',
  });

  const [showContractModal, setShowContractModal] = useState(false);
  const [contractFormData, setContractFormData] = useState<Partial<SalaryStructure>>({
    employeeId: '',
    baseSalary: 4500000,
    hourlyTeachingRate: 75000,
    fixedAllowance: 500000,
    fixedDeduction: 150000,
  });

  const [showBatchModal, setShowBatchModal] = useState(false);
  const [batchMonth, setBatchMonth] = useState(new Date().getMonth() + 1);
  const [batchYear, setBatchYear] = useState(new Date().getFullYear());
  const [selectedSlipForPrint, setSelectedSlipForPrint] = useState<Payslip | null>(null);

  const fetchPayrollData = async () => {
    setLoading(true);
    try {
      const [empRes, strRes, batchRes, slipRes] = await Promise.all([
        fetch(`/api/payroll/employees?schoolId=${schoolId}`),
        fetch(`/api/payroll/structures?schoolId=${schoolId}`),
        fetch(`/api/payroll/batches?schoolId=${schoolId}`),
        fetch(`/api/payroll/payslips?schoolId=${schoolId}`),
      ]);
      const empJson = await empRes.json();
      const strJson = await strRes.json();
      const batchJson = await batchRes.json();
      const slipJson = await slipRes.json();

      setEmployees(empJson.data || []);
      setStructures(strJson.data || []);
      setBatches(batchJson.data || []);
      setPayslips(slipJson.data || []);
    } catch (err: any) {
      console.error('Failed to load payroll data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayrollData();
  }, [schoolId]);

  const handleSaveEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = employeeFormData.id
        ? `/api/payroll/employees/${employeeFormData.id}`
        : '/api/payroll/employees';
      const method = employeeFormData.id ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...employeeFormData, schoolId }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Gagal menyimpan pegawai');
      }
      setShowEmployeeModal(false);
      fetchPayrollData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleSaveContract = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/payroll/structures', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...contractFormData, schoolId }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Gagal menyimpan aturan gaji');
      }
      setShowContractModal(false);
      fetchPayrollData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleGenerateBatch = async () => {
    try {
      const res = await fetch('/api/payroll/batches/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          schoolId,
          month: Number(batchMonth),
          year: Number(batchYear),
          name: `Penggajian Pegawai ${batchMonth}/${batchYear}`,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Gagal generate batch');
      }
      setShowBatchModal(false);
      fetchPayrollData();
      alert('Draft batch penggajian berhasil dibuat!');
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleConfirmBatch = async (batchId: string) => {
    if (!confirm('Posting pengeluaran beban gaji ke jurnal buku besar (Debit: Beban Gaji, Credit: Kas)?')) {
      return;
    }
    try {
      const res = await fetch('/api/payroll/batches/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          schoolId,
          batchRunId: batchId,
          expenseAccountId: 'coa_exp_salary',
          paymentAccountId: 'coa_cash',
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Gagal konfirmasi batch');
      }
      fetchPayrollData();
      alert('Batch penggajian berhasil dikonfirmasi dan dibukukan ke jurnal umum!');
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Sub Tabs */}
      <div className="flex border-b border-slate-200 gap-4">
        <button
          onClick={() => setActiveTab('employees')}
          className={`pb-2 text-xs font-semibold cursor-pointer ${
            activeTab === 'employees'
              ? 'border-b-2 border-[#714B67] text-[#714B67]'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Daftar Guru & Karyawan
        </button>
        <button
          onClick={() => setActiveTab('contracts')}
          className={`pb-2 text-xs font-semibold cursor-pointer ${
            activeTab === 'contracts'
              ? 'border-b-2 border-[#714B67] text-[#714B67]'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Struktur & Tarif Gaji (Contracts)
        </button>
        <button
          onClick={() => setActiveTab('batches')}
          className={`pb-2 text-xs font-semibold cursor-pointer ${
            activeTab === 'batches'
              ? 'border-b-2 border-[#714B67] text-[#714B67]'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Slip Gaji & Batch Run (Payroll Runs)
        </button>
      </div>

      {/* Tab 1: Employees */}
      {activeTab === 'employees' && (
        <div className="bg-white rounded border border-slate-200 overflow-hidden">
          <div className="p-3.5 border-b border-slate-200 font-bold text-slate-800 text-xs flex justify-between items-center">
            <span>Daftar Guru & Karyawan Sekolah ({employees.length})</span>
            <button
              onClick={() => {
                setEmployeeFormData({
                  name: '',
                  nip: '',
                  email: '',
                  phone: '',
                  type: 'faculty',
                  department: 'Kurikulum',
                  jobTitle: '',
                  bankName: 'BCA',
                  bankAccountNumber: '',
                  status: 'active',
                });
                setShowEmployeeModal(true);
              }}
              className="bg-[#714B67] hover:bg-[#583950] text-white px-3 py-1 rounded text-xs font-semibold cursor-pointer"
            >
              + Tambah Pegawai
            </button>
          </div>

          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-600 uppercase font-semibold border-b border-slate-200">
              <tr>
                <th className="px-5 py-2.5">NIP</th>
                <th className="px-5 py-2.5">Nama Pegawai</th>
                <th className="px-5 py-2.5">Kategori</th>
                <th className="px-5 py-2.5">Jabatan / Bagian</th>
                <th className="px-5 py-2.5">Rekening Bank</th>
                <th className="px-5 py-2.5">Status</th>
                <th className="px-5 py-2.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {employees.map((emp) => (
                <tr key={emp.id} className="hover:bg-slate-50">
                  <td className="px-5 py-3 font-mono font-bold text-slate-800">{emp.nip}</td>
                  <td className="px-5 py-3 font-medium">
                    <div>{emp.name}</div>
                    <div className="text-[11px] text-slate-400">{emp.email}</div>
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-semibold uppercase ${
                        emp.type === 'faculty'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {emp.type === 'faculty' ? 'Tenaga Pendidik' : 'Staf TU/Admin'}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <div>{emp.jobTitle}</div>
                    <div className="text-[11px] text-slate-400">{emp.department || '-'}</div>
                  </td>
                  <td className="px-5 py-3 font-mono">
                    {emp.bankName ? `${emp.bankName} - ${emp.bankAccountNumber}` : '-'}
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                        emp.status === 'active'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {emp.status === 'active' ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <button
                      onClick={() => {
                        setEmployeeFormData(emp);
                        setShowEmployeeModal(true);
                      }}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded font-medium cursor-pointer"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 2: Salary Contracts */}
      {activeTab === 'contracts' && (
        <div className="bg-white rounded border border-slate-200 overflow-hidden">
          <div className="p-3.5 border-b border-slate-200 font-bold text-slate-800 text-xs flex justify-between items-center">
            <span>Aturan Kontrak & Komponen Gaji Pegawai</span>
            <button
              onClick={() => {
                setContractFormData({
                  employeeId: employees[0]?.id || '',
                  baseSalary: 4500000,
                  hourlyTeachingRate: 75000,
                  fixedAllowance: 500000,
                  fixedDeduction: 150000,
                });
                setShowContractModal(true);
              }}
              className="bg-[#714B67] hover:bg-[#583950] text-white px-3 py-1 rounded text-xs font-semibold cursor-pointer"
            >
              + Tetapkan Aturan Gaji
            </button>
          </div>

          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-600 uppercase font-semibold border-b border-slate-200">
              <tr>
                <th className="px-5 py-2.5">Pegawai</th>
                <th className="px-5 py-2.5">Gaji Pokok</th>
                <th className="px-5 py-2.5">Honor / Sesi Mengajar</th>
                <th className="px-5 py-2.5">Tunjangan Tetap</th>
                <th className="px-5 py-2.5">Potongan Rutin</th>
                <th className="px-5 py-2.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {structures.map((str) => (
                <tr key={str.id} className="hover:bg-slate-50">
                  <td className="px-5 py-3">
                    <div className="font-bold text-slate-800">{str.employeeName || str.employeeId}</div>
                    <div className="text-[11px] font-mono text-slate-400">{str.employeeNip} - {str.jobTitle}</div>
                  </td>
                  <td className="px-5 py-3 font-mono">Rp {str.baseSalary.toLocaleString('id-ID')}</td>
                  <td className="px-5 py-3 font-mono text-[#714B67] font-semibold">
                    {str.hourlyTeachingRate > 0 ? `Rp ${str.hourlyTeachingRate.toLocaleString('id-ID')} / sesi` : '-'}
                  </td>
                  <td className="px-5 py-3 font-mono text-emerald-700">
                    +Rp {str.fixedAllowance.toLocaleString('id-ID')}
                  </td>
                  <td className="px-5 py-3 font-mono text-rose-700">
                    -Rp {str.fixedDeduction.toLocaleString('id-ID')}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <button
                      onClick={() => {
                        setContractFormData(str);
                        setShowContractModal(true);
                      }}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded font-medium cursor-pointer"
                    >
                      Ubah Tarif
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 3: Payslips & Batch Runs */}
      {activeTab === 'batches' && (
        <div className="space-y-6">
          <div className="bg-white rounded border border-slate-200 overflow-hidden">
            <div className="p-3.5 border-b border-slate-200 font-bold text-slate-800 text-xs flex justify-between items-center">
              <span>Riwayat Batch Penggajian (hr.payslip.run)</span>
              <button
                onClick={() => setShowBatchModal(true)}
                className="bg-[#714B67] hover:bg-[#583950] text-white px-3 py-1 rounded text-xs font-semibold cursor-pointer"
              >
                + Buat Penggajian Bulanan Massal
              </button>
            </div>

            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-600 uppercase font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-5 py-2.5">Nama Batch</th>
                  <th className="px-5 py-2.5">Periode</th>
                  <th className="px-5 py-2.5">Jumlah Pegawai</th>
                  <th className="px-5 py-2.5">Total Pengeluaran Gaji</th>
                  <th className="px-5 py-2.5">Status Posting</th>
                  <th className="px-5 py-2.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {batches.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50">
                    <td className="px-5 py-3 font-bold text-slate-800">{b.name}</td>
                    <td className="px-5 py-3 font-mono">{b.periodMonth}/{b.periodYear}</td>
                    <td className="px-5 py-3">{b.totalEmployees} Orang</td>
                    <td className="px-5 py-3 font-mono font-bold text-slate-800">
                      Rp {b.totalAmount.toLocaleString('id-ID')}
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                          b.status === 'confirmed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {b.status === 'confirmed' ? 'Terkonfirmasi & Terjurnal' : 'Draft Perhitungan'}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      {b.status === 'draft' && (
                        <button
                          onClick={() => handleConfirmBatch(b.id)}
                          className="bg-emerald-700 hover:bg-emerald-800 text-white px-2.5 py-1 rounded font-medium cursor-pointer"
                        >
                          Confirm & Post to Ledger
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bg-white rounded border border-slate-200 overflow-hidden">
            <div className="p-3.5 border-b border-slate-200 font-bold text-slate-800 text-xs">
              Daftar Slip Gaji Individual (hr.payslip)
            </div>

            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-600 uppercase font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-5 py-2.5">Pegawai</th>
                  <th className="px-5 py-2.5">Periode</th>
                  <th className="px-5 py-2.5">Gaji Pokok</th>
                  <th className="px-5 py-2.5">Sesi Ajar (Presensi)</th>
                  <th className="px-5 py-2.5">Honor Mengajar</th>
                  <th className="px-5 py-2.5">Tunjangan/Potongan</th>
                  <th className="px-5 py-2.5">Take-Home Pay (Net)</th>
                  <th className="px-5 py-2.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {payslips.map((ps) => (
                  <tr key={ps.id} className="hover:bg-slate-50">
                    <td className="px-5 py-3">
                      <div className="font-bold text-slate-800">{ps.employeeName || ps.employeeId}</div>
                      <div className="text-[11px] font-mono text-slate-400">{ps.employeeNip}</div>
                    </td>
                    <td className="px-5 py-3 font-mono">{ps.periodMonth}/{ps.periodYear}</td>
                    <td className="px-5 py-3 font-mono">Rp {ps.baseSalary.toLocaleString('id-ID')}</td>
                    <td className="px-5 py-3 font-mono">{ps.teachingSessionsCount} Sesi Hadir</td>
                    <td className="px-5 py-3 font-mono text-[#714B67] font-semibold">
                      Rp {ps.teachingHonorAmount.toLocaleString('id-ID')}
                    </td>
                    <td className="px-5 py-3 text-[11px]">
                      <span className="text-emerald-700">+Rp {ps.allowanceAmount.toLocaleString('id-ID')}</span> /{' '}
                      <span className="text-rose-700">-Rp {ps.deductionAmount.toLocaleString('id-ID')}</span>
                    </td>
                    <td className="px-5 py-3 font-mono font-bold text-emerald-800">
                      Rp {ps.netSalary.toLocaleString('id-ID')}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <button
                        onClick={() => setSelectedSlipForPrint(ps)}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded font-medium cursor-pointer"
                      >
                        Lihat Slip
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Employee Modal */}
      {showEmployeeModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 border border-slate-200">
            <h3 className="font-bold text-slate-800 text-base mb-1">
              {employeeFormData.id ? 'Edit Data Pegawai' : 'Tambah Guru & Karyawan Baru'}
            </h3>
            <p className="text-xs text-slate-500 mb-4">Master data personil tenaga pendidik & kependidikan</p>

            <form onSubmit={handleSaveEmployee} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">NIP (Nomor Induk Pegawai) *</label>
                  <input
                    type="text"
                    required
                    value={employeeFormData.nip || ''}
                    onChange={(e) => setEmployeeFormData({ ...employeeFormData, nip: e.target.value })}
                    className="w-full p-2 border rounded font-mono font-bold"
                    placeholder="198501012010011001"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Kategori Pegawai *</label>
                  <select
                    value={employeeFormData.type || 'faculty'}
                    onChange={(e) => setEmployeeFormData({ ...employeeFormData, type: e.target.value as any })}
                    className="w-full p-2 border rounded bg-white"
                  >
                    <option value="faculty">Guru / Tenaga Pendidik</option>
                    <option value="staff">Staf Tata Usaha / Karyawan</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama Lengkap & Gelar *</label>
                <input
                  type="text"
                  required
                  value={employeeFormData.name || ''}
                  onChange={(e) => setEmployeeFormData({ ...employeeFormData, name: e.target.value })}
                  className="w-full p-2 border rounded font-medium"
                  placeholder="Drs. H. Ahmad Subarjo, M.Pd"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Email Resmi *</label>
                  <input
                    type="email"
                    required
                    value={employeeFormData.email || ''}
                    onChange={(e) => setEmployeeFormData({ ...employeeFormData, email: e.target.value })}
                    className="w-full p-2 border rounded"
                    placeholder="ahmad@sekolah.id"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nomor Telepon / WhatsApp</label>
                  <input
                    type="text"
                    value={employeeFormData.phone || ''}
                    onChange={(e) => setEmployeeFormData({ ...employeeFormData, phone: e.target.value })}
                    className="w-full p-2 border rounded"
                    placeholder="081234567890"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Jabatan Fungsional *</label>
                  <input
                    type="text"
                    required
                    value={employeeFormData.jobTitle || ''}
                    onChange={(e) => setEmployeeFormData({ ...employeeFormData, jobTitle: e.target.value })}
                    className="w-full p-2 border rounded"
                    placeholder="Guru Fisika & Wali Kelas"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Departemen / Bidang</label>
                  <input
                    type="text"
                    value={employeeFormData.department || ''}
                    onChange={(e) => setEmployeeFormData({ ...employeeFormData, department: e.target.value })}
                    className="w-full p-2 border rounded"
                    placeholder="Bidang Kurikulum"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nama Bank Pencairan</label>
                  <input
                    type="text"
                    value={employeeFormData.bankName || ''}
                    onChange={(e) => setEmployeeFormData({ ...employeeFormData, bankName: e.target.value })}
                    className="w-full p-2 border rounded"
                    placeholder="BCA / BRI / BSI"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nomor Rekening</label>
                  <input
                    type="text"
                    value={employeeFormData.bankAccountNumber || ''}
                    onChange={(e) => setEmployeeFormData({ ...employeeFormData, bankAccountNumber: e.target.value })}
                    className="w-full p-2 border rounded font-mono"
                    placeholder="8820192819"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowEmployeeModal(false)}
                  className="px-3 py-1.5 border rounded cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 bg-[#714B67] hover:bg-[#583950] text-white rounded font-semibold cursor-pointer"
                >
                  Simpan Pegawai
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Contract / Salary Structure Modal */}
      {showContractModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 border border-slate-200">
            <h3 className="font-bold text-slate-800 text-base mb-1">Pengaturan Kontrak & Tarif Gaji</h3>
            <p className="text-xs text-slate-500 mb-4">Menetapkan komponen gaji bulanan dan tarif mengajar</p>

            <form onSubmit={handleSaveContract} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Pilih Pegawai *</label>
                <select
                  required
                  value={contractFormData.employeeId || ''}
                  onChange={(e) => setContractFormData({ ...contractFormData, employeeId: e.target.value })}
                  className="w-full p-2 border rounded bg-white"
                >
                  <option value="" disabled>-- Pilih Pegawai --</option>
                  {employees.map((e) => (
                    <option key={e.id} value={e.id}>{e.name} ({e.nip})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Gaji Pokok Bulanan (Rp) *</label>
                <input
                  type="number"
                  min="0"
                  step="50000"
                  required
                  value={contractFormData.baseSalary || 0}
                  onChange={(e) => setContractFormData({ ...contractFormData, baseSalary: Number(e.target.value) })}
                  className="w-full p-2 border rounded font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Honor Per Sesi Mengajar (Rp)</label>
                <input
                  type="number"
                  min="0"
                  step="5000"
                  value={contractFormData.hourlyTeachingRate || 0}
                  onChange={(e) => setContractFormData({ ...contractFormData, hourlyTeachingRate: Number(e.target.value) })}
                  className="w-full p-2 border rounded font-mono"
                  placeholder="0 jika pegawai non-guru"
                />
                <span className="text-[11px] text-slate-400">Dikalikan kehadiran mengajar dari absensi kelas</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tunjangan Tetap (Rp)</label>
                  <input
                    type="number"
                    min="0"
                    step="10000"
                    value={contractFormData.fixedAllowance || 0}
                    onChange={(e) => setContractFormData({ ...contractFormData, fixedAllowance: Number(e.target.value) })}
                    className="w-full p-2 border rounded font-mono text-emerald-700"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Potongan Rutin (Rp)</label>
                  <input
                    type="number"
                    min="0"
                    step="10000"
                    value={contractFormData.fixedDeduction || 0}
                    onChange={(e) => setContractFormData({ ...contractFormData, fixedDeduction: Number(e.target.value) })}
                    className="w-full p-2 border rounded font-mono text-rose-700"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowContractModal(false)}
                  className="px-3 py-1.5 border rounded cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 bg-[#714B67] hover:bg-[#583950] text-white rounded font-semibold cursor-pointer"
                >
                  Simpan Kontrak
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Batch Run Generation Modal */}
      {showBatchModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 border border-slate-200">
            <h3 className="font-bold text-slate-800 text-base mb-1">Generate Penggajian Bulanan Massal</h3>
            <p className="text-xs text-slate-500 mb-4">
              Kalkulasi otomatis gaji seluruh pegawai aktif dan honor kehadiran mengajar
            </p>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Bulan Periode</label>
                  <select
                    value={batchMonth}
                    onChange={(e) => setBatchMonth(Number(e.target.value))}
                    className="w-full p-2 border rounded bg-white font-medium"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((m) => (
                      <option key={m} value={m}>Bulan {m}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tahun Periode</label>
                  <input
                    type="number"
                    value={batchYear}
                    onChange={(e) => setBatchYear(Number(e.target.value))}
                    className="w-full p-2 border rounded font-mono"
                  />
                </div>
              </div>

              <div className="p-3 bg-purple-50 rounded border border-purple-100 text-slate-700">
                <i className="fa-solid fa-circle-info text-[#714B67] mr-1"></i>
                Sistem akan membaca presensi kelas yang diajar setiap guru pada periode tersebut untuk menghitung honor mengajar secara presisi.
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowBatchModal(false)}
                  className="px-3 py-1.5 border rounded cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleGenerateBatch}
                  className="px-3.5 py-1.5 bg-[#714B67] hover:bg-[#583950] text-white rounded font-semibold cursor-pointer"
                >
                  Generate Batch Sekarang
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Slip Gaji Printable View Modal */}
      {selectedSlipForPrint && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 border border-slate-200">
            <div className="flex justify-between items-center pb-3 border-b mb-4">
              <div>
                <h3 className="font-bold text-slate-800 text-base">SLIP GAJI PEGAWAI</h3>
                <p className="text-xs text-slate-500">Periode: {selectedSlipForPrint.periodMonth}/{selectedSlipForPrint.periodYear}</p>
              </div>
              <button onClick={() => setSelectedSlipForPrint(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="bg-slate-50 p-3 rounded border border-slate-100 flex justify-between">
                <div>
                  <div className="font-bold text-slate-800 text-sm">{selectedSlipForPrint.employeeName}</div>
                  <div className="text-slate-500 font-mono">NIP: {selectedSlipForPrint.employeeNip}</div>
                </div>
                <div className="text-right">
                  <span className={`px-2 py-0.5 rounded text-[11px] font-semibold uppercase ${
                    selectedSlipForPrint.status === 'confirmed' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {selectedSlipForPrint.status === 'confirmed' ? 'Dibayarkan' : 'Draft'}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="font-bold text-slate-700 border-b pb-1">Rincian Penghasilan:</div>
                <div className="flex justify-between py-1 border-b border-dashed border-slate-200">
                  <span>Gaji Pokok</span>
                  <span className="font-mono">Rp {selectedSlipForPrint.baseSalary.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-dashed border-slate-200">
                  <span>Honor Sesi Mengajar ({selectedSlipForPrint.teachingSessionsCount} Sesi Presensi)</span>
                  <span className="font-mono text-[#714B67] font-semibold">
                    Rp {selectedSlipForPrint.teachingHonorAmount.toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-dashed border-slate-200">
                  <span>Tunjangan Tetap</span>
                  <span className="font-mono text-emerald-700">
                    +Rp {selectedSlipForPrint.allowanceAmount.toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-dashed border-slate-200">
                  <span>Potongan Rutin / BPJS</span>
                  <span className="font-mono text-rose-700">
                    -Rp {selectedSlipForPrint.deductionAmount.toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="flex justify-between pt-2 font-bold text-sm text-slate-800">
                  <span>Gaji Bersih Diterima (Take-Home Pay)</span>
                  <span className="font-mono text-emerald-800 font-bold">
                    Rp {selectedSlipForPrint.netSalary.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-between pt-4 border-t mt-4">
              <button
                onClick={() => window.print()}
                className="px-3 py-1.5 bg-[#714B67] hover:bg-[#583950] text-white rounded font-medium text-xs cursor-pointer"
              >
                <i className="fa-solid fa-print mr-1"></i> Cetak Dokumen Slip
              </button>
              <button
                onClick={() => setSelectedSlipForPrint(null)}
                className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 rounded font-medium text-xs cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
