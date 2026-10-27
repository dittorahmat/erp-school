import type { D1Database } from "@cloudflare/workers-types";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "../db/schema";
import { desc, eq, and } from "drizzle-orm";
import { generateId } from "../lib/utils";

export interface PurchaseOrderLineInput {
  productId: string;
  productQty: number;
  priceUnit: number;
  notes?: string | null;
}

export interface CreatePurchaseOrderParams {
  id?: string;
  schoolId: string;
  partnerName: string;
  orderDate?: string;
  notes?: string | null;
  lines: PurchaseOrderLineInput[];
}

export interface CreateVendorBillParams {
  schoolId: string;
  orderId: string;
  billDate?: string;
  expenseAccountId?: string;
  payableAccountId?: string;
}

export interface PayVendorBillParams {
  schoolId: string;
  billId: string;
  paymentDate?: string;
  paymentMethod?: string;
  amount?: number;
  paymentAccountId?: string;
  payableAccountId?: string;
}

export const purchasingEngine = {
  /**
   * Get all purchase orders for a school.
   */
  async getPurchaseOrders(d1: D1Database, schoolId?: string) {
    const db = drizzle(d1, { schema });
    if (schoolId) {
      return db
        .select()
        .from(schema.purchaseOrders)
        .where(eq(schema.purchaseOrders.schoolId, schoolId))
        .orderBy(desc(schema.purchaseOrders.createdAt));
    }
    return db
      .select()
      .from(schema.purchaseOrders)
      .orderBy(desc(schema.purchaseOrders.createdAt));
  },

  /**
   * Get purchase order by ID with line items and product details.
   */
  async getPurchaseOrderById(d1: D1Database, orderId: string) {
    const db = drizzle(d1, { schema });
    const orders = await db
      .select()
      .from(schema.purchaseOrders)
      .where(eq(schema.purchaseOrders.id, orderId))
      .limit(1);

    if (!orders || orders.length === 0) return null;
    const order = orders[0];

    const lines = await db
      .select({
        id: schema.purchaseOrderLines.id,
        orderId: schema.purchaseOrderLines.orderId,
        productId: schema.purchaseOrderLines.productId,
        productName: schema.products.name,
        productCode: schema.products.code,
        uom: schema.products.uom,
        productQty: schema.purchaseOrderLines.productQty,
        priceUnit: schema.purchaseOrderLines.priceUnit,
        subtotal: schema.purchaseOrderLines.subtotal,
        notes: schema.purchaseOrderLines.notes,
        createdAt: schema.purchaseOrderLines.createdAt,
      })
      .from(schema.purchaseOrderLines)
      .leftJoin(schema.products, eq(schema.purchaseOrderLines.productId, schema.products.id))
      .where(eq(schema.purchaseOrderLines.orderId, orderId));

    return {
      ...order,
      lines,
    };
  },

  /**
   * Create a Purchase Order (PO) in draft state with line items atomically.
   */
  async createPurchaseOrder(d1: D1Database, params: CreatePurchaseOrderParams) {
    if (!params.schoolId) throw new Error("schoolId is required");
    if (!params.partnerName || !params.partnerName.trim()) throw new Error("partnerName is required");
    if (!params.lines || params.lines.length === 0) throw new Error("At least one purchase order line is required");

    const db = drizzle(d1, { schema });
    const orderId = params.id || generateId("po");
    const orderDate = params.orderDate || new Date().toISOString().split("T")[0];

    // Compute lines and total
    let totalAmount = 0;
    const linesToInsert = params.lines.map((l) => {
      const qty = Number(l.productQty) > 0 ? Number(l.productQty) : 1;
      const unit = Number(l.priceUnit) >= 0 ? Number(l.priceUnit) : 0;
      const sub = qty * unit;
      totalAmount += sub;
      return {
        id: generateId("pol"),
        orderId: orderId,
        productId: l.productId,
        productQty: qty,
        priceUnit: unit,
        subtotal: sub,
        notes: l.notes || null,
        createdAt: new Date(),
      };
    });

    const year = orderDate.slice(0, 4);
    const orderName = `PO/${year}/${orderId.slice(-6).toUpperCase()}`;

    const newOrder = {
      id: orderId,
      schoolId: params.schoolId,
      name: orderName,
      partnerName: params.partnerName.trim(),
      orderDate: orderDate,
      amountTotal: totalAmount,
      status: "draft",
      notes: params.notes || null,
      moveId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Atomic D1 batch creation
    const statements: any[] = [
      db.insert(schema.purchaseOrders).values(newOrder),
      db.insert(schema.purchaseOrderLines).values(linesToInsert),
    ];

    await db.batch(statements as [any, ...any[]]);

    return this.getPurchaseOrderById(d1, orderId);
  },

  /**
   * Approve a Purchase Order.
   * Status transitions from draft -> approved.
   */
  async approvePurchaseOrder(d1: D1Database, orderId: string) {
    const db = drizzle(d1, { schema });
    const order = await this.getPurchaseOrderById(d1, orderId);
    if (!order) throw new Error("Purchase Order not found");
    if (order.status !== "draft") {
      throw new Error(`Cannot approve Purchase Order in ${order.status} status`);
    }

    await db
      .update(schema.purchaseOrders)
      .set({
        status: "approved",
        updatedAt: new Date(),
      })
      .where(eq(schema.purchaseOrders.id, orderId));

    return this.getPurchaseOrderById(d1, orderId);
  },

  /**
   * Cancel a Purchase Order.
   * Status transitions to cancelled.
   */
  async cancelPurchaseOrder(d1: D1Database, orderId: string) {
    const db = drizzle(d1, { schema });
    const order = await this.getPurchaseOrderById(d1, orderId);
    if (!order) throw new Error("Purchase Order not found");
    if (order.status === "cancelled") {
      throw new Error("Purchase Order is already cancelled");
    }

    await db
      .update(schema.purchaseOrders)
      .set({
        status: "cancelled",
        updatedAt: new Date(),
      })
      .where(eq(schema.purchaseOrders.id, orderId));

    return this.getPurchaseOrderById(d1, orderId);
  },

  /**
   * List all vendor bills (in_invoice) for a school.
   */
  async getVendorBills(d1: D1Database, schoolId?: string) {
    const db = drizzle(d1, { schema });
    if (schoolId) {
      return db
        .select()
        .from(schema.accountMoves)
        .where(
          and(
            eq(schema.accountMoves.moveType, "in_invoice"),
            eq(schema.accountMoves.schoolId, schoolId)
          )
        )
        .orderBy(desc(schema.accountMoves.date));
    }
    return db
      .select()
      .from(schema.accountMoves)
      .where(eq(schema.accountMoves.moveType, "in_invoice"))
      .orderBy(desc(schema.accountMoves.date));
  },

  /**
   * Get vendor bill details by ID with move lines and related PO.
   */
  async getVendorBillById(d1: D1Database, billId: string) {
    const db = drizzle(d1, { schema });
    const bills = await db
      .select()
      .from(schema.accountMoves)
      .where(
        and(
          eq(schema.accountMoves.id, billId),
          eq(schema.accountMoves.moveType, "in_invoice")
        )
      )
      .limit(1);

    if (!bills || bills.length === 0) return null;
    const bill = bills[0];

    const lines = await db
      .select()
      .from(schema.accountMoveLines)
      .where(eq(schema.accountMoveLines.moveId, billId));

    const po = await db
      .select()
      .from(schema.purchaseOrders)
      .where(eq(schema.purchaseOrders.moveId, billId))
      .limit(1);

    return {
      ...bill,
      lines,
      purchaseOrder: po[0] || null,
    };
  },

  /**
   * Convert an Approved Purchase Order into a Vendor Bill (in_invoice) with Inventory Receipt.
   * Atomically compiled into a single db.batch([...]):
   * 1. Creates account_moves entry (in_invoice, amount_total: order.amountTotal, posted, not_paid).
   * 2. Balanced debit/credit account_move_lines (Debit Expense/Inventory Asset, Credit Accounts Payable).
   * 3. Stock Picking & Moves (receipt from loc_supplier -> loc_internal) for inventory tracking.
   * 4. Updates purchase_orders status -> 'done' and move_id -> billId.
   */
  async createVendorBillFromPO(d1: D1Database, params: CreateVendorBillParams) {
    if (!params.orderId) throw new Error("orderId is required");
    const db = drizzle(d1, { schema });

    const order = await this.getPurchaseOrderById(d1, params.orderId);
    if (!order) throw new Error("Purchase Order not found");
    if (order.status !== "approved") {
      throw new Error(`Cannot create Vendor Bill from Purchase Order in '${order.status}' status (must be 'approved')`);
    }
    if (order.moveId) {
      throw new Error("Vendor Bill already created for this Purchase Order");
    }

    const schoolId = params.schoolId || order.schoolId;
    const billDate = params.billDate || new Date().toISOString().split("T")[0];
    const billId = generateId("bill");
    const amountTotal = Number(order.amountTotal || 0);

    // Resolve COA accounts (Beban Pengadaan / Aset vs Utang Usaha / Vendor)
    const accounts = await db
      .select()
      .from(schema.chartOfAccounts)
      .where(eq(schema.chartOfAccounts.schoolId, schoolId));

    const expenseAccount =
      params.expenseAccountId ||
      accounts.find((a) => a.code === "51000" || a.code === "5-1201" || a.code === "14000" || a.type === "expense")?.id ||
      accounts[0]?.id ||
      "coa_exp_ops";

    const payableAccount =
      params.payableAccountId ||
      accounts.find((a) => a.code === "21000" || a.code === "2-1102" || (a.type === "liability" && !a.reconcile))?.id ||
      accounts.find((a) => a.type === "liability")?.id ||
      accounts[0]?.id ||
      "coa_ap_vendor";

    // Resolve purchase/bill journal
    const journalsList = await db
      .select()
      .from(schema.journals)
      .where(eq(schema.journals.schoolId, schoolId));
    const billJournal =
      journalsList.find((j) => j.type === "purchase") ||
      journalsList.find((j) => j.code === "BILL" || j.code === "INV") ||
      journalsList[0];
    const journalId = billJournal?.id || "jrn_purchase";

    const billName = `BILL/${billDate.slice(0, 4)}/${order.name.slice(-4) || billId.slice(-4).toUpperCase()}`;

    // 1. Vendor Bill Move Entry
    const vendorBillMove = {
      id: billId,
      schoolId: schoolId,
      journalId: journalId,
      studentId: null,
      name: billName,
      date: billDate,
      moveType: "in_invoice",
      amountTotal: amountTotal,
      amountResidual: amountTotal,
      state: "posted",
      paymentState: "not_paid",
      invoiceDueDate: billDate,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // 2. Double-entry Journal Lines: Debit Expense/Asset, Credit Accounts Payable
    const debitLine = {
      id: generateId("aml_deb"),
      moveId: billId,
      accountId: expenseAccount,
      studentId: null,
      name: `Pengadaan Barang PO ${order.name} - ${order.partnerName}`,
      debit: amountTotal,
      credit: 0,
      reconciled: false,
      createdAt: new Date(),
    };

    const creditLine = {
      id: generateId("aml_crd"),
      moveId: billId,
      accountId: payableAccount,
      studentId: null,
      name: `Utang Vendor PO ${order.name} - ${order.partnerName}`,
      debit: 0,
      credit: amountTotal,
      reconciled: false,
      createdAt: new Date(),
    };

    // 3. Stock Picking & Moves (Receipt from supplier -> internal stock)
    const pickingId = generateId("pick");
    const stockPicking = {
      id: pickingId,
      schoolId: schoolId,
      name: `WH/IN/${billDate.slice(0, 4)}/${order.name.slice(-4)}`,
      pickingType: "incoming",
      origin: order.name,
      state: "done",
      scheduledDate: billDate,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const stockMoveLines = (order.lines || []).map((l: any) => ({
      id: generateId("sm"),
      pickingId: pickingId,
      productId: l.productId,
      locationId: "loc_supplier",
      locationDestId: "loc_internal",
      productQty: Number(l.productQty || 1),
      state: "done",
      createdAt: new Date(),
    }));

    // 4. Update PO status to 'done' and link moveId
    const statements: any[] = [
      db.insert(schema.accountMoves).values(vendorBillMove),
      db.insert(schema.accountMoveLines).values(debitLine),
      db.insert(schema.accountMoveLines).values(creditLine),
      db.insert(schema.stockPickings).values(stockPicking),
      ...(stockMoveLines.length > 0 ? [db.insert(schema.stockMoves).values(stockMoveLines)] : []),
      db
        .update(schema.purchaseOrders)
        .set({
          status: "done",
          moveId: billId,
          updatedAt: new Date(),
        })
        .where(eq(schema.purchaseOrders.id, params.orderId)),
    ];

    await db.batch(statements as [any, ...any[]]);

    return this.getVendorBillById(d1, billId);
  },

  /**
   * Pay Vendor Bill & Post Reconciliation Journal Entry.
   * Atomically compiled into a single db.batch([...]):
   * 1. Creates account_payments record.
   * 2. Creates payment balancing journal entry (Debit Accounts Payable, Credit Cash/Bank).
   * 3. Updates vendor bill (account_moves) paymentState -> 'paid', amountResidual -> 0.
   */
  async payVendorBill(d1: D1Database, params: PayVendorBillParams) {
    if (!params.billId) throw new Error("billId is required");
    const db = drizzle(d1, { schema });

    const bill = await this.getVendorBillById(d1, params.billId);
    if (!bill) throw new Error("Vendor Bill not found");
    if (bill.paymentState === "paid") {
      throw new Error("Vendor Bill is already paid");
    }

    const schoolId = params.schoolId || bill.schoolId;
    const paymentDate = params.paymentDate || new Date().toISOString().split("T")[0];
    const amountToPay = params.amount !== undefined ? Number(params.amount) : Number(bill.amountResidual || bill.amountTotal);
    const paymentMethod = params.paymentMethod || "bank_transfer";

    // Resolve COA accounts (Kas/Bank vs Utang Usaha)
    const accounts = await db
      .select()
      .from(schema.chartOfAccounts)
      .where(eq(schema.chartOfAccounts.schoolId, schoolId));

    const cashBankAcc =
      params.paymentAccountId ||
      (paymentMethod === "cash"
        ? accounts.find((a) => a.code === "1110" || a.code === "1-1101" || a.type === "asset")?.id || "coa_kas"
        : accounts.find((a) => a.code === "1120" || a.code === "1-1102" || a.type === "asset")?.id || "coa_bank");

    const payableAcc =
      params.payableAccountId ||
      accounts.find((a) => a.code === "21000" || a.code === "2-1102" || a.type === "liability")?.id ||
      accounts[0]?.id ||
      "coa_ap_vendor";

    // Resolve payment journal
    const journalsList = await db
      .select()
      .from(schema.journals)
      .where(eq(schema.journals.schoolId, schoolId));
    const payJournal =
      journalsList.find((j) => j.type === (paymentMethod === "cash" ? "cash" : "bank")) ||
      journalsList[0];
    const journalId = payJournal?.id || (paymentMethod === "cash" ? "jrn_cash" : "jrn_bank");

    const paymentId = generateId("pay");
    const paymentRecord = {
      id: paymentId,
      schoolId: schoolId,
      journalId: journalId,
      moveId: bill.id,
      studentId: null,
      name: `PAY/OUT/${paymentDate.slice(0, 4)}/${paymentId.slice(-4).toUpperCase()}`,
      paymentDate: paymentDate,
      amount: amountToPay,
      paymentMethod: paymentMethod,
      reference: `Pelunasan Tagihan Pemasok ${bill.name}`,
      state: "posted",
      createdAt: new Date(),
    };

    // Balancing journal entry for payment: Debit AP, Credit Cash/Bank
    const paymentMoveId = generateId("mv_pay");
    const paymentMove = {
      id: paymentMoveId,
      schoolId: schoolId,
      journalId: journalId,
      studentId: null,
      name: `BNK1/${paymentDate.slice(0, 4)}/${paymentMoveId.slice(-4).toUpperCase()}`,
      date: paymentDate,
      moveType: "entry",
      amountTotal: amountToPay,
      amountResidual: 0,
      state: "posted",
      paymentState: "paid",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const debitAPLine = {
      id: generateId("aml_pay_deb"),
      moveId: paymentMoveId,
      accountId: payableAcc,
      studentId: null,
      name: `Pelunasan Utang Vendor - ${bill.name}`,
      debit: amountToPay,
      credit: 0,
      reconciled: true,
      createdAt: new Date(),
    };

    const creditCashBankLine = {
      id: generateId("aml_pay_crd"),
      moveId: paymentMoveId,
      accountId: cashBankAcc,
      studentId: null,
      name: `Pengeluaran Kas/Bank - ${bill.name}`,
      debit: 0,
      credit: amountToPay,
      reconciled: true,
      createdAt: new Date(),
    };

    // Calculate new residual
    const newResidual = Math.max(0, Number(bill.amountResidual) - amountToPay);
    const newPaymentState = newResidual <= 0.001 ? "paid" : "partial";

    const statements: any[] = [
      db.insert(schema.accountPayments).values(paymentRecord),
      db.insert(schema.accountMoves).values(paymentMove),
      db.insert(schema.accountMoveLines).values(debitAPLine),
      db.insert(schema.accountMoveLines).values(creditCashBankLine),
      db
        .update(schema.accountMoves)
        .set({
          amountResidual: newResidual,
          paymentState: newPaymentState,
          updatedAt: new Date(),
        })
        .where(eq(schema.accountMoves.id, bill.id)),
    ];

    await db.batch(statements as [any, ...any[]]);

    return {
      payment: paymentRecord,
      bill: await this.getVendorBillById(d1, bill.id),
    };
  },
};

