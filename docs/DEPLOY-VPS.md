# Deploy SIPJOK Full-Stack ke VPS "thor" (Native)

Stack di VPS: **Nginx (HTTPS) → systemd → Node.js (Express + React build) → PostgreSQL**.
Tanpa Docker, tanpa Railway, tanpa Supabase — semuanya berjalan di VPS.

> **Status aktual (2026-10-03): SUDAH TERDEPLOY** di VM Proxmox Ubuntu 24.04
> (2 vCPU / 4 GB RAM), SSH `root@103.164.173.6 -p 34022` (kunci `vps-thor`).
> Aplikasi hidup di VM: Nginx :80 → node :5000 → PostgreSQL, login OK,
> backup cron terpasang. **Akses publik** lihat bagian 5b.

```
Internet ──► Nginx :80/:443 (certbot HTTPS)
                └──► 127.0.0.1:5000  systemd `sipjok.service` (node dist/index.js)
                        └──► PostgreSQL 127.0.0.1:5432 (db: sipjok)
                        └──► /opt/sipjok/uploads (lampiran file, disajikan Express)
```

## 0. Prasyarat (dari laptop)

1. Kunci SSH VPS ada di `D:\Code\SIPJOK-NEW\ssh-vps` — ikuti `BACA-CARA-PAKAI.txt`:
   salin key ke `%USERPROFILE%\.ssh\vps-thor` dan isi `%USERPROFILE%\.ssh\config`
   dengan isi `config-thor` supaya cukup mengetik `ssh -p 34022 root@103.164.173.6`.
2. **Koneksi ke VPS harus tersedia**: IPv6 publik `2001:470:36:885::240` butuh jaringan
   dengan IPv6, atau IP lokal `10.10.0.240` bila satu jaringan/VPN.
   Tes dulu: `ssh -p 34022 root@103.164.173.6 "uname -a"`.
3. Git Bash (ada di laptop ini) — semua skrip dijalankan dari sana.

## 1. Konfigurasi satu file

```bash
cd D:/Code/SIPJOK-NEW/si-pjok-v1
cp deploy/deploy.conf.example deploy/deploy.conf
```

Isi minimal: `DOMAIN` (domain Anda, diarahkan **AAAA → 2001:470:36:885::240**),
`ADMIN_EMAIL`, `ADMIN_PASSWORD`. `DB_PASS` kosongkan (digenerate acak).

> `deploy.conf` berisi kredensial — sudah di-gitignore, jangan di-commit.

## 2. Provisi VPS (sekali saja)

```bash
bash deploy/vps-setup.sh
```

Memasang PostgreSQL, Nginx, Node 20, certbot, ufw; membuat user & database
`sipjok`; memasang systemd unit + nginx site. Di akhir, catat `DATABASE_URL`
yang ditampilkan.

Bila diminta, lanjutkan `certbot` untuk HTTPS (DNS AAAA harus sudah mengarah
ke VPS). Bila dilewati: `certbot --nginx -d domain-anda` kapan saja.

## 3. Build + deploy + start

```bash
bash deploy/push-to-vps.sh
```

Yang dilakukan: build produksi di laptop → kirim kode (`tar` over SSH) →
siapkan `.env` di VPS (JWT_SECRET acak, DATABASE_URL, dll — chmod 600) →
`npm ci` → push skema Drizzle + indeks → seed user admin → restart layanan →
health check `/api/health`.

Selesai. Buka `https://DOMAIN` dan login dengan `ADMIN_EMAIL`/`ADMIN_PASSWORD`.

### Update aplikasi selanjutnya

Cukup ulangi langkah 3. `.env` dan database di VPS tidak akan diubah.

## 4. Backup otomatis (disarankan)

```bash
ssh thor
install -m 755 /opt/sipjok/deploy/backup.sh /usr/local/bin/sipjok-backup.sh
echo '0 2 * * * root /usr/local/bin/sipjok-backup.sh /opt/sipjok/backups' > /etc/cron.d/sipjok-backup
```

Backup tiap jam 02:00 ke `/opt/sipjok/backups`, simpan 7 hari.
Restore: `gunzip -c backup.sql.gz | sudo -u postgres psql sipjok`.

## 5. (Opsional) Migrasi data lama dari Supabase

Data lama masih di Supabase (projek `ljnekwdieu…`)? Isi sementara di
`/opt/sipjok/.env` VPS:

```
VITE_SUPABASE_URL=https://ljnekwdieuhsxlphsgek.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<service-role-key lama>
```

lalu:

```bash
ssh thor 'cd /opt/sipjok && npx tsx server/scripts/migrate-from-supabase.ts'
```

Lihat ringkasan jumlah baris per tabel, hapus dua variabel Supabase lagi dari
`.env`, dan `systemctl restart sipjok`. Verifikasi lewat `npm run db:check`.

## 6. Perintah harian

| Perintah | Fungsi |
|---|---|
| `ssh thor 'systemctl status sipjok'` | status aplikasi |
| `ssh thor 'journalctl -u sipjok -f'` | log live |
| `ssh thor 'systemctl restart sipjok'` | restart aplikasi |
| `ssh thor 'systemctl reload nginx'` | reload reverse proxy |
| `npm run db:check` (di VPS) | cek tabel & jumlah baris |

## 5b. Akses publik di lingkungan Proxmox/NAT (penting)

IP publik `103.164.173.6` adalah **host Proxmox**, bukan VM. Host-nya menjalankan
**Caddy sendiri di port 80/443** (respons `Server: Caddy`), sedangkan VM kita
(`10.10.0.240`) hanya terjangkau lewat NAT port `34022 → 22`. Jadi walau
Nginx+aplikasi di VM hidup, `http://103.164.173.6/` dari internet masih memunculkan
redirect milik Caddy host.

Dua pilihan membuka akses publik (dua-duanya di sisi host, minta admin Proxmox):

1. **NAT port tambahan** — arahkan satu port publik ke VM:80, mis.
   `34080 → 10.10.0.240:80`, lalu aplikasi diakses di `http://103.164.173.6:34080`.
2. **(Disarankan) Lewat Caddy host + domain** — tambahkan site di Caddy host:
   ```
   sipjok.domain-anda.com {
       reverse_proxy 10.10.0.240:80
   }
   ```
   HTTPS otomatis oleh Caddy host — tidak perlu certbot di VM. Ini juga
   memenuhi pilihan awal "domain sendiri + HTTPS".

## 7. Masalah umum

- **`ssh: Network is unreachable`** — jaringan Anda belum punya IPv6/VPN. Sambungkan
  VPN sekolah atau pakai IP lokal.
- **Certbot gagal** — DNS AAAA belum mengarah ke VPS, atau port 80 diblokir
  (`ufw status`). Perbaiki, lalu ulangi `certbot --nginx -d DOMAIN`.
- **`npm ci` lambat/putus di VPS** — VPS perlu akses npm registry; ulangi
  `bash deploy/push-to-vps.sh` (aman dijalankan ulang).
- **Login gagal "Email atau password salah"** — seed belum jalan: pastikan
  `ADMIN_EMAIL`/`ADMIN_PASSWORD` ada di `/opt/sipjok/.env`, lalu
  `cd /opt/sipjok && npx tsx server/scripts/seed-admin.ts`.
- **Upload gagal > 25 MB** — batas ada di `client_max_body_size` Nginx
  (`deploy/nginx-sipjok.conf`) dan `UPLOAD_MAX_MB` di `.env`.
