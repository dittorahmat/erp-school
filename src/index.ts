import { Hono } from "hono";
import { cors } from "hono/cors";
import { createAuth } from "./auth";
import { academicRouter } from "./routes/academic";
import { studentRouter } from "./routes/students";
import { attendanceRouter } from "./routes/attendance";
import { examRouter } from "./routes/exams";
import { financeRouter } from "./routes/finance";
import { inventoryRouter } from "./routes/inventory";
import { odooShellHtml } from "./views/shell";

export type Bindings = {
  DB: D1Database;
  STORAGE: R2Bucket;
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

// Full Odoo-Style SPA Shell (Interactive Navigation, Modals, Dynamic CRUD & Switch-Account/Logout)
app.get("*", (c) => {
  return c.html(odooShellHtml);
});

export default app;
