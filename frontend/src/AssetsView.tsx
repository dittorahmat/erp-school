import React, { useState, useEffect } from 'react';
import type { FixedAsset, AssetDepreciationLine } from './types';

interface AssetsViewProps {
  schoolId?: string;
}

export function AssetsView({ schoolId = 'school_sma_hb' }: AssetsViewProps) {
  const [activeTab, setActiveTab] = useState<'assets' | 'schedule' | 'runs'>('assets');
  const [assets, setAssets] = useState<FixedAsset[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<FixedAsset | null>(null);
  const [depreciationLines, setDepreciationLines] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Modals
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [registerFormData, setRegisterFormData] = useState({
    name: '',
    code: '',
    category: 'equipment',
    purchaseDate: new Date().toISOString().split('T')[0],
    purchaseValue: 12000000,
    salvageValue: 0,
    durationMonths: 24,
    notes: '',
  });

  const [showPostModal, setShowPostModal] = useState(false);
  const [postCutoffDate, setPostCutoffDate] = useState(new Date().toISOString().split('T')[0]);
  const [postingStatus, setPostingStatus] = useState<string | null>(null);

  const fetchAssetsData = async () => {
    setLoading(true);
    try {
      const [assetsRes, linesRes] = await Promise.all([
        fetch(`/api/assets?schoolId=${schoolId}`),
        fetch(`/api/assets/depreciation/lines?schoolId=${schoolId}`),
      ]);
      const assetsJson = await assetsRes.json();
      const linesJson = await linesRes.json();

      setAssets(assetsJson.data || []);
      setDepreciationLines(linesJson.data || []);
    } catch (err: any) {
      console.error('Failed to load asset data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssetsData();
  }, [schoolId]);

  const loadAssetDetails = async (assetId: string) => {
    try {
      const res = await fetch(`/api/assets/${assetId}`);
      if (res.ok) {
        const json = await res.json();
        setSelectedAsset(json.data);
      }
    } catch (err: any) {
      console.error('Failed to load asset schedule:', err);
    }
  };

  const handleRegisterAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/assets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...registerFormData,
          schoolId,
          purchaseValue: Number(registerFormData.purchaseValue),
          salvageValue: Number(registerFormData.salvageValue || 0),
          durationMonths: Number(registerFormData.durationMonths),
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Gagal mendaftarkan aset');
      }

      setShowRegisterModal(false);
      setRegisterFormData({
        name: '',
        code: '',
        category: 'equipment',
        purchaseDate: new Date().toISOString().split('T')[0],
        purchaseValue: 12000000,
        salvageValue: 0,
        durationMonths: 24,
        notes: '',
      });
      await fetchAssetsData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleExecuteDepreciationRun = async () => {
    setLoading(true);
    setPostingStatus('Memposting jurnal depresiasi ke buku besar...');
    try {
      const res = await fetch('/api/assets/depreciation/post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          schoolId,
          cutoffDate: postCutoffDate,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Gagal mengeksekusi depresiasi');
      }

      const json = await res.json();
      setPostingStatus(
        `Sukses! Memposting ${json.data.postedCount} baris depresiasi dengan total Rp ${Number(
          json.data.totalAmount || 0
        ).toLocaleString('id-ID')}.`
      );
      await fetchAssetsData();
      if (selectedAsset) {
        await loadAssetDetails(selectedAsset.id);
      }
      setTimeout(() => {
        setShowPostModal(false);
        setPostingStatus(null);
      }, 1800);
    } catch (err: any) {
      alert(err.message);
      setPostingStatus(null);
    } finally {
      setLoading(false);
    }
  };

  // Metrics summary
  const totalAssetValue = assets.reduce((sum, a) => sum + (a.purchaseValue || 0), 0);
  const totalDepreciatedValue = depreciationLines
    .filter((l) => l.line?.status === 'posted')
    .reduce((sum, l) => sum + (l.line?.amount || 0), 0);
  const netBookValue = Math.max(0, totalAssetValue - totalDepreciatedValue);

  const filteredAssets = assets.filter((a) => {
    const matchSearch =
      a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCategory = categoryFilter === 'all' || a.category === categoryFilter;
    return matchSearch && matchCategory;
  });

  return (
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-stone-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-stone-900">Manajemen Aset Tetap</h1>
          <p className="text-sm text-stone-500 mt-1">
            Pencatatan inventaris aset sekolah, jadwal penyusutan garis lurus (straight-line), dan posting massal jurnal depresiasi.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowPostModal(true)}
            className="inline-flex items-center gap-2 rounded-lg border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-700 shadow-sm hover:bg-stone-50 transition"
          >
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Posting Depresiasi Bulanan
          </button>
          <button
            type="button"
            onClick={() => setShowRegisterModal(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-emerald-700 transition"
          >
            + Daftarkan Aset Baru
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-wider text-stone-500">Total Nilai Perolehan</div>
          <div className="mt-2 text-2xl font-bold text-stone-900">
            Rp {totalAssetValue.toLocaleString('id-ID')}
          </div>
          <div className="mt-1 text-xs text-stone-500">{assets.length} item aset fisik terdaftar</div>
        </div>

        <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-wider text-stone-500">Akumulasi Penyusutan</div>
          <div className="mt-2 text-2xl font-bold text-amber-600">
            Rp {totalDepreciatedValue.toLocaleString('id-ID')}
          </div>
          <div className="mt-1 text-xs text-stone-500">Tercatat di akun kontra-aset Buku Besar</div>
        </div>

        <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-wider text-stone-500">Nilai Buku Bersih (NBV)</div>
          <div className="mt-2 text-2xl font-bold text-emerald-700">
            Rp {netBookValue.toLocaleString('id-ID')}
          </div>
          <div className="mt-1 text-xs text-stone-500">Total nilai buku saat ini setelah penyusutan</div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-stone-200 text-sm font-medium text-stone-600">
        <button
          type="button"
          onClick={() => setActiveTab('assets')}
          className={`px-4 py-2.5 border-b-2 font-medium transition ${
            activeTab === 'assets'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent hover:text-stone-900 hover:border-stone-300'
          }`}
        >
          Daftar Aset ({assets.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('schedule')}
          className={`px-4 py-2.5 border-b-2 font-medium transition ${
            activeTab === 'schedule'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent hover:text-stone-900 hover:border-stone-300'
          }`}
        >
          Tabel Jadwal Angsuran
        </button>
      </div>

      {/* TAB 1: Assets List */}
      {activeTab === 'assets' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <input
                type="text"
                placeholder="Cari kode atau nama aset..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:w-72 rounded-lg border border-stone-300 px-3.5 py-2 text-sm focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
              />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none"
              >
                <option value="all">Semua Kategori</option>
                <option value="equipment">Peralatan (Equipment)</option>
                <option value="electronic">Elektronik & Lab</option>
                <option value="vehicle">Kendaraan Operasional</option>
                <option value="building">Gedung / Bangunan</option>
              </select>
            </div>
            <div className="text-xs text-stone-500">
              Menampilkan {filteredAssets.length} dari {assets.length} aset
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm">
            <table className="min-w-full divide-y divide-stone-200 text-left text-sm">
              <thead className="bg-stone-50 text-xs font-semibold uppercase tracking-wider text-stone-500">
                <tr>
                  <th className="px-5 py-3">Kode</th>
                  <th className="px-5 py-3">Nama Aset</th>
                  <th className="px-5 py-3">Kategori</th>
                  <th className="px-5 py-3">Tgl Perolehan</th>
                  <th className="px-5 py-3 text-right">Harga Perolehan</th>
                  <th className="px-5 py-3 text-right">Masa Manfaat</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 font-normal text-stone-700">
                {filteredAssets.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-5 py-8 text-center text-stone-400">
                      Belum ada aset terdaftar. Klik "+ Daftarkan Aset Baru" untuk menambahkan.
                    </td>
                  </tr>
                ) : (
                  filteredAssets.map((asset) => (
                    <tr key={asset.id} className="hover:bg-stone-50/70 transition">
                      <td className="px-5 py-3.5 font-mono text-xs font-medium text-stone-900">{asset.code}</td>
                      <td className="px-5 py-3.5 font-semibold text-stone-900">{asset.name}</td>
                      <td className="px-5 py-3.5 capitalize text-stone-600">{asset.category}</td>
                      <td className="px-5 py-3.5 text-stone-600">{asset.purchaseDate}</td>
                      <td className="px-5 py-3.5 text-right font-medium text-stone-900">
                        Rp {asset.purchaseValue.toLocaleString('id-ID')}
                      </td>
                      <td className="px-5 py-3.5 text-right text-stone-600">{asset.durationMonths} bln</td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            asset.status === 'running'
                              ? 'bg-emerald-50 text-emerald-700'
                              : asset.status === 'depreciated'
                              ? 'bg-stone-100 text-stone-700'
                              : 'bg-amber-50 text-amber-700'
                          }`}
                        >
                          {asset.status}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <button
                          type="button"
                          onClick={() => {
                            loadAssetDetails(asset.id);
                            setActiveTab('schedule');
                          }}
                          className="text-xs font-medium text-emerald-600 hover:text-emerald-800"
                        >
                          Lihat Jadwal →
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: Schedule & Depreciation Board */}
      {activeTab === 'schedule' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <label className="text-xs font-semibold text-stone-600">Pilih Aset:</label>
              <select
                value={selectedAsset?.id || ''}
                onChange={(e) => {
                  if (e.target.value) {
                    loadAssetDetails(e.target.value);
                  } else {
                    setSelectedAsset(null);
                  }
                }}
                className="rounded-lg border border-stone-300 px-3 py-1.5 text-sm focus:border-emerald-600 focus:outline-none"
              >
                <option value="">-- Tampilkan Seluruh Jadwal Angsuran --</option>
                {assets.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.code} - {a.name}
                  </option>
                ))}
              </select>
            </div>
            {selectedAsset && (
              <div className="text-xs text-stone-600">
                Masa: <strong>{selectedAsset.durationMonths} Bulan</strong> | Residu:{' '}
                <strong>Rp {selectedAsset.salvageValue.toLocaleString('id-ID')}</strong> | Nilai Susut:{' '}
                <strong>Rp {selectedAsset.depreciableValue.toLocaleString('id-ID')}</strong>
              </div>
            )}
          </div>

          <div className="overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm">
            <table className="min-w-full divide-y divide-stone-200 text-left text-sm">
              <thead className="bg-stone-50 text-xs font-semibold uppercase tracking-wider text-stone-500">
                <tr>
                  <th className="px-5 py-3">Periode</th>
                  <th className="px-5 py-3">Kode Aset</th>
                  <th className="px-5 py-3">Nama Aset</th>
                  <th className="px-5 py-3">Tanggal Susut</th>
                  <th className="px-5 py-3 text-right">Angsuran Beban</th>
                  <th className="px-5 py-3 text-right">Akumulasi Susut</th>
                  <th className="px-5 py-3 text-right">Nilai Buku Tersisa</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Jurnal Entry</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 font-normal text-stone-700">
                {selectedAsset && selectedAsset.lines ? (
                  selectedAsset.lines.map((line) => (
                    <tr key={line.id} className="hover:bg-stone-50/70 transition">
                      <td className="px-5 py-3 font-mono text-xs">#{line.sequence}</td>
                      <td className="px-5 py-3 font-mono text-xs font-medium text-stone-900">{selectedAsset.code}</td>
                      <td className="px-5 py-3 font-medium text-stone-900">{selectedAsset.name}</td>
                      <td className="px-5 py-3 text-stone-600">{line.depreciationDate}</td>
                      <td className="px-5 py-3 text-right font-medium text-stone-900">
                        Rp {line.amount.toLocaleString('id-ID')}
                      </td>
                      <td className="px-5 py-3 text-right text-stone-600">
                        Rp {line.accumulatedAmount.toLocaleString('id-ID')}
                      </td>
                      <td className="px-5 py-3 text-right font-medium text-emerald-700">
                        Rp {line.remainingValue.toLocaleString('id-ID')}
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                            line.status === 'posted'
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-stone-100 text-stone-600'
                          }`}
                        >
                          {line.status}
                        </span>
                      </td>
                      <td className="px-5 py-3 font-mono text-xs text-stone-500">
                        {line.moveId || '—'}
                      </td>
                    </tr>
                  ))
                ) : depreciationLines.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-5 py-8 text-center text-stone-400">
                      Tidak ada data jadwal penyusutan.
                    </td>
                  </tr>
                ) : (
                  depreciationLines.map((item: any) => {
                    const line = item.line;
                    return (
                      <tr key={line.id} className="hover:bg-stone-50/70 transition">
                        <td className="px-5 py-3 font-mono text-xs">#{line.sequence}</td>
                        <td className="px-5 py-3 font-mono text-xs font-medium text-stone-900">{item.assetCode}</td>
                        <td className="px-5 py-3 font-medium text-stone-900">{item.assetName}</td>
                        <td className="px-5 py-3 text-stone-600">{line.depreciationDate}</td>
                        <td className="px-5 py-3 text-right font-medium text-stone-900">
                          Rp {line.amount.toLocaleString('id-ID')}
                        </td>
                        <td className="px-5 py-3 text-right text-stone-600">
                          Rp {line.accumulatedAmount.toLocaleString('id-ID')}
                        </td>
                        <td className="px-5 py-3 text-right font-medium text-emerald-700">
                          Rp {line.remainingValue.toLocaleString('id-ID')}
                        </td>
                        <td className="px-5 py-3">
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                              line.status === 'posted'
                                ? 'bg-emerald-50 text-emerald-700'
                                : 'bg-stone-100 text-stone-600'
                            }`}
                          >
                            {line.status}
                          </span>
                        </td>
                        <td className="px-5 py-3 font-mono text-xs text-stone-500">
                          {line.moveId || '—'}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL 1: Register New Fixed Asset */}
      {showRegisterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl border border-stone-200">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h2 className="text-lg font-bold text-stone-900">Daftarkan Aset Tetap Baru</h2>
              <button
                type="button"
                onClick={() => setShowRegisterModal(false)}
                className="text-stone-400 hover:text-stone-600 text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRegisterAsset} className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700">Kode Inventaris / Aset *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. AST-LAB-001"
                    value={registerFormData.code}
                    onChange={(e) => setRegisterFormData({ ...registerFormData, code: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-1.5 text-sm focus:border-emerald-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700">Kategori Aset</label>
                  <select
                    value={registerFormData.category}
                    onChange={(e) => setRegisterFormData({ ...registerFormData, category: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-1.5 text-sm focus:border-emerald-600 focus:outline-none"
                  >
                    <option value="equipment">Peralatan (Equipment)</option>
                    <option value="electronic">Elektronik & Lab Komputer</option>
                    <option value="vehicle">Kendaraan Operasional</option>
                    <option value="building">Bangunan / Gedung</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700">Nama Aset Tetap *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Laptop ASUS ExpertBook Core i7 Lab 1"
                  value={registerFormData.name}
                  onChange={(e) => setRegisterFormData({ ...registerFormData, name: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-1.5 text-sm focus:border-emerald-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700">Tanggal Perolehan *</label>
                  <input
                    type="date"
                    required
                    value={registerFormData.purchaseDate}
                    onChange={(e) => setRegisterFormData({ ...registerFormData, purchaseDate: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-1.5 text-sm focus:border-emerald-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700">Masa Manfaat (Bulan) *</label>
                  <input
                    type="number"
                    min="1"
                    max="600"
                    required
                    value={registerFormData.durationMonths}
                    onChange={(e) =>
                      setRegisterFormData({ ...registerFormData, durationMonths: Number(e.target.value) })
                    }
                    className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-1.5 text-sm focus:border-emerald-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700">Harga Perolehan (Rp) *</label>
                  <input
                    type="number"
                    min="1000"
                    required
                    value={registerFormData.purchaseValue}
                    onChange={(e) =>
                      setRegisterFormData({ ...registerFormData, purchaseValue: Number(e.target.value) })
                    }
                    className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-1.5 text-sm focus:border-emerald-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700">Nilai Residu / Sisa (Rp)</label>
                  <input
                    type="number"
                    min="0"
                    value={registerFormData.salvageValue}
                    onChange={(e) =>
                      setRegisterFormData({ ...registerFormData, salvageValue: Number(e.target.value) })
                    }
                    className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-1.5 text-sm focus:border-emerald-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700">Catatan / Lokasi Penempatan</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Ditempatkan di Ruang Server Lantai 2"
                  value={registerFormData.notes}
                  onChange={(e) => setRegisterFormData({ ...registerFormData, notes: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-1.5 text-sm focus:border-emerald-600 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setShowRegisterModal(false)}
                  className="rounded-lg border border-stone-300 px-4 py-2 text-xs font-medium text-stone-700 hover:bg-stone-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow hover:bg-emerald-700"
                >
                  Simpan & Buat Jadwal Depresiasi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Post Monthly Depreciation Run */}
      {showPostModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-stone-200">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h2 className="text-lg font-bold text-stone-900">Posting Depresiasi Bulanan</h2>
              <button
                type="button"
                onClick={() => setShowPostModal(false)}
                className="text-stone-400 hover:text-stone-600 text-sm"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <p className="text-xs text-stone-600 leading-relaxed">
                Sistem akan membukukan jurnal umum secara atomik ke Buku Besar untuk seluruh angsuran depresiasi yang jatuh tempo hingga batas tanggal yang dipilih.
              </p>

              <div>
                <label className="block text-xs font-semibold text-stone-700">Tanggal Cutoff Depresiasi *</label>
                <input
                  type="date"
                  value={postCutoffDate}
                  onChange={(e) => setPostCutoffDate(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-1.5 text-sm focus:border-emerald-600 focus:outline-none"
                />
              </div>

              <div className="rounded-lg bg-stone-50 p-3 text-xs text-stone-600 space-y-1">
                <div className="font-semibold text-stone-700">Aturan Jurnal Otomatis:</div>
                <div>• Debit: <strong>Beban Penyusutan Aset Tetap</strong></div>
                <div>• Credit: <strong>Akumulasi Penyusutan Aset</strong></div>
                <div className="text-emerald-700 pt-1 font-medium">✓ Dijamin berimbang debit = credit.</div>
              </div>

              {postingStatus && (
                <div className="rounded-lg bg-emerald-50 p-3 text-xs font-medium text-emerald-800">
                  {postingStatus}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setShowPostModal(false)}
                  className="rounded-lg border border-stone-300 px-4 py-2 text-xs font-medium text-stone-700 hover:bg-stone-50"
                >
                  Tutup
                </button>
                <button
                  type="button"
                  disabled={loading}
                  onClick={handleExecuteDepreciationRun}
                  className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow hover:bg-emerald-700 disabled:opacity-50"
                >
                  {loading ? 'Memproses...' : 'Eksekusi Posting Jurnal'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
