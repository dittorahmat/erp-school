import type { D1Database } from "@cloudflare/workers-types";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "../db/schema";
import { desc } from "drizzle-orm";
import { generateId } from "../lib/utils";

export interface StockMoveInput {
  productId: string;
  locationId: string;
  locationDestId: string;
  productQty: number;
}

export interface ExecuteStockTransferParams {
  id?: string;
  schoolId: string;
  name?: string;
  pickingType?: "incoming" | "outgoing" | "internal";
  origin?: string | null;
  scheduledDate?: string;
  moves?: StockMoveInput[];
}

/**
 * Deep Stock Transfer Module.
 * Encapsulates double-entry physical inventory moves and atomic batch persistence.
 */
export const stockTransfer = {
  async getProducts(d1: D1Database) {
    const db = drizzle(d1, { schema });
    return db.select().from(schema.products).orderBy(schema.products.name);
  },

  async createProduct(d1: D1Database, body: any) {
    const db = drizzle(d1, { schema });
    const newProduct = {
      id: body.id || generateId("prod"),
      schoolId: body.schoolId,
      name: body.name,
      code: body.code,
      type: body.type || "storable",
      uom: body.uom || "pcs",
      listPrice: body.listPrice || 0,
      standardPrice: body.standardPrice || 0,
      serialNumber: body.serialNumber || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    await db.insert(schema.products).values(newProduct);
    return newProduct;
  },

  async getPickings(d1: D1Database) {
    const db = drizzle(d1, { schema });
    return db.select().from(schema.stockPickings).orderBy(desc(schema.stockPickings.createdAt));
  },

  async executeTransfer(d1: D1Database, params: ExecuteStockTransferParams) {
    const db = drizzle(d1, { schema });
    const pickingId = params.id || generateId("pick");

    const newPicking = {
      id: pickingId,
      schoolId: params.schoolId,
      name: params.name || `WH/${params.pickingType?.toUpperCase() || "MOVE"}/${Date.now().toString().slice(-4)}`,
      pickingType: params.pickingType || "internal",
      origin: params.origin || null,
      state: "done",
      scheduledDate: params.scheduledDate || new Date().toISOString().split("T")[0],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const statements: any[] = [db.insert(schema.stockPickings).values(newPicking)];

    if (params.moves && Array.isArray(params.moves) && params.moves.length > 0) {
      const movesToInsert = params.moves.map((m) => ({
        id: generateId("sm"),
        pickingId: pickingId,
        productId: m.productId,
        locationId: m.locationId,
        locationDestId: m.locationDestId,
        productQty: Number(m.productQty),
        state: "done",
        createdAt: new Date(),
      }));
      statements.push(db.insert(schema.stockMoves).values(movesToInsert));
    }

    await db.batch(statements as [any, ...any[]]);
    return newPicking;
  },

  async getStockSummary(d1: D1Database) {
    const db = drizzle(d1, { schema });
    const moves = await db.select().from(schema.stockMoves);
    const productsList = await db.select().from(schema.products);

    return {
      totalProducts: productsList.length,
      totalStockMoves: moves.length,
      status: "active",
    };
  },
};
