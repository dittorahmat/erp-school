import React, { useState, useEffect } from 'react';
import { LibraryMedia, LibraryIssue, Student } from './types';

export default function LibraryView() {
  const [activeTab, setActiveTab] = useState<'catalog' | 'circulation'>('catalog');
  const [mediaList, setMediaList] = useState<LibraryMedia[]>([]);
  const [issuesList, setIssuesList] = useState<LibraryIssue[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [barcodeScanInput, setBarcodeScanInput] = useState('');

  // Modals
  const [showCatalogModal, setShowCatalogModal] = useState(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [targetIssue, setTargetIssue] = useState<LibraryIssue | null>(null);

  // Catalog Form State
  const [catName, setCatName] = useState('');
  const [catCode, setCatCode] = useState('');
  const [catAuthor, setCatAuthor] = useState('');
  const [catPublisher, setCatPublisher] = useState('');
  const [catIsbn, setCatIsbn] = useState('');
  const [catShelf, setCatShelf] = useState('');
  const [catBarcode, setCatBarcode] = useState('');
  const [catPrice, setCatPrice] = useState('75000');

  // Checkout Form State
  const [selectedMediaId, setSelectedMediaId] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [checkoutDueDays, setCheckoutDueDays] = useState('14');
  const [checkoutNotes, setCheckoutNotes] = useState('');

  // Return Form State
  const [returnCondition, setReturnCondition] = useState<'good' | 'damaged' | 'lost'>('good');
  const [damageCharge, setDamageCharge] = useState('0');
  const [returnNotes, setReturnNotes] = useState('');

  const showMsg = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const fetchMedia = async () => {
    try {
      setLoading(true);
      const url = searchQuery
        ? `/api/library/media?schoolId=sch_01&q=${encodeURIComponent(searchQuery)}`
        : `/api/library/media?schoolId=sch_01`;
      const res = await fetch(url);
      const json = await res.json();
      setMediaList(json.data || []);
    } catch (err: any) {
      console.error('Error fetching library media:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchIssues = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/library/issues?schoolId=sch_01');
      const json = await res.json();
      setIssuesList(json.data || []);
    } catch (err: any) {
      console.error('Error fetching library issues:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const res = await fetch('/api/students?schoolId=sch_01');
      const json = await res.json();
      setStudents(json.data || []);
    } catch (err: any) {
      console.error('Error fetching students:', err);
    }
  };

  useEffect(() => {
    fetchMedia();
    fetchIssues();
    fetchStudents();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchMedia();
  };

  const handleCreateMedia = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await fetch('/api/library/media', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          schoolId: 'sch_01',
          name: catName,
          code: catCode,
          author: catAuthor,
          publisher: catPublisher,
          isbn: catIsbn,
          shelfLocation: catShelf,
          barcode: catBarcode,
          listPrice: parseFloat(catPrice) || 0,
          standardPrice: parseFloat(catPrice) || 0
        })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to catalog book');
      showMsg('Buku berhasil ditambahkan ke katalog perpustakaan.');
      setShowCatalogModal(false);
      setCatName('');
      setCatCode('');
      setCatAuthor('');
      setCatPublisher('');
      setCatIsbn('');
      setCatShelf('');
      setCatBarcode('');
      fetchMedia();
    } catch (err: any) {
      showMsg(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMediaId || !selectedStudentId) {
      showMsg('Pilih buku dan siswa terlebih dahulu.', 'error');
      return;
    }
    try {
      setLoading(true);
      const res = await fetch('/api/library/issues/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          schoolId: 'sch_01',
          mediaId: selectedMediaId,
          studentId: selectedStudentId,
          dueDays: parseInt(checkoutDueDays, 10) || 14,
          notes: checkoutNotes
        })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Peminjaman gagal diproses');
      showMsg('Peminjaman buku berhasil dicatat.');
      setShowCheckoutModal(false);
      setSelectedMediaId('');
      setSelectedStudentId('');
      setCheckoutNotes('');
      fetchMedia();
      fetchIssues();
    } catch (err: any) {
      showMsg(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleReturnSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetIssue) return;
    try {
      setLoading(true);
      const res = await fetch('/api/library/issues/return', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          schoolId: 'sch_01',
          issueId: targetIssue.id,
          condition: returnCondition,
          damageCharge: parseFloat(damageCharge) || 0,
          notes: returnNotes
        })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Pengembalian gagal diproses');
      const fineMsg = json.data?.fineAmount > 0 ? ` (Denda: Rp ${json.data.fineAmount.toLocaleString('id-ID')})` : '';
      showMsg(`Pengembalian buku selesai${fineMsg}.`);
      setShowReturnModal(false);
      setTargetIssue(null);
      setReturnNotes('');
      setDamageCharge('0');
      fetchMedia();
      fetchIssues();
    } catch (err: any) {
      showMsg(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkLost = async (issue: LibraryIssue) => {
    if (!window.confirm(`Konfirmasi penandaan buku "${issue.mediaName}" sebagai HILANG? Biaya ganti rugi akan otomatis diterbitkan ke invoice siswa.`)) {
      return;
    }
    try {
      setLoading(true);
      const res = await fetch('/api/library/issues/lost', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          schoolId: 'sch_01',
          issueId: issue.id
        })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Gagal menandai buku hilang');
      showMsg(`Buku ditandai hilang. Tagihan ganti rugi Rp ${json.data.fineAmount.toLocaleString('id-ID')} telah diterbitkan.`);
      fetchMedia();
      fetchIssues();
    } catch (err: any) {
      showMsg(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const openReturnModal = (issue: LibraryIssue) => {
    setTargetIssue(issue);
    setReturnCondition('good');
    setDamageCharge('0');
    setReturnNotes('');
    setShowReturnModal(true);
  };

  const handleQuickBarcodeScan = (e: React.FormEvent) => {
    e.preventDefault();
    const barcode = barcodeScanInput.trim();
    if (!barcode) return;

    // First check if matching an active issue for immediate return
    const activeIssue = issuesList.find(
      (iss) => iss.status === 'issued' && (iss.mediaBarcode === barcode || iss.mediaBarcode?.toLowerCase() === barcode.toLowerCase())
    );

    if (activeIssue) {
      openReturnModal(activeIssue);
      showMsg(`Buku terpinjam ditemukan untuk barcode "${barcode}". Silakan verifikasi kondisi pengembalian.`);
      setBarcodeScanInput('');
      return;
    }

    // Otherwise check catalog for checkout
    const matchingMedia = mediaList.find(
      (m) => m.barcode === barcode || m.barcode?.toLowerCase() === barcode.toLowerCase()
    );

    if (matchingMedia) {
      if (matchingMedia.status === 'available') {
        setSelectedMediaId(matchingMedia.id);
        setShowCheckoutModal(true);
        showMsg(`Buku "${matchingMedia.name}" (${barcode}) siap dipinjamkan.`);
      } else {
        showMsg(`Buku "${matchingMedia.name}" berstatus ${matchingMedia.status}.`, 'error');
      }
      setBarcodeScanInput('');
      return;
    }

    showMsg(`Barcode "${barcode}" tidak ditemukan di sirkulasi aktif maupun katalog.`, 'error');
  };

  const availableMedia = mediaList.filter((m) => m.status === 'available');
  const activeIssues = issuesList.filter((i) => i.status === 'issued');

  return (
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Perpustakaan & Sirkulasi Buku</h2>
          <p className="text-xs text-slate-500 mt-1">Katalog terpadu, peminjaman siswa, tracking stok fisik, dan otomasi denda keterlambatan.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCatalogModal(true)}
            className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition"
          >
            + Tambah Buku
          </button>
          <button
            onClick={() => setShowCheckoutModal(true)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition"
          >
            Pinjamkan Buku
          </button>
        </div>
      </div>

      {notification && (
        <div className={`p-4 rounded-lg text-sm font-medium ${notification.type === 'error' ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'}`}>
          {notification.message}
        </div>
      )}

      {/* Stats Summary Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Judul/Unit</div>
          <div className="text-2xl font-bold text-slate-800 mt-1">{mediaList.length}</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Tersedia di Rak</div>
          <div className="text-2xl font-bold text-emerald-600 mt-1">{availableMedia.length}</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Sedang Dipinjam</div>
          <div className="text-2xl font-bold text-amber-600 mt-1">{activeIssues.length}</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Riwayat Sirkulasi</div>
          <div className="text-2xl font-bold text-indigo-600 mt-1">{issuesList.length}</div>
        </div>
      </div>

      {/* Quick Barcode Scan / Search Bar (#38) */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs">SCAN</div>
          <div>
            <div className="text-xs font-bold text-slate-800">Quick Barcode Scanner</div>
            <div className="text-[11px] text-slate-500">Scan atau ketik barcode buku untuk checkout atau pengembalian kilat.</div>
          </div>
        </div>
        <form onSubmit={handleQuickBarcodeScan} className="flex gap-2 w-full md:w-auto">
          <input
            type="text"
            placeholder="Scan barcode buku (e.g. LIB-LP-001)..."
            value={barcodeScanInput}
            onChange={(e) => setBarcodeScanInput(e.target.value)}
            className="w-full md:w-72 px-3 py-1.5 text-xs font-mono bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:border-indigo-500 focus:bg-white"
          />
          <button
            type="submit"
            className="px-3.5 py-1.5 text-xs bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold transition cursor-pointer shrink-0"
          >
            Proses Scan
          </button>
        </form>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <div className="flex gap-6">
          <button
            onClick={() => setActiveTab('catalog')}
            className={`pb-3 text-sm font-semibold border-b-2 transition ${activeTab === 'catalog' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
          >
            Katalog Buku ({mediaList.length})
          </button>
          <button
            onClick={() => setActiveTab('circulation')}
            className={`pb-3 text-sm font-semibold border-b-2 transition ${activeTab === 'circulation' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
          >
            Sirkulasi & Peminjaman ({activeIssues.length} aktif)
          </button>
        </div>
      </div>

      {/* Tab: Catalog */}
      {activeTab === 'catalog' && (
        <div className="space-y-4">
          <form onSubmit={handleSearchSubmit} className="flex gap-2">
            <input
              type="text"
              placeholder="Cari judul, pengarang, barcode, atau ISBN..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full md:w-96 px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-lg transition"
            >
              Cari
            </button>
            {searchQuery && (
              <button
                type="button"
                onClick={() => { setSearchQuery(''); fetchMedia(); }}
                className="px-3 py-2 text-slate-500 text-sm hover:text-slate-700"
              >
                Reset
              </button>
            )}
          </form>

          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-xs uppercase tracking-wider">
                    <th className="py-3 px-4">Barcode / Kode</th>
                    <th className="py-3 px-4">Judul Buku</th>
                    <th className="py-3 px-4">Pengarang</th>
                    <th className="py-3 px-4">ISBN</th>
                    <th className="py-3 px-4">Lokasi Rak</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {mediaList.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400">
                        {loading ? 'Memuat data...' : 'Belum ada buku dalam katalog perpustakaan.'}
                      </td>
                    </tr>
                  ) : (
                    mediaList.map((m) => (
                      <tr key={m.id} className="hover:bg-slate-50 transition">
                        <td className="py-3 px-4 font-mono text-xs font-semibold text-slate-900">{m.barcode}</td>
                        <td className="py-3 px-4 font-medium text-slate-900">{m.name}</td>
                        <td className="py-3 px-4 text-slate-600">{m.author}</td>
                        <td className="py-3 px-4 text-xs font-mono text-slate-500">{m.isbn || '-'}</td>
                        <td className="py-3 px-4 text-slate-600">{m.shelfLocation || '-'}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded text-xs font-medium ${
                              m.status === 'available'
                                ? 'bg-emerald-100 text-emerald-800'
                                : m.status === 'issued'
                                ? 'bg-amber-100 text-amber-800'
                                : m.status === 'lost'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-slate-100 text-slate-800'
                            }`}
                          >
                            {m.status === 'available' ? 'Tersedia' : m.status === 'issued' ? 'Dipinjam' : m.status === 'lost' ? 'Hilang' : m.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          {m.status === 'available' && (
                            <button
                              onClick={() => {
                                setSelectedMediaId(m.id);
                                setShowCheckoutModal(true);
                              }}
                              className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold"
                            >
                              Pinjamkan
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Circulation */}
      {activeTab === 'circulation' && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-xs uppercase tracking-wider">
                  <th className="py-3 px-4">Peminjam / Siswa</th>
                  <th className="py-3 px-4">Buku & Barcode</th>
                  <th className="py-3 px-4">Tgl Pinjam</th>
                  <th className="py-3 px-4">Jatuh Tempo</th>
                  <th className="py-3 px-4">Tgl Kembali</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Denda</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {issuesList.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-400">
                      {loading ? 'Memuat data sirkulasi...' : 'Belum ada transaksi sirkulasi.'}
                    </td>
                  </tr>
                ) : (
                  issuesList.map((issue) => (
                    <tr key={issue.id} className="hover:bg-slate-50 transition">
                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-900">{issue.studentName || 'Siswa'}</div>
                        <div className="text-xs text-slate-400 font-mono">NIS: {issue.studentNis || '-'}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-900">{issue.mediaName}</div>
                        <div className="text-xs font-mono text-slate-400">{issue.mediaBarcode}</div>
                      </td>
                      <td className="py-3 px-4 text-xs font-mono">{issue.issueDate}</td>
                      <td className="py-3 px-4 text-xs font-mono text-slate-800">{issue.dueDate}</td>
                      <td className="py-3 px-4 text-xs font-mono">{issue.returnDate || '-'}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded text-xs font-medium ${
                            issue.status === 'issued'
                              ? 'bg-amber-100 text-amber-800'
                              : issue.status === 'returned'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {issue.status === 'issued' ? 'Aktif' : issue.status === 'returned' ? 'Kembali' : 'Hilang'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-xs font-mono">
                        {issue.fineAmount && issue.fineAmount > 0 ? (
                          <span className="text-rose-600 font-semibold">Rp {issue.fineAmount.toLocaleString('id-ID')}</span>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="py-3 px-4 text-right space-x-2">
                        {issue.status === 'issued' && (
                          <>
                            <button
                              onClick={() => openReturnModal(issue)}
                              className="text-xs bg-slate-900 text-white px-2.5 py-1 rounded font-medium hover:bg-slate-800 transition"
                            >
                              Kembalikan
                            </button>
                            <button
                              onClick={() => handleMarkLost(issue)}
                              className="text-xs text-rose-600 hover:text-rose-800 font-semibold"
                            >
                              Hilang
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Catalog Modal */}
      {showCatalogModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden border border-slate-200">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-800">Katalog Buku Baru</h3>
              <button onClick={() => setShowCatalogModal(false)} className="text-slate-400 hover:text-slate-600 text-xl font-bold">&times;</button>
            </div>
            <form onSubmit={handleCreateMedia} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Judul Buku *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Laskar Pelangi"
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Kode Produk *</label>
                  <input
                    type="text"
                    required
                    placeholder="BK-LP01"
                    value={catCode}
                    onChange={(e) => setCatCode(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Barcode Copy *</label>
                  <input
                    type="text"
                    required
                    placeholder="LIB-001"
                    value={catBarcode}
                    onChange={(e) => setCatBarcode(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Pengarang / Penulis *</label>
                  <input
                    type="text"
                    required
                    placeholder="Andrea Hirata"
                    value={catAuthor}
                    onChange={(e) => setCatAuthor(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Penerbit</label>
                  <input
                    type="text"
                    placeholder="Bentang Pustaka"
                    value={catPublisher}
                    onChange={(e) => setCatPublisher(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">ISBN</label>
                  <input
                    type="text"
                    placeholder="978-979-3062-79-2"
                    value={catIsbn}
                    onChange={(e) => setCatIsbn(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Lokasi Rak</label>
                  <input
                    type="text"
                    placeholder="Rak A-02"
                    value={catShelf}
                    onChange={(e) => setCatShelf(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Nilai Ganti Rugi / Harga Buku (Rp)</label>
                <input
                  type="number"
                  value={catPrice}
                  onChange={(e) => setCatPrice(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCatalogModal(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition disabled:opacity-50"
                >
                  {loading ? 'Menyimpan...' : 'Simpan ke Katalog'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Checkout Modal */}
      {showCheckoutModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden border border-slate-200">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-800">Pinjamkan Buku ke Siswa</h3>
              <button onClick={() => setShowCheckoutModal(false)} className="text-slate-400 hover:text-slate-600 text-xl font-bold">&times;</button>
            </div>
            <form onSubmit={handleCheckout} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Pilih Buku (Hanya Yang Tersedia) *</label>
                <select
                  required
                  value={selectedMediaId}
                  onChange={(e) => setSelectedMediaId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                >
                  <option value="">-- Pilih Buku --</option>
                  {availableMedia.map((m) => (
                    <option key={m.id} value={m.id}>
                      [{m.barcode}] {m.name} - {m.author}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Pilih Siswa *</label>
                <select
                  required
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                >
                  <option value="">-- Pilih Siswa --</option>
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} (NIS: {s.nis})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Durasi Pinjam (Hari)</label>
                <input
                  type="number"
                  value={checkoutDueDays}
                  onChange={(e) => setCheckoutDueDays(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Catatan</label>
                <input
                  type="text"
                  placeholder="Kondisi awal buku..."
                  value={checkoutNotes}
                  onChange={(e) => setCheckoutNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCheckoutModal(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition disabled:opacity-50"
                >
                  {loading ? 'Memproses...' : 'Konfirmasi Peminjaman'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Return Modal */}
      {showReturnModal && targetIssue && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden border border-slate-200">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-800">Inspeksi & Pengembalian Buku</h3>
              <button onClick={() => setShowReturnModal(false)} className="text-slate-400 hover:text-slate-600 text-xl font-bold">&times;</button>
            </div>
            <form onSubmit={handleReturnSubmit} className="p-5 space-y-4">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs space-y-1">
                <div><span className="text-slate-400">Buku:</span> <span className="font-semibold text-slate-800">{targetIssue.mediaName}</span></div>
                <div><span className="text-slate-400">Peminjam:</span> <span className="font-semibold text-slate-800">{targetIssue.studentName}</span></div>
                <div><span className="text-slate-400">Jatuh Tempo:</span> <span className="font-mono text-slate-800">{targetIssue.dueDate}</span></div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Kondisi Buku Saat Kembali</label>
                <select
                  value={returnCondition}
                  onChange={(e) => setReturnCondition(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                >
                  <option value="good">Baik / Utuh</option>
                  <option value="damaged">Rusak / Sobek (Dikenakan Denda Perbaikan)</option>
                  <option value="lost">Hilang (Dikenakan Biaya Penggantian)</option>
                </select>
              </div>

              {returnCondition === 'damaged' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Biaya Perbaikan / Kerusakan (Rp)</label>
                  <input
                    type="number"
                    value={damageCharge}
                    onChange={(e) => setDamageCharge(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Catatan Pengembalian</label>
                <input
                  type="text"
                  placeholder="Keterangan kondisi..."
                  value={returnNotes}
                  onChange={(e) => setReturnNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <p className="text-xs text-slate-500">
                * Denda keterlambatan (Rp 2.000/hari) akan dihitung otomatis jika tanggal pengembalian melewati tanggal jatuh tempo.
              </p>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowReturnModal(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition disabled:opacity-50"
                >
                  {loading ? 'Memproses...' : 'Proses Pengembalian'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
