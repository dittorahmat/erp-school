import { Hono } from "hono";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "../db/schema";
import { desc } from "drizzle-orm";
import type { Bindings } from "../index";
import { generateId } from "../lib/utils";

export const inventoryRouter = new Hono<{ Bindings: Bindings }>();

// --------------------------------------------------------------------------
// Products (Buku, Seragam, ATK, Aset)
// --------------------------------------------------------------------------
inventoryRouter.get("/products", async (c) => {
  const db = drizzle(c.env.DB, { schema });
  const list = await db.select().from(schema.products).orderBy(schema.products.name);
  return c.json({ data: list });
});

inventoryRouter.post("/products", async (c) => {
  const body = await c.req.json();
  const db = drizzle(c.env.DB, { schema });
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
    updatedAt: new Date()
  };
  await db.insert(schema.products).values(newProduct);
  return c.json({ success: true, data: newProduct }, 201);
});

// --------------------------------------------------------------------------
// Stock Transfers / Operations (Penerimaan Vendor, Pengeluaran ke Siswa)
// --------------------------------------------------------------------------
inventoryRouter.get("/pickings", async (c) => {
  const db = drizzle(c.env.DB, { schema });
  const pickings = await db.select().from(schema.stockPickings).orderBy(desc(schema.stockPickings.createdAt));
  return c.json({ data: pickings });
});

// Create Stock Transfer with Double-Entry Stock Movement
inventoryRouter.post("/pickings", async (c) => {
  const body = await c.req.json();
  const db = drizzle(c.env.DB, { schema });
  const pickingId = body.id || generateId("pick");

  const newPicking = {
    id: pickingId,
    schoolId: body.schoolId,
    name: body.name || `WH/${body.pickingType?.toUpperCase() || "MOVE"}/${Date.now().toString().slice(-4)}`,
    pickingType: body.pickingType || "internal", // incoming, outgoing, internal
    origin: body.origin || null,
    state: "done",
    scheduledDate: body.scheduledDate || new Date().toISOString().split("T")[0],
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const statements: any[] = [db.insert(schema.stockPickings).values(newPicking)];

  if (body.moves && Array.isArray(body.moves) && body.moves.length > 0) {
    const movesToInsert = body.moves.map((m: any) => ({
      id: generateId("sm"),
      pickingId: pickingId,
      productId: m.productId,
      locationId: m.locationId, // source
      locationDestId: m.locationDestId, // destination
      productQty: Number(m.productQty),
      state: "done",
      createdAt: new Date()
    }));
    statements.push(db.insert(schema.stockMoves).values(movesToInsert));
  }

  await db.batch(statements as [any, ...any[]]);

  return c.json({ success: true, data: newPicking }, 201);
});

// --------------------------------------------------------------------------
// Stock Opname / Inventory Summary
// --------------------------------------------------------------------------
inventoryRouter.get("/stock-summary", async (c) => {
  const db = drizzle(c.env.DB, { schema });
  const moves = await db.select().from(schema.stockMoves);
  const productsList = await db.select().from(schema.products);

  return c.json({
    totalProducts: productsList.length,
    totalStockMoves: moves.length,
    status: "active"
  });
});
