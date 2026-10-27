import { Hono } from "hono";
import { cors } from "hono/cors";
import { createAuth } from "./auth";
import { academicRouter } from "./routes/academic";
import { studentRouter } from "./routes/students";
import { attendanceRouter } from "./routes/attendance";
import { examRouter } from "./routes/exams";
import { financeRouter } from "./routes/finance";
import { inventoryRouter } from "./routes/inventory";
import admissionRouter from "./routes/admission";
import { libraryRouter } from "./routes/library";
import { portalRouter } from "./routes/portal";
import { payrollRouter } from "./routes/payroll";
import { odooShellHtml } from "./views/shell";

export type Bindings = {
  DB: D1Database;
  STORAGE: R2Bucket;
  ASSETS?: Fetcher;
  BETTER_AUTH_SECRET?: string;
  BETTER_AUTH_URL?: string;
};

const app = new Hono<{ Bindings: Bindings }>();

app.use("*", cors());

// API Sub-Routers
app.route("/api/academic", academicRouter);
app.route("/api/students", studentRouter);
app.route("/api/attendance", attendanceRouter);
app.route("/api/exams", examRouter);
app.route("/api/finance", financeRouter);
app.route("/api/inventory", inventoryRouter);
app.route("/api/admission", admissionRouter);
app.route("/api/library", libraryRouter);
app.route("/api/portal", portalRouter);
app.route("/api/payroll", payrollRouter);

// Healthcheck
app.get("/api/health", (c) => {
  return c.json({
    status: "ok",
    service: "erp-school-monolith",
    timestamp: new Date().toISOString()
  });
});

// Better-Auth handler
app.on(["POST", "GET"], "/api/auth/**", async (c) => {
  const auth = createAuth(c.env.DB, c.env.BETTER_AUTH_SECRET);
  return auth.handler(c.req.raw);
});

// Single Page Application Root & Static Assets Handler:
// In Cloudflare Workers with Static Assets binding (env.ASSETS), delegate non-API requests
// to the compiled React Vite SPA in dist/client. Fallback to shell template during test mock env.
app.get("*", async (c) => {
  if (c.env?.ASSETS) {
    return c.env.ASSETS.fetch(c.req.raw);
  }
  return c.html(odooShellHtml);
});

export default app;
