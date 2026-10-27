import React, { useState, useEffect } from 'react';
import type { PurchaseOrder, InventoryProduct } from './types';

interface PurchasingViewProps {
  schoolId?: string;
  onOpenCreate?: () => void;
}

export function PurchasingView({ schoolId = 'school_sma_hb' }: PurchasingViewProps) {
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [products, setProducts] = useState<InventoryProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<PurchaseOrder | null>(null);

  // Modal create PO state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [partnerName, setPartnerName] = useState('');
  const [orderDate, setOrderDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [lines, setLines] = useState<
    Array<{ productId: string; productQty: number; priceUnit: number; notes: string }>
  >([
    { productId: '', productQty: 1, priceUnit: 0, notes: '' },
  ]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const [orderRes, prodRes] = await Promise.all([
        fetch(`/api/purchasing/orders?schoolId=${schoolId}`),
        fetch('/api/inventory/products'),
      ]);
      const orderJson = await orderRes.json();
      const prodJson = await prodRes.json();
      setOrders(orderJson.data || []);
      setProducts(prodJson.data || []);
    } catch (err) {
      console.error('Failed to load purchasing data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [schoolId]);

  const viewOrderDetails = async (id: string) => {
    try {
      const res = await fetch(`/api/purchasing/orders/${id}`);
      const json = await res.json();
      if (json.data) {
        setSelectedOrder(json.data);
      }
    } catch (err) {
      console.error('Failed to view PO details:', err);
    }
  };

  const handleApprove = async (id: string) => {
    if (!confirm('Setujui Purchase Order ini? Status akan berubah menjadi Approved.')) return;
    try {
      const res = await fetch(`/api/purchasing/orders/${id}/approve`, { method: 'POST' });
      const json = await res.json();
      if (json.success) {
        alert('Purchase Order berhasil disetujui (Approved).');
        await fetchOrders();
        if (selectedOrder && selectedOrder.id === id) {
          viewOrderDetails(id);
        }
      } else {
        alert(json.error || 'Gagal menyetujui PO');
      }
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  };

  const handleCancel = async (id: string) => {
    if (!confirm('Batalkan Purchase Order ini?')) return;
    try {
      const res = await fetch(`/api/purchasing/orders/${id}/cancel`, { method: 'POST' });
      const json = await res.json();
      if (json.success) {
        alert('Purchase Order telah dibatalkan.');
        await fetchOrders();
        if (selectedOrder && selectedOrder.id === id) {
          viewOrderDetails(id);
        }
      } else {
        alert(json.error || 'Gagal membatalkan PO');
      }
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  };

  const addLine = () => {
    setLines([...lines, { productId: '', productQty: 1, priceUnit: 0, notes: '' }]);
  };

  const removeLine = (index: number) => {
    if (lines.length === 1) return;
    setLines(lines.filter((_, i) => i !== index));
  };

  const updateLine = (index: number, field: string, value: any) => {
    const updated = [...lines];
    if (field === 'productId') {
      const prod = products.find((p) => p.id === value);
      updated[index] = {
        ...updated[index],
        productId: value,
        priceUnit: prod ? prod.standardPrice || prod.listPrice || 0 : updated[index].priceUnit,
      };
    } else {
      updated[index] = { ...updated[index], [field]: value };
    }
    setLines(updated);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!partnerName.trim()) {
      alert('Nama vendor/rekanan wajib diisi');
      return;
    }
    const validLines = lines.filter((l) => l.productId && Number(l.productQty) > 0);
    if (validLines.length === 0) {
      alert('Tambahkan setidaknya satu item barang dengan jumlah > 0');
      return;
    }

    try {
      const res = await fetch('/api/purchasing/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          schoolId,
          partnerName: partnerName.trim(),
          orderDate,
          notes: notes.trim() || null,
          lines: validLines.map((l) => ({
            productId: l.productId,
            productQty: Number(l.productQty),
            priceUnit: Number(l.priceUnit),
            notes: l.notes.trim() || null,
          })),
        }),
      });
      const json = await res.json();
      if (json.success) {
        alert('Purchase Order berhasil dibuat (Draft).');
        setShowCreateModal(false);
        setPartnerName('');
        setNotes('');
        setLines([{ productId: '', productQty: 1, priceUnit: 0, notes: '' }]);
        await fetchOrders();
      } else {
        alert(json.error || 'Gagal membuat Purchase Order');
      }
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  };

  const calculateTotalPreview = () => {
    return lines.reduce((acc, l) => acc + (Number(l.productQty) || 0) * (Number(l.priceUnit) || 0), 0);
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-4 rounded border border-slate-200">
        <div>
          <h2 className="text-base font-bold text-slate-800">Pengadaan & Purchase Order (Odoo Purchase)</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Kelola pesanan pembelian barang, peralatan laboratorium, buku, dan persediaan sekolah ke vendor rekanan.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-[#714B67] hover:bg-[#583950] text-white px-3.5 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
          >
            <i className="fa-solid fa-plus text-[10px]"></i> Buat PO Baru
          </button>
        </div>
      </div>

      {/* Main PO List Table */}
      <div className="bg-white rounded border border-slate-200 overflow-hidden shadow-2xs">
        <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
          <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
            Daftar Pesanan Pembelian (Purchase Orders)
          </h3>
          <span className="text-xs text-slate-500 font-medium">{orders.length} dokumen</span>
        </div>

        {loading ? (
          <div className="p-8 text-center text-xs text-slate-500">Memuat data pesanan...</div>
        ) : orders.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">Belum ada Purchase Order yang dibuat.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-4 py-2.5">Nomor PO</th>
                  <th className="px-4 py-2.5">Vendor / Rekanan</th>
                  <th className="px-4 py-2.5">Tanggal</th>
                  <th className="px-4 py-2.5 text-right">Total Nilai</th>
                  <th className="px-4 py-2.5 text-center">Status</th>
                  <th className="px-4 py-2.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {orders.map((po) => (
                  <tr key={po.id} className="hover:bg-slate-50 transition">
                    <td className="px-4 py-3 font-mono font-medium text-slate-800">{po.name}</td>
                    <td className="px-4 py-3 font-medium text-slate-800">{po.partnerName}</td>
                    <td className="px-4 py-3 text-slate-600">{po.orderDate}</td>
                    <td className="px-4 py-3 text-right font-semibold text-slate-800">
                      Rp {Number(po.amountTotal || 0).toLocaleString('id-ID')}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${
                          po.status === 'approved'
                            ? 'bg-emerald-100 text-emerald-800'
                            : po.status === 'cancelled'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {po.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right space-x-1.5 whitespace-nowrap">
                      <button
                        onClick={() => viewOrderDetails(po.id)}
                        className="px-2 py-1 text-[11px] font-medium border border-slate-200 rounded hover:bg-slate-100 text-slate-700 cursor-pointer"
                      >
                        Rincian
                      </button>
                      {po.status === 'draft' && (
                        <>
                          <button
                            onClick={() => handleApprove(po.id)}
                            className="px-2 py-1 text-[11px] font-medium bg-emerald-600 hover:bg-emerald-700 text-white rounded cursor-pointer"
                          >
                            Setujui
                          </button>
                          <button
                            onClick={() => handleCancel(po.id)}
                            className="px-2 py-1 text-[11px] font-medium bg-rose-600 hover:bg-rose-700 text-white rounded cursor-pointer"
                          >
                            Batal
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6 border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <h3 className="font-bold text-slate-800 text-base">{selectedOrder.name}</h3>
                <p className="text-xs text-slate-500 mt-0.5">Vendor: {selectedOrder.partnerName}</p>
              </div>
              <span
                className={`px-2.5 py-1 rounded text-xs font-semibold uppercase tracking-wider ${
                  selectedOrder.status === 'approved'
                    ? 'bg-emerald-100 text-emerald-800'
                    : selectedOrder.status === 'cancelled'
                    ? 'bg-rose-100 text-rose-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {selectedOrder.status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 my-4 text-xs">
              <div>
                <span className="text-slate-500 block">Tanggal Pesanan:</span>
                <span className="font-semibold text-slate-800">{selectedOrder.orderDate}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Catatan Tambahan:</span>
                <span className="text-slate-800">{selectedOrder.notes || '-'}</span>
              </div>
            </div>

            <div className="mt-4">
              <h4 className="font-bold text-xs text-slate-700 mb-2 uppercase tracking-wide">Rincian Barang</h4>
              <div className="border border-slate-200 rounded overflow-hidden">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 text-[11px]">
                    <tr>
                      <th className="px-3 py-2">Produk</th>
                      <th className="px-3 py-2 text-center">Qty</th>
                      <th className="px-3 py-2 text-right">Harga Satuan</th>
                      <th className="px-3 py-2 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {selectedOrder.lines && selectedOrder.lines.length > 0 ? (
                      selectedOrder.lines.map((l) => (
                        <tr key={l.id}>
                          <td className="px-3 py-2">
                            <div className="font-medium text-slate-800">{l.productName || l.productId}</div>
                            {l.productCode && <div className="text-[10px] text-slate-500">{l.productCode}</div>}
                          </td>
                          <td className="px-3 py-2 text-center">
                            {l.productQty} {l.uom || 'unit'}
                          </td>
                          <td className="px-3 py-2 text-right">Rp {Number(l.priceUnit).toLocaleString('id-ID')}</td>
                          <td className="px-3 py-2 text-right font-semibold">
                            Rp {Number(l.subtotal).toLocaleString('id-ID')}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="p-3 text-center text-slate-500">
                          Tidak ada baris item
                        </td>
                      </tr>
                    )}
                  </tbody>
                  <tfoot className="bg-slate-50 font-bold border-t border-slate-200">
                    <tr>
                      <td colSpan={3} className="px-3 py-2 text-right text-slate-800">
                        Total Pesanan:
                      </td>
                      <td className="px-3 py-2 text-right text-[#714B67]">
                        Rp {Number(selectedOrder.amountTotal).toLocaleString('id-ID')}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            <div className="flex justify-between items-center pt-6 mt-4 border-t border-slate-200">
              <div className="space-x-2">
                {selectedOrder.status === 'draft' && (
                  <>
                    <button
                      onClick={() => handleApprove(selectedOrder.id)}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-semibold cursor-pointer"
                    >
                      Setujui PO
                    </button>
                    <button
                      onClick={() => handleCancel(selectedOrder.id)}
                      className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded text-xs font-semibold cursor-pointer"
                    >
                      Batalkan PO
                    </button>
                  </>
                )}
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-1.5 border border-slate-300 rounded text-xs text-slate-700 hover:bg-slate-50 font-medium cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Create Purchase Order */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6 border border-slate-200 max-h-[90vh] overflow-y-auto">
            <h3 className="font-bold text-slate-800 text-base mb-1">Buat Purchase Order Baru</h3>
            <p className="text-xs text-slate-500 mb-4">
              Kirimkan pesanan resmi kepada vendor atau supplier untuk pengadaan barang sekolah.
            </p>

            <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama Rekanan / Vendor Pemasok *</label>
                <input
                  type="text"
                  placeholder="e.g. PT Gramedia Edukasi Pratama"
                  value={partnerName}
                  onChange={(e) => setPartnerName(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tanggal Pesanan *</label>
                  <input
                    type="date"
                    value={orderDate}
                    onChange={(e) => setOrderDate(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Catatan / Referensi Internal</label>
                  <input
                    type="text"
                    placeholder="e.g. Pengadaan ATK semester ganjil"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded"
                  />
                </div>
              </div>

              {/* Dynamic Line Items */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="font-bold text-slate-700">Daftar Item Barang *</label>
                  <button
                    type="button"
                    onClick={addLine}
                    className="text-xs text-[#714B67] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <i className="fa-solid fa-plus text-[10px]"></i> Tambah Baris Item
                  </button>
                </div>

                <div className="space-y-2">
                  {lines.map((line, idx) => (
                    <div key={idx} className="flex items-center gap-2 bg-slate-50 p-2 rounded border border-slate-200">
                      <div className="flex-1">
                        <select
                          value={line.productId}
                          onChange={(e) => updateLine(idx, 'productId', e.target.value)}
                          className="w-full p-1.5 border border-slate-300 rounded bg-white text-xs"
                          required
                        >
                          <option value="">-- Pilih Produk / Barang --</option>
                          {products.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name} ({p.code})
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="w-20">
                        <input
                          type="number"
                          min="1"
                          placeholder="Qty"
                          value={line.productQty}
                          onChange={(e) => updateLine(idx, 'productQty', Math.max(1, Number(e.target.value)))}
                          className="w-full p-1.5 border border-slate-300 rounded text-center text-xs"
                          required
                        />
                      </div>
                      <div className="w-28">
                        <input
                          type="number"
                          min="0"
                          placeholder="Harga Satuan"
                          value={line.priceUnit}
                          onChange={(e) => updateLine(idx, 'priceUnit', Math.max(0, Number(e.target.value)))}
                          className="w-full p-1.5 border border-slate-300 rounded text-right text-xs"
                          required
                        />
                      </div>
                      <div className="w-28 text-right font-semibold text-slate-700">
                        Rp {((Number(line.productQty) || 0) * (Number(line.priceUnit) || 0)).toLocaleString('id-ID')}
                      </div>
                      {lines.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeLine(idx)}
                          className="text-rose-500 hover:text-rose-700 px-1 cursor-pointer"
                          title="Hapus baris"
                        >
                          <i className="fa-solid fa-trash text-xs"></i>
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex justify-end items-center gap-2 mt-3 pt-2 border-t border-slate-200">
                  <span className="font-semibold text-slate-600">Total Estimasi PO:</span>
                  <span className="font-bold text-sm text-[#714B67]">
                    Rp {calculateTotalPreview().toLocaleString('id-ID')}
                  </span>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-3 py-1.5 border border-slate-300 rounded hover:bg-slate-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#714B67] hover:bg-[#583950] text-white rounded font-semibold cursor-pointer"
                >
                  Simpan Purchase Order (Draft)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
