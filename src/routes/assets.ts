import { Hono } from "hono";
import { assetEngine } from "../domain";
import type { Bindings } from "../index";

export const assetRouter = new Hono<{ Bindings: Bindings }>();

// Fixed Assets list
assetRouter.get("/", async (c) => {
  const schoolId = c.req.query("schoolId");
  const assets = await assetEngine.getAssets(c.env.DB, schoolId);
  return c.json({ data: assets });
});

// Fixed Asset by ID with depreciation schedule lines
assetRouter.get("/:id", async (c) => {
  const id = c.req.param("id");
  const asset = await assetEngine.getAssetById(c.env.DB, id);
  if (!asset) {
    return c.json({ error: "Fixed asset not found" }, 404);
  }
  return c.json({ data: asset });
});

// Register new Fixed Asset
assetRouter.post("/", async (c) => {
  const body = await c.req.json();
  const schoolId = body.schoolId || c.req.header("x-school-id") || c.req.query("schoolId");

  if (!schoolId) {
    return c.json({ error: "schoolId is required" }, 400);
  }
  if (!body.name || !body.code || !body.purchaseDate || !body.purchaseValue || !body.durationMonths) {
    return c.json(
      { error: "name, code, purchaseDate, purchaseValue, and durationMonths are required" },
      400
    );
  }

  try {
    const asset = await assetEngine.registerAsset(c.env.DB, {
      ...body,
      schoolId,
      purchaseValue: Number(body.purchaseValue),
      salvageValue: Number(body.salvageValue || 0),
      durationMonths: Number(body.durationMonths),
    });
    return c.json({ success: true, data: asset }, 201);
  } catch (err: any) {
    return c.json({ error: err.message }, 400);
  }
});

// Query pending / draft depreciation lines across assets
assetRouter.get("/depreciation/lines", async (c) => {
  const schoolId = c.req.query("schoolId") || c.req.header("x-school-id");
  if (!schoolId) {
    return c.json({ error: "schoolId is required" }, 400);
  }

  const assetId = c.req.query("assetId");
  const status = c.req.query("status") as "draft" | "posted" | undefined;
  const cutoffDate = c.req.query("cutoffDate");

  const lines = await assetEngine.getDepreciationLines(c.env.DB, schoolId, {
    assetId,
    status,
    cutoffDate,
  });
  return c.json({ data: lines });
});

// Post depreciation run (atomic batch to double-entry moves)
assetRouter.post("/depreciation/post", async (c) => {
  const body = await c.req.json();
  const schoolId = body.schoolId || c.req.header("x-school-id") || c.req.query("schoolId");

  if (!schoolId) {
    return c.json({ error: "schoolId is required" }, 400);
  }

  try {
    const result = await assetEngine.postDepreciation(c.env.DB, {
      schoolId,
      assetId: body.assetId,
      cutoffDate: body.cutoffDate,
      lineId: body.lineId,
    });
    return c.json({ success: true, data: result }, 200);
  } catch (err: any) {
    return c.json({ error: err.message }, 400);
  }
});
