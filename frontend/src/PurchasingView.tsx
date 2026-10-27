import React, { useState, useEffect } from 'react';
import type { PurchaseOrder, InventoryProduct, VendorBill } from './types';

interface PurchasingViewProps {
  schoolId?: string;
  onOpenCreate?: () => void;
}

export function PurchasingView({ schoolId = 'school_sma_hb' }: PurchasingViewProps) {
  const [activeTab, setActiveTab] = useState<'orders' | 'bills'>('orders');
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [bills, setBills] = useState<VendorBill[]>([]);
  const [products, setProducts] = useState<InventoryProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<PurchaseOrder | null>(null);
  const [selectedBill, setSelectedBill] = useState<any | null>(null);

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

  // Modal Pay Bill state
  const [showPayModal, setShowPayModal] = useState(false);
  const [payBillTarget, setPayBillTarget] = useState<any | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<'bank_transfer' | 'cash'>('bank_transfer');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);

  const fetchPurchasingData = async () => {
    setLoading(true);
    try {
      const [orderRes, billRes, prodRes] = await Promise.all([
        fetch(`/api/purchasing/orders?schoolId=${schoolId}`),
        fetch(`/api/purchasing/bills?schoolId=${schoolId}`),
        fetch('/api/inventory/products'),
      ]);
      const orderJson = await orderRes.json();
      const billJson = await billRes.json();
      const prodJson = await prodRes.json();
      setOrders(orderJson.data || []);
      setBills(billJson.data || []);
      setProducts(prodJson.data || []);
    } catch (err) {
      console.error('Failed to load purchasing data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPurchasingData();
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

  const viewBillDetails = async (id: string) => {
    try {
      const res = await fetch(`/api/purchasing/bills/${id}`);
      const json = await res.json();
      if (json.data) {
        setSelectedBill(json.data);
      }
    } catch (err) {
      console.error('Failed to view Bill details:', err);
    }
  };

  const handleApprove = async (id: string) => {
    if (!confirm('Setujui Purchase Order ini? Status akan berubah menjadi Approved.')) return;
    try {
      const res = await fetch(`/api/purchasing/orders/${id}/approve`, { method: 'POST' });
      const json = await res.json();
      if (json.success) {
        alert('Purchase Order berhasil disetujui (Approved).');
        await fetchPurchasingData();
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
        await fetchPurchasingData();
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

  const handleCreateBill = async (id: string) => {
    if (!confirm('Buat Tagihan Pemasok (Vendor Bill) & Penerimaan Barang dari PO ini? Jurnal in_invoice dan mutasi stok fisik akan diterbitkan secara otomatis.')) {
      return;
    }
    try {
      const res = await fetch(`/api/purchasing/orders/${id}/create-bill`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ schoolId }),
      });
      const json = await res.json();
      if (json.success) {
        alert('Vendor Bill berhasil diterbitkan dan stok fisik bertambah!');
        await fetchPurchasingData();
        if (selectedOrder && selectedOrder.id === id) {
          viewOrderDetails(id);
        }
        setActiveTab('bills');
      } else {
        alert(json.error || 'Gagal membuat Vendor Bill');
      }
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  };

  const openPayBillModal = (bill: any) => {
    setPayBillTarget(bill);
    setPaymentAmount(bill.amountResidual !== undefined ? Number(bill.amountResidual) : Number(bill.amountTotal));
    setPaymentDate(new Date().toISOString().split('T')[0]);
    setShowPayModal(true);
  };

  const handlePayBillSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payBillTarget) return;
    if (paymentAmount <= 0) {
      alert('Jumlah pembayaran harus lebih besar dari 0');
      return;
    }

    try {
      const res = await fetch(`/api/purchasing/bills/${payBillTarget.id}/pay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          schoolId,
          amount: paymentAmount,
          paymentDate,
          paymentMethod,
        }),
      });
      const json = await res.json();
      if (json.success) {
        alert('Pembayaran tagihan pemasok berhasil dibukukan.');
        setShowPayModal(false);
        setPayBillTarget(null);
        await fetchPurchasingData();
        if (selectedBill && selectedBill.id === payBillTarget.id) {
          viewBillDetails(payBillTarget.id);
        }
      } else {
        alert(json.error || 'Gagal mencatat pembayaran vendor bill');
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
        await fetchPurchasingData();
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
          <h2 className="text-base font-bold text-slate-800">Pengadaan & Pembelian (Odoo Purchase & 3-Way Matching)</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Siklus pengadaan terpadu: Purchase Order, Penerimaan Stok Gudang, Faktur Pemasok (Vendor Bill), dan Pembayaran Utang.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {activeTab === 'orders' && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-[#714B67] hover:bg-[#583950] text-white px-3.5 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              <i className="fa-solid fa-plus text-[10px]"></i> Buat PO Baru
            </button>
          )}
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-slate-200 bg-white px-4 rounded-t border-t border-x">
        <button
          onClick={() => setActiveTab('orders')}
          className={`py-3 px-4 text-xs font-semibold border-b-2 cursor-pointer transition ${
            activeTab === 'orders'
              ? 'border-[#714B67] text-[#714B67]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <i className="fa-solid fa-file-invoice text-xs mr-1.5"></i>
          Purchase Orders ({orders.length})
        </button>
        <button
          onClick={() => setActiveTab('bills')}
          className={`py-3 px-4 text-xs font-semibold border-b-2 cursor-pointer transition ${
            activeTab === 'bills'
              ? 'border-[#714B67] text-[#714B67]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <i className="fa-solid fa-receipt text-xs mr-1.5"></i>
          Vendor Bills (Tagihan Pemasok) ({bills.length})
        </button>
      </div>

      {/* Tab Content: Purchase Orders */}
      {activeTab === 'orders' && (
        <div className="bg-white rounded-b border border-slate-200 border-t-0 overflow-hidden shadow-2xs">
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
                            po.status === 'done'
                              ? 'bg-purple-100 text-purple-800'
                              : po.status === 'approved'
                              ? 'bg-emerald-100 text-emerald-800'
                              : po.status === 'cancelled'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {po.status === 'done' ? 'Selesai (Billed)' : po.status}
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
                        {po.status === 'approved' && !po.moveId && (
                          <button
                            onClick={() => handleCreateBill(po.id)}
                            className="px-2.5 py-1 text-[11px] font-semibold bg-[#714B67] hover:bg-[#583950] text-white rounded cursor-pointer"
                          >
                            Buat Bill
                          </button>
                        )}
                        {po.status === 'done' && po.moveId && (
                          <button
                            onClick={() => {
                              setActiveTab('bills');
                              viewBillDetails(po.moveId!);
                            }}
                            className="px-2 py-1 text-[11px] font-medium border border-purple-200 text-purple-700 bg-purple-50 hover:bg-purple-100 rounded cursor-pointer"
                          >
                            Lihat Bill
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab Content: Vendor Bills */}
      {activeTab === 'bills' && (
        <div className="bg-white rounded-b border border-slate-200 border-t-0 overflow-hidden shadow-2xs">
          <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
            <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
              Tagihan Pemasok (Vendor Bills / in_invoice)
            </h3>
            <span className="text-xs text-slate-500 font-medium">{bills.length} tagihan</span>
          </div>

          {loading ? (
            <div className="p-8 text-center text-xs text-slate-500">Memuat data tagihan...</div>
          ) : bills.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">
              Belum ada Vendor Bill. Konversi Purchase Order yang telah berstatus &apos;Approved&apos; untuk membuat Vendor Bill.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="px-4 py-2.5">Nomor Faktur</th>
                    <th className="px-4 py-2.5">Tanggal</th>
                    <th className="px-4 py-2.5 text-right">Total Tagihan</th>
                    <th className="px-4 py-2.5 text-right">Sisa Utang</th>
                    <th className="px-4 py-2.5 text-center">Status Pembayaran</th>
                    <th className="px-4 py-2.5 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {bills.map((bill) => (
                    <tr key={bill.id} className="hover:bg-slate-50 transition">
                      <td className="px-4 py-3 font-mono font-medium text-slate-800">{bill.name}</td>
                      <td className="px-4 py-3 text-slate-600">{bill.date}</td>
                      <td className="px-4 py-3 text-right font-semibold text-slate-800">
                        Rp {Number(bill.amountTotal || 0).toLocaleString('id-ID')}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-slate-700">
                        Rp {Number(bill.amountResidual || 0).toLocaleString('id-ID')}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${
                            bill.paymentState === 'paid'
                              ? 'bg-emerald-100 text-emerald-800'
                              : bill.paymentState === 'partial'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {bill.paymentState === 'paid' ? 'Lunas' : bill.paymentState === 'partial' ? 'Sebagian' : 'Belum Bayar'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right space-x-1.5 whitespace-nowrap">
                        <button
                          onClick={() => viewBillDetails(bill.id)}
                          className="px-2 py-1 text-[11px] font-medium border border-slate-200 rounded hover:bg-slate-100 text-slate-700 cursor-pointer"
                        >
                          Rincian
                        </button>
                        {bill.paymentState !== 'paid' && (
                          <button
                            onClick={() => openPayBillModal(bill)}
                            className="px-2.5 py-1 text-[11px] font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded cursor-pointer"
                          >
                            Bayar
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* PO Detail Modal */}
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
                  selectedOrder.status === 'done'
                    ? 'bg-purple-100 text-purple-800'
                    : selectedOrder.status === 'approved'
                    ? 'bg-emerald-100 text-emerald-800'
                    : selectedOrder.status === 'cancelled'
                    ? 'bg-rose-100 text-rose-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {selectedOrder.status === 'done' ? 'Selesai (Billed)' : selectedOrder.status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 my-4 text-xs">
              <div>
                <span className="text-slate-500 block">Tanggal Pesanan:</span>
                <span className="font-semibold text-slate-800">{selectedOrder.orderDate}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Vendor Bill Terhubung:</span>
                <span className="font-semibold text-purple-700">{selectedOrder.moveId || 'Belum dibuat'}</span>
              </div>
              <div className="col-span-2">
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
                {selectedOrder.status === 'approved' && !selectedOrder.moveId && (
                  <button
                    onClick={() => handleCreateBill(selectedOrder.id)}
                    className="px-3.5 py-1.5 bg-[#714B67] hover:bg-[#583950] text-white rounded text-xs font-semibold cursor-pointer"
                  >
                    Buat Vendor Bill & Penerimaan Stok
                  </button>
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

      {/* Bill Detail Modal */}
      {selectedBill && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6 border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <h3 className="font-bold text-slate-800 text-base">{selectedBill.name}</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Vendor Bill ({selectedBill.purchaseOrder ? `Ref PO: ${selectedBill.purchaseOrder.name}` : 'Tagihan Pemasok'})
                </p>
              </div>
              <span
                className={`px-2.5 py-1 rounded text-xs font-semibold uppercase tracking-wider ${
                  selectedBill.paymentState === 'paid'
                    ? 'bg-emerald-100 text-emerald-800'
                    : selectedBill.paymentState === 'partial'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {selectedBill.paymentState === 'paid' ? 'Lunas' : selectedBill.paymentState === 'partial' ? 'Sebagian' : 'Belum Bayar'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 my-4 text-xs">
              <div>
                <span className="text-slate-500 block">Tanggal Tagihan:</span>
                <span className="font-semibold text-slate-800">{selectedBill.date}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Jatuh Tempo:</span>
                <span className="text-slate-800">{selectedBill.invoiceDueDate || selectedBill.date}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Total Tagihan:</span>
                <span className="font-bold text-slate-800">Rp {Number(selectedBill.amountTotal || 0).toLocaleString('id-ID')}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Sisa Utang Terbuka:</span>
                <span className="font-bold text-rose-600">Rp {Number(selectedBill.amountResidual || 0).toLocaleString('id-ID')}</span>
              </div>
            </div>

            <div className="mt-4">
              <h4 className="font-bold text-xs text-slate-700 mb-2 uppercase tracking-wide">Jurnal Pembukuan (Double-Entry Move Lines)</h4>
              <div className="border border-slate-200 rounded overflow-hidden">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 text-[11px]">
                    <tr>
                      <th className="px-3 py-2">Keterangan Akun</th>
                      <th className="px-3 py-2 text-right">Debit</th>
                      <th className="px-3 py-2 text-right">Kredit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {selectedBill.lines && selectedBill.lines.length > 0 ? (
                      selectedBill.lines.map((l: any) => (
                        <tr key={l.id}>
                          <td className="px-3 py-2">
                            <div className="font-medium text-slate-800">{l.name}</div>
                            <div className="text-[10px] text-slate-500 font-mono">Account ID: {l.accountId}</div>
                          </td>
                          <td className="px-3 py-2 text-right font-medium">
                            {Number(l.debit) > 0 ? `Rp ${Number(l.debit).toLocaleString('id-ID')}` : '-'}
                          </td>
                          <td className="px-3 py-2 text-right font-medium">
                            {Number(l.credit) > 0 ? `Rp ${Number(l.credit).toLocaleString('id-ID')}` : '-'}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={3} className="p-3 text-center text-slate-500">
                          Tidak ada baris jurnal
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-between items-center pt-6 mt-4 border-t border-slate-200">
              <div>
                {selectedBill.paymentState !== 'paid' && (
                  <button
                    onClick={() => {
                      const b = selectedBill;
                      setSelectedBill(null);
                      openPayBillModal(b);
                    }}
                    className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-semibold cursor-pointer"
                  >
                    Bayar Tagihan Pemasok
                  </button>
                )}
              </div>
              <button
                type="button"
                onClick={() => setSelectedBill(null)}
                className="px-4 py-1.5 border border-slate-300 rounded text-xs text-slate-700 hover:bg-slate-50 font-medium cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Pay Vendor Bill */}
      {showPayModal && payBillTarget && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 border border-slate-200">
            <h3 className="font-bold text-slate-800 text-base mb-1">Catat Pembayaran Vendor</h3>
            <p className="text-xs text-slate-500 mb-4">
              Pembayaran tagihan pemasok {payBillTarget.name}. Sistem akan membukukan jurnal pengeluaran kas/bank berimbang.
            </p>

            <form onSubmit={handlePayBillSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Metode Pembayaran *</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as any)}
                  className="w-full p-2 border border-slate-300 rounded bg-white text-xs"
                >
                  <option value="bank_transfer">Transfer Bank (BCA Operasional)</option>
                  <option value="cash">Kas Operasional / Kasir</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tanggal Bayar *</label>
                <input
                  type="date"
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded text-xs"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Jumlah Pembayaran (Rp) *</label>
                <input
                  type="number"
                  min="1"
                  max={payBillTarget.amountResidual || payBillTarget.amountTotal}
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(Number(e.target.value))}
                  className="w-full p-2 border border-slate-300 rounded text-xs font-semibold text-slate-800"
                  required
                />
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Sisa utang: Rp {Number(payBillTarget.amountResidual || payBillTarget.amountTotal).toLocaleString('id-ID')}
                </span>
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowPayModal(false);
                    setPayBillTarget(null);
                  }}
                  className="px-3 py-1.5 border border-slate-300 rounded hover:bg-slate-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-semibold cursor-pointer"
                >
                  Konfirmasi Pembayaran
                </button>
              </div>
            </form>
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
