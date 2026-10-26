import type { D1Database } from "@cloudflare/workers-types";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "../db/schema";
import { desc, eq } from "drizzle-orm";
import { compactDefined, generateId } from "../lib/utils";

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

export interface ProductInput {
  id?: string;
  schoolId: string;
  name: string;
  code: string;
  type?: "storable" | "consumable" | "service";
  uom?: string;
  listPrice?: number;
  standardPrice?: number;
  serialNumber?: string | null;
}

export type UpdateProductInput = Partial<Omit<ProductInput, "id">>;

/**
 * Deep Stock Transfer Module.
 * Encapsulates double-entry physical inventory moves and atomic batch persistence.
 */
export const stockTransfer = {
  async getProducts(d1: D1Database) {
    const db = drizzle(d1, { schema });
    return db.select().from(schema.products).orderBy(schema.products.name);
  },

  async getProductById(d1: D1Database, id: string) {
    const db = drizzle(d1, { schema });
    const results = await db.select().from(schema.products).where(eq(schema.products.id, id)).limit(1);
    return results[0] || null;
  },

  async createProduct(d1: D1Database, body: ProductInput) {
    const db = drizzle(d1, { schema });
    const newProduct = {
      id: body.id || generateId("prod"),
      schoolId: body.schoolId,
      name: body.name,
      code: body.code,
      type: body.type || "storable",
      uom: body.uom || "pcs",
      listPrice: body.listPrice !== undefined ? Number(body.listPrice) : 0,
      standardPrice: body.standardPrice !== undefined ? Number(body.standardPrice) : 0,
      serialNumber: body.serialNumber || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    await db.insert(schema.products).values(newProduct);
    return newProduct;
  },

  async updateProduct(d1: D1Database, id: string, data: UpdateProductInput) {
    const db = drizzle(d1, { schema });
    const updateData = {
      ...compactDefined({
        name: data.name,
        code: data.code,
        type: data.type,
        uom: data.uom,
        listPrice: data.listPrice !== undefined ? Number(data.listPrice) : undefined,
        standardPrice: data.standardPrice !== undefined ? Number(data.standardPrice) : undefined,
        serialNumber: data.serialNumber,
        schoolId: data.schoolId,
      }),
      updatedAt: new Date(),
    };

    await db.update(schema.products).set(updateData).where(eq(schema.products.id, id));
    return this.getProductById(d1, id);
  },

  async deleteProduct(d1: D1Database, id: string) {
    const db = drizzle(d1, { schema });
    await db.delete(schema.products).where(eq(schema.products.id, id));
    return { success: true, id };
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
