import type { D1Database } from "@cloudflare/workers-types";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "../db/schema";
import { desc, eq } from "drizzle-orm";
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
};
