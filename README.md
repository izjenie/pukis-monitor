# Pukis Monitoring

Aplikasi monitoring penjualan & pengeluaran untuk bisnis retail makanan (multi-outlet). Fokus utamanya adalah pencatatan harian yang cepat (mobile-first) dan dashboard untuk analisis performa (harian & MTD) termasuk ringkasan yang mudah dibagikan.

## Fungsi Utama

- **Input penjualan harian per outlet**
  - Multi channel pembayaran: `cash`, `qris`, `grab`, `gofood`, `shopee`, `tiktok`.
  - Tracking stok/produksi: `totalSold`, `remaining`, `returned`, `totalProduction`, opsional `soldOutTime`.
  - Validasi: `totalProduction >= totalSold` dan mencegah duplikasi data penjualan untuk kombinasi `date + outletId`.

- **Manajemen outlet**
  - CRUD outlet.
  - Menyimpan `cogsPerPiece` untuk kalkulasi margin.

- **Manajemen pengeluaran**
  - CRUD pengeluaran dengan tipe: `harian`, `bulanan`, `gaji`.
  - Mendukung `proofUrl` untuk bukti (foto/PDF) bila diintegrasikan dengan storage.

- **Dashboard & analitik**
  - **Dashboard Harian**: list & ringkasan penjualan dengan kalkulasi revenue, COGS, gross margin, dan persentasenya.
  - **Dashboard MTD**: agregasi berdasarkan periode MTD custom (tanggal 10 s/d 9 bulan berikutnya).

- **Autentikasi (Replit OIDC) + session**
  - Login via OpenID Connect (Replit Auth).
  - Session disimpan di PostgreSQL table `sessions`.

## Arsitektur (Ringkas)

### Komponen

- **Backend HTTP (Express)**
  - Entry point:
    - Development: `server/index-dev.ts` (Express + Vite middleware).
    - Production: `server/index-prod.ts` (Express + static assets build).
  - Aplikasi utama: `server/app.ts`.
  - Routing API: `server/routes.ts` (semua endpoint `'/api/*'`).

- **Database**
  - PostgreSQL (serverless-ready), koneksi via `@neondatabase/serverless`.
  - ORM: Drizzle (`drizzle-orm`).
  - Schema + tipe + Zod validation: `shared/schema.ts`.
  - DB init: `server/db.ts`.

- **Data Access Layer (Storage)**
  - Implementasi: `server/storage.ts`.
  - Bertanggung jawab untuk query DB + kalkulasi turunan (mis. `totalRevenue`, `grossMargin`).

- **Frontend (Client)**
  - UI berbasis React + Tailwind + komponen shadcn.
  - Halaman utama berada di `app/` (App Router).

### Alur Request (High-level)

1. **Client** memanggil endpoint `'/api/*'`.
2. Request masuk ke **Express** (`server/app.ts`).
3. Middleware auth (`setupAuth` + `isAuthenticated` di `server/replitAuth.ts`) memastikan session valid.
4. Handler di `server/routes.ts` melakukan:
   - validasi input via schema Zod (`insertSalesSchema`, `insertExpenseSchema`, dll),
   - memanggil `storage` untuk operasi DB.
5. `storage` menggunakan Drizzle + schema untuk query PostgreSQL.
6. Response JSON dikembalikan ke client.

### Kalkulasi Bisnis

- `totalRevenue = cash + qris + grab + gofood + shopee + tiktok`
- `cogsSold = totalSold * outlet.cogsPerPiece`
- `grossMargin = totalRevenue - cogsSold`
- `grossMarginPercentage = grossMargin / totalRevenue * 100` (jika revenue > 0)

### MTD (Month-to-Date) Custom

Periode MTD ditentukan oleh fungsi `getMTDPeriod()` di `server/storage.ts`:
- Jika tanggal hari ini `>= 10`: periode adalah tanggal 10 bulan ini s/d tanggal 9 bulan berikutnya.
- Jika tanggal hari ini `< 10`: periode adalah tanggal 10 bulan sebelumnya s/d tanggal 9 bulan ini.

## Endpoint API (Backend Express)

Semua endpoint di bawah umumnya membutuhkan auth (`isAuthenticated`).

- **Auth**
  - `GET /api/auth/user`
  - `GET /api/login`
  - `GET /api/callback`
  - `GET /api/logout`

- **Outlets**
  - `GET /api/outlets`
  - `GET /api/outlets/:id`
  - `POST /api/outlets`
  - `PATCH /api/outlets/:id`
  - `DELETE /api/outlets/:id`

- **Sales**
  - `GET /api/sales?date=YYYY-MM-DD&outletId=...`
  - `GET /api/sales/mtd?date=YYYY-MM-DD&outletId=...`
  - `GET /api/sales/mtd-summary?date=YYYY-MM-DD`
  - `GET /api/sales/:id`
  - `POST /api/sales`
  - `PATCH /api/sales/:id`
  - `DELETE /api/sales/:id`

- **Expenses**
  - `GET /api/expenses?date=YYYY-MM-DD&outletId=...&type=harian|bulanan`
  - `GET /api/expenses/:id`
  - `POST /api/expenses`
  - `PATCH /api/expenses/:id`
  - `DELETE /api/expenses/:id`

## Struktur Folder Penting

- `server/`
  - `app.ts`: setup Express, middleware, error handling.
  - `routes.ts`: definisi endpoint REST.
  - `replitAuth.ts`: OIDC + session + middleware auth.
  - `db.ts`: koneksi database.
  - `storage.ts`: query DB + kalkulasi.

- `shared/`
  - `schema.ts`: Drizzle schema + Zod schema + tipe.

- `app/`
  - halaman-halaman UI (App Router), termasuk:
    - `page.tsx` (input penjualan)
    - `dashboard-harian/`, `dashboard-mtd/`, `expenses/`, `outlets/`, `admin-login/`, `super-admin/`

- `client/`
  - asset & entry untuk UI (Vite dev server / build).

## Konfigurasi Environment Variable

Minimal yang dibutuhkan agar server jalan:

- `DATABASE_URL` (PostgreSQL connection string)
- `SESSION_SECRET` (string random minimal 32 char)
- `REPL_ID` (client id untuk Replit OIDC)
- `ISSUER_URL` (optional, default `https://replit.com/oidc`)
- `PORT` (optional, default `5000`)

## Scripts (package.json)

- `npm run dev`: jalankan mode dev (`server/index-dev.ts`)
- `npm run build`: build client + bundle server ke `dist/index.js`
- `npm start`: jalankan produksi (`node dist/index.js`)
- `npm run check`: typecheck
- `npm run db:push`: push schema DB (drizzle-kit)

## Dokumen Terkait

- `deployment.md`: panduan deploy ke Ubuntu + Nginx + PM2.
- `replit.md`: catatan arsitektur lebih panjang (lebih detail).
