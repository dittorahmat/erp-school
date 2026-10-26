import { describe, it, expect } from "vitest";
import app from "../src/index";

describe("Double-Entry Inventory API", () => {
  it("should respond with 200 on products list", async () => {
    const mockEnv = {
      DB: {
        prepare: () => ({
          bind: () => ({
            raw: async () => []
          })
        })
      }
    };
    const res = await app.request("/api/inventory/products", {}, mockEnv as any);
    expect(res.status).toBe(200);
    const data = (await res.json()) as { data: any[] };
    expect(data).toHaveProperty("data");
    expect(Array.isArray(data.data)).toBe(true);
  });

  it("should create a product via POST /api/inventory/products", async () => {
    const mockEnv = {
      DB: {
        prepare: () => ({
          bind: () => ({
            run: async () => ({ success: true })
          })
        })
      }
    };
    const payload = {
      schoolId: "sch_smp_01",
      name: "Buku Matematika Kelas 10",
      code: "BK-MAT10",
      type: "storable",
      uom: "pcs",
      standardPrice: 75000,
      listPrice: 85000,
      serialNumber: "SN-BK-001"
    };
    const res = await app.request(
      "/api/inventory/products",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      },
      mockEnv as any
    );
    expect(res.status).toBe(201);
    const body = (await res.json()) as { success: boolean; data: any };
    expect(body.success).toBe(true);
    expect(body.data.name).toBe("Buku Matematika Kelas 10");
    expect(body.data.code).toBe("BK-MAT10");
    expect(body.data.type).toBe("storable");
    expect(body.data.uom).toBe("pcs");
    expect(body.data.standardPrice).toBe(75000);
    expect(body.data.listPrice).toBe(85000);
    expect(body.data.serialNumber).toBe("SN-BK-001");
  });

  it("should return a product by ID via GET /api/inventory/products/:id", async () => {
    const mockProduct = {
      id: "prod_test_01",
      schoolId: "sch_smp_01",
      name: "Laptop Lab Komputer",
      code: "AST-LP01",
      type: "storable",
      uom: "unit",
      listPrice: 0,
      standardPrice: 12000000,
      serialNumber: "SN-DELL-9988",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    const mockEnv = {
      DB: {
        prepare: () => ({
          bind: () => ({
            raw: async () => [Object.values(mockProduct)]
          })
        })
      }
    };
    const res = await app.request("/api/inventory/products/prod_test_01", {}, mockEnv as any);
    expect(res.status).toBe(200);
    const body = (await res.json()) as { success: boolean; data: any };
    expect(body.success).toBe(true);
    expect(body.data).toBeDefined();
  });

  it("should return 404 when product is not found via GET /api/inventory/products/:id", async () => {
    const mockEnv = {
      DB: {
        prepare: () => ({
          bind: () => ({
            raw: async () => []
          })
        })
      }
    };
    const res = await app.request("/api/inventory/products/prod_unknown", {}, mockEnv as any);
    expect(res.status).toBe(404);
    const body = (await res.json()) as { error: string };
    expect(body.error).toBe("Product not found");
  });

  it("should update a product via PUT /api/inventory/products/:id", async () => {
    const updatedProduct = {
      id: "prod_test_01",
      schoolId: "sch_smp_01",
      name: "Laptop Lab Komputer Upgraded",
      code: "AST-LP01-UP",
      type: "storable",
      uom: "unit",
      listPrice: 0,
      standardPrice: 14000000,
      serialNumber: "SN-DELL-9988",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    const mockEnv = {
      DB: {
        prepare: () => ({
          bind: () => ({
            run: async () => ({ success: true }),
            raw: async () => [Object.values(updatedProduct)]
          })
        })
      }
    };
    const res = await app.request(
      "/api/inventory/products/prod_test_01",
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Laptop Lab Komputer Upgraded",
          standardPrice: 14000000
        })
      },
      mockEnv as any
    );
    expect(res.status).toBe(200);
    const body = (await res.json()) as { success: boolean; data: any };
    expect(body.success).toBe(true);
  });

  it("should delete a product via DELETE /api/inventory/products/:id", async () => {
    const mockEnv = {
      DB: {
        prepare: () => ({
          bind: () => ({
            run: async () => ({ success: true })
          })
        })
      }
    };
    const res = await app.request(
      "/api/inventory/products/prod_test_01",
      { method: "DELETE" },
      mockEnv as any
    );
    expect(res.status).toBe(200);
    const body = (await res.json()) as { success: boolean; data: any };
    expect(body.success).toBe(true);
    expect(body.data.id).toBe("prod_test_01");
  });
});
