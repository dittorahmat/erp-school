import { Hono } from "hono";
import { cors } from "hono/cors";
import { createAuth } from "./auth";
import { academicRouter } from "./routes/academic";
import { studentRouter } from "./routes/students";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "./db/schema";
import { eq } from "drizzle-orm";

export type Bindings = {
  DB: D1Database;
  STORAGE: R2Bucket;
  BETTER_AUTH_SECRET?: string;
  BETTER_AUTH_URL?: string;
};

const app = new Hono<{ Bindings: Bindings }>();

app.use("*", cors());

// Routes
app.route("/api/academic", academicRouter);
app.route("/api/students", studentRouter);

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

// UI: Base Odoo Shell HTML Template
app.get("*", async (c) => {
  const html = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ERP Sekolah - Odoo Edition</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <style>
    :root {
      --odoo-purple: #714B67;
      --odoo-purple-dark: #583950;
      --odoo-teal: #00A09D;
      --odoo-gray-bg: #F9F9FA;
    }
  </style>
</head>
<body class="bg-slate-50 font-sans text-slate-800 antialiased min-h-screen flex flex-col">
  <!-- Odoo Top Navbar -->
  <header class="bg-[#714B67] text-white h-12 flex items-center justify-between px-4 shadow-sm z-50">
    <div class="flex items-center space-x-4">
      <!-- App Switcher Icon -->
      <button id="btn-app-switcher" class="hover:bg-[#583950] p-2 rounded transition flex items-center justify-center">
        <i class="fa-solid fa-grip text-lg"></i>
      </button>
      <span class="font-bold tracking-tight text-lg flex items-center gap-2">
        <i class="fa-solid fa-graduation-cap"></i> ERP Sekolah
      </span>
      <nav class="hidden md:flex space-x-1 text-sm pl-4">
        <a href="#students" class="px-3 py-1.5 rounded hover:bg-[#583950] transition">Siswa</a>
        <a href="#academics" class="px-3 py-1.5 rounded hover:bg-[#583950] transition">Akademik</a>
        <a href="#finance" class="px-3 py-1.5 rounded hover:bg-[#583950] transition">Keuangan (SPP)</a>
        <a href="#inventory" class="px-3 py-1.5 rounded hover:bg-[#583950] transition">Inventaris</a>
      </nav>
    </div>
    
    <div class="flex items-center space-x-3 text-sm">
      <span class="bg-[#583950] px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5">
        <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> SMA Harapan Bangsa
      </span>
      <div class="flex items-center space-x-2 border-l border-purple-400/30 pl-3">
        <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop" class="w-7 h-7 rounded-full border border-white/50" alt="Avatar">
        <span class="font-medium hidden sm:inline" id="user-display-name">Superadmin</span>
      </div>
    </div>
  </header>

  <!-- Odoo Control Panel -->
  <section class="bg-white border-b border-slate-200 px-6 py-2.5 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xs">
    <div class="flex items-center space-x-3">
      <button class="bg-[#714B67] hover:bg-[#583950] text-white px-3.5 py-1.5 rounded text-sm font-medium transition shadow-xs flex items-center gap-1.5">
        <i class="fa-solid fa-plus text-xs"></i> Buat Baru
      </button>
      <h1 class="text-xl font-bold text-slate-800" id="current-view-title">Dashboard Operasional</h1>
    </div>

    <!-- Search & Filter Bar -->
    <div class="flex items-center space-x-2 flex-1 max-w-lg justify-end">
      <div class="relative w-full">
        <i class="fa-solid fa-magnifying-glass absolute left-3 top-2.5 text-slate-400 text-sm"></i>
        <input type="text" placeholder="Cari data, NIS, nama siswa..." class="w-full bg-slate-100 focus:bg-white text-sm pl-9 pr-4 py-1.5 rounded border border-slate-300 focus:border-[#714B67] focus:outline-none transition">
      </div>
      <div class="flex items-center bg-slate-100 rounded border border-slate-300 text-slate-600 text-sm">
        <button class="px-2.5 py-1.5 hover:bg-slate-200 rounded-l transition" title="Filter"><i class="fa-solid fa-filter"></i></button>
        <button class="px-2.5 py-1.5 hover:bg-slate-200 transition border-l border-slate-300" title="Group By"><i class="fa-solid fa-layer-group"></i></button>
        <button class="px-2.5 py-1.5 hover:bg-slate-200 rounded-r transition border-l border-slate-300" title="Favorites"><i class="fa-solid fa-star"></i></button>
      </div>

      <!-- View Switcher -->
      <div class="flex items-center bg-slate-100 rounded border border-slate-300 text-slate-600 text-sm">
        <button class="px-2.5 py-1.5 bg-[#714B67] text-white rounded-l transition" title="List View"><i class="fa-solid fa-list"></i></button>
        <button class="px-2.5 py-1.5 hover:bg-slate-200 transition border-l border-slate-300" title="Kanban View"><i class="fa-solid fa-table-cells-large"></i></button>
        <button class="px-2.5 py-1.5 hover:bg-slate-200 rounded-r transition border-l border-slate-300" title="Activity View"><i class="fa-solid fa-clock"></i></button>
      </div>
    </div>
  </section>

  <!-- Main Content Shell -->
  <main class="flex-1 p-6 max-w-7xl mx-auto w-full">
    <div class="grid grid-cols-1 md:grid-cols-4 gap-5 mb-6">
      <div class="bg-white p-5 rounded-lg border border-slate-200 shadow-xs flex items-center justify-between">
        <div>
          <p class="text-xs uppercase font-bold text-slate-400">Total Siswa Aktif</p>
          <p class="text-2xl font-black text-slate-800 mt-1">50</p>
          <p class="text-xs text-emerald-600 mt-1"><i class="fa-solid fa-arrow-up"></i> 100% Terdaftar</p>
        </div>
        <div class="w-12 h-12 rounded-lg bg-purple-50 text-[#714B67] flex items-center justify-center text-xl">
          <i class="fa-solid fa-user-graduate"></i>
        </div>
      </div>

      <div class="bg-white p-5 rounded-lg border border-slate-200 shadow-xs flex items-center justify-between">
        <div>
          <p class="text-xs uppercase font-bold text-slate-400">Kehadiran Hari Ini</p>
          <p class="text-2xl font-black text-slate-800 mt-1">96.8%</p>
          <p class="text-xs text-emerald-600 mt-1"><i class="fa-solid fa-check"></i> 48 Hadir / 2 Izin</p>
        </div>
        <div class="w-12 h-12 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center text-xl">
          <i class="fa-solid fa-calendar-check"></i>
        </div>
      </div>

      <div class="bg-white p-5 rounded-lg border border-slate-200 shadow-xs flex items-center justify-between">
        <div>
          <p class="text-xs uppercase font-bold text-slate-400">Invoice SPP Terbayar</p>
          <p class="text-2xl font-black text-slate-800 mt-1">Rp 22.500.000</p>
          <p class="text-xs text-slate-500 mt-1">45 dari 50 Siswa</p>
        </div>
        <div class="w-12 h-12 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl">
          <i class="fa-solid fa-file-invoice-dollar"></i>
        </div>
      </div>

      <div class="bg-white p-5 rounded-lg border border-slate-200 shadow-xs flex items-center justify-between">
        <div>
          <p class="text-xs uppercase font-bold text-slate-400">Stok Barang Gudang</p>
          <p class="text-2xl font-black text-slate-800 mt-1">142 Item</p>
          <p class="text-xs text-amber-600 mt-1"><i class="fa-solid fa-boxes-stacked"></i> Seragam & Buku</p>
        </div>
        <div class="w-12 h-12 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center text-xl">
          <i class="fa-solid fa-warehouse"></i>
        </div>
      </div>
    </div>

    <!-- Active Monolith Status Card -->
    <div class="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
      <div class="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
        <h2 class="font-bold text-slate-800 flex items-center gap-2">
          <i class="fa-solid fa-server text-purple-700"></i> Status Cloudflare Edge Monolith
        </h2>
        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
          Online & Healthy
        </span>
      </div>
      <div class="p-6 text-sm text-slate-600 space-y-3">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="p-3 bg-slate-50 rounded border border-slate-200">
            <span class="font-semibold block text-slate-700">Cloudflare D1 Database</span>
            <span class="text-xs text-slate-500">Binding: DB (erp-school-db APAC)</span>
          </div>
          <div class="p-3 bg-slate-50 rounded border border-slate-200">
            <span class="font-semibold block text-slate-700">Cloudflare R2 Storage</span>
            <span class="text-xs text-slate-500">Binding: STORAGE (erp-school-storage)</span>
          </div>
        </div>
        <div class="p-3 bg-purple-50 rounded border border-purple-100 text-purple-900 text-xs">
          <strong>Better-Auth Session Ready:</strong> Endpoint otentikasi aktif di <code>/api/auth/*</code> dengan RBAC multi-role terintegrasi.
        </div>
      </div>
    </div>
  </main>
</body>
</html>`;
  return c.html(html);
});

export default app;
