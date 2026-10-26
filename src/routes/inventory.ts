import { Hono } from "hono";
import { stockTransfer } from "../domain/inventory";
import type { Bindings } from "../index";

export const inventoryRouter = new Hono<{ Bindings: Bindings }>();

// Products (Buku, Seragam, ATK, Aset)
inventoryRouter.get("/products", async (c) => {
  const list = await stockTransfer.getProducts(c.env.DB);
  return c.json({ data: list });
});

inventoryRouter.get("/products/:id", async (c) => {
  const id = c.req.param("id");
  const product = await stockTransfer.getProductById(c.env.DB, id);
  if (!product) {
    return c.json({ error: "Product not found" }, 404);
  }
  return c.json({ success: true, data: product });
});

inventoryRouter.post("/products", async (c) => {
  const body = await c.req.json();
  const product = await stockTransfer.createProduct(c.env.DB, body);
  return c.json({ success: true, data: product }, 201);
});

inventoryRouter.put("/products/:id", async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json();
  const product = await stockTransfer.updateProduct(c.env.DB, id, body);
  if (!product) {
    return c.json({ error: "Product not found" }, 404);
  }
  return c.json({ success: true, data: product });
});

inventoryRouter.delete("/products/:id", async (c) => {
  const id = c.req.param("id");
  const result = await stockTransfer.deleteProduct(c.env.DB, id);
  return c.json({ success: true, data: result });
});

// Stock Transfers / Operations (Penerimaan Vendor, Pengeluaran ke Siswa)
inventoryRouter.get("/pickings", async (c) => {
  const pickings = await stockTransfer.getPickings(c.env.DB);
  return c.json({ data: pickings });
});

inventoryRouter.post("/pickings", async (c) => {
  const body = await c.req.json();
  const picking = await stockTransfer.executeTransfer(c.env.DB, body);
  return c.json({ success: true, data: picking }, 201);
});

// Stock Opname / Inventory Summary
inventoryRouter.get("/stock-summary", async (c) => {
  const summary = await stockTransfer.getStockSummary(c.env.DB);
  return c.json(summary);
});
