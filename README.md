# SIPJOK — Sistem Informasi Pembelajaran PJOK

Sistem manajemen pembelajaran untuk guru PJOK (Pendidikan Jasmani, Olahraga, dan Kesehatan) berstandar Kurikulum Merdeka: profil guru, jadwal & absensi, jurnal mengajar, perencanaan pembelajaran (ATP & Modul Ajar), asesmen (bank soal, nilai, KKTP), dokumen kurikulum, kalender akademik, hingga ekspor PDF/Word/Excel.

## Status Fitur

**Implementasi penuh (16 halaman, 14 entitas):**

| Modul | Fitur |
|---|---|
| Dashboard | Statistik & grafik ringkasan |
| Profil & Identitas | Profil Guru, Kurikulum Sekolah (unggah dokumen), Kalender Akademik |
| Jadwal & Absensi | Jadwal Kelas, Absensi Siswa, Jurnal Mengajar, Laporan Absensi, Laporan Jurnal |
| Perencanaan | ATP Intrakurikuler, Modul Ajar (wizard 7 langkah) |
| Asesmen | Bank Soal, Daftar Nilai, Kriteria KKTP, Analisis Evaluasi |
| Siswa | Manajemen data siswa per kelas |

**Roadmap (belum diimplementasikan — menu menampilkan placeholder):**
Kokurikuler (Jadwal, Program, Modul), Ekstrakurikuler (Program, Jadwal, Catatan Lomba), Buku Kunjungan, Refleksi Siswa. Fitur-fitur ini belum pernah diimplementasikan sejak aplikasi referensi dan berada di luar scope migrasi Railway. Lihat `docs/superpowers/specs/` jika ingin menjadwalkan pembangunannya.

## Arsitektur

- **Frontend:** React 18 + Vite, shadcn/ui (Radix) + Tailwind CSS, React Router, hooks kustom di `client/src/hooks/`.
- **Backend:** Express + TypeScript (`server/`), REST API di bawah `/api`, Drizzle ORM + PostgreSQL.
- **Autentikasi:** internal — login email+password (bcrypt) di Express, sesi JWT (`server/routes/auth.ts`); frontend menyimpan token di localStorage (`client/src/lib/api.ts`).
- **Database:** PostgreSQL (di VPS atau Railway) — vendor-independent. Skema 14 tabel di `shared/schema.ts`.
- **File upload:** disimpan di disk server (`POST /api/uploads`, multer) — lampiran modul ajar, dokumen kurikulum, foto profil; disajikan dari `/uploads`.
- **Keamanan:** rate limit 100 req/menit per IP + limiter khusus login, validasi Zod per endpoint, error handler terpusat, semua data difilter per user terautentikasi, `trust proxy` untuk berada di balik Nginx.

```
client/   → React SPA (build → dist/public, disajikan Express)
server/   → Express API + static serving (bundle → dist/index.js)
shared/   → Skema Drizzle + tipe Zod (dipakai client & server)
```

## Menjalankan Secara Lokal

1. **Prasyarat:** Node.js ≥ 20, PostgreSQL lokal atau Railway.

2. **Instalasi:**
   ```bash
   npm install
   cp .env.example .env   # lalu isi nilai asli
   ```

3. **Variabel lingkungan** (lihat `.env.example`):
   - `DATABASE_URL` — koneksi PostgreSQL
   - `JWT_SECRET` — kunci tanda-tangan sesi (generate: `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`)
   - `ADMIN_EMAIL`, `ADMIN_PASSWORD` — untuk membuat user login pertama
   - `VITE_APP_NAME`, `VITE_APP_VERSION`, `VITE_API_TIMEOUT`
   - `CORS_ORIGIN` (opsional), `UPLOAD_DIR` (opsional), `PORT` (default 5000)

4. **Skema database + user pertama** (wajib sebelum pertama kali menjalankan):
   ```bash
   npm run db:push          # push skema Drizzle ke DATABASE_URL
   psql "$DATABASE_URL" -f migrations/add-indexes.sql   # 36 indeks performa
   ADMIN_EMAIL=... ADMIN_PASSWORD=... npm run seed:admin   # user login pertama
   ```

5. **Development:**
   ```bash
   npm run dev              # http://localhost:5000 (Vite HMR via middleware)
   ```

6. **Produksi:**
   ```bash
   npm run build            # vite build + esbuild server → dist/
   npm start                # node dist/index.js
   ```

7. **Cek kesehatan:** `GET /api/health` → `{"status":"ok",...}` (tanpa auth).

## Deploy

**VPS sendiri (disarankan — full-stack di satu server):** lihat [docs/DEPLOY-VPS.md](docs/DEPLOY-VPS.md) dan skrip siap-pakai di `deploy/` (provisi `vps-setup.sh`, deploy ulang `push-to-vps.sh`, backup harian `backup.sh`). Stack: Nginx + systemd + PostgreSQL + HTTPS certbot.

**Railway (alternatif):** set `DATABASE_URL` dari Postgres Railway, build `npm run build`, start `npm start`, verifikasi `/api/health`.

## Migrasi Data Lama dari Supabase

Setelah `DATABASE_URL` tujuan terisi dan skema sudah di-push, isi sementara
`VITE_SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` (projek lama), lalu:

```bash
npm run migrate:supabase   # ekspor 14 tabel dari Supabase → impor ke DATABASE_URL, + ringkasan
npm run db:check           # verifikasi: daftar tabel & estimasi jumlah baris di DATABASE_URL
```

Bandingkan ringkasan `Imported` dengan data Supabase, lalu uji relasi (kelas → siswa → absensi/nilai) dari UI.

## Referensi API

Semua endpoint (kecuali `/api/health` dan `/api/auth/login`) memerlukan header `Authorization: Bearer <JWT internal>` dan bersifat user-scoped. Pola CRUD seragam per entitas: `GET /api/<entity>?limit&offset`, `GET /api/<entity>/:id`, `POST /api/<entity>`, `PUT /api/<entity>/:id`, `DELETE /api/<entity>/:id`.

| Entitas | Endpoint | Ekstra |
|---|---|---|
| Auth | `/api/auth/login`, `/api/auth/me`, `/api/auth/change-password` | login rate-limited; JWT 7 hari |
| Upload | `/api/uploads` | multipart (field `file`), disajikan dari `/uploads`, batas 25 MB |
| Kelas | `/api/classes` | — |
| Siswa | `/api/students` | `?class_id=`, bulk import |
| Jadwal | `/api/schedules` | `?class_id=`, by day |
| Jurnal | `/api/journals` | filter rentang tanggal |
| Absensi | `/api/attendance` | bulk record, laporan per tanggal/siswa/kelas |
| Modul Ajar | `/api/modul-ajar` | filter ATP & kelas |
| ATP | `/api/atp` | filter fase & grade, pencarian |
| KKTP | `/api/kktp` | filter kelas & mapel |
| Bank Soal | `/api/exam-questions` | filter tipe & kesulitan |
| Nilai | `/api/grades` | bulk entry, statistik, filter |
| Profil Guru | `/api/teacher-profile` | get + update, foto profil |
| Dokumen Kurikulum | `/api/curriculum` | filter tipe dokumen |
| Kalender | `/api/calendar` | bulk import, filter tanggal & tipe |

Detail lengkap: `docs/api-client-usage.md`, `docs/authentication.md`, `docs/database-schema.md`, `docs/migration-guide.md`. Spesifikasi migrasi: `docs/specs/migrate-to-railway-postgresql/`.
