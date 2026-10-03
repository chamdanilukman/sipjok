#!/usr/bin/env bash
# =====================================================================
# push-to-vps.sh — BUILD di laptop + kirim kode + start di VPS.
# Jalankan dari root repo (Git Bash / WSL / Linux):
#   bash deploy/push-to-vps.sh
# Perlu: deploy/deploy.conf sudah diisi & vps-setup.sh sudah pernah dijalankan.
# =====================================================================
set -euo pipefail

CONF="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/deploy.conf"
if [[ ! -f "$CONF" ]]; then
  echo "❌ $CONF tidak ada. Salin deploy/deploy.conf.example dulu."
  exit 1
fi
# shellcheck disable=SC1090
source "$CONF"

SSH_HOST="${SSH_HOST:?Isi SSH_HOST di deploy.conf}"
SSH_PORT="${SSH_PORT:-22}"
APP_DIR="${APP_DIR:-/opt/sipjok}"
APP_USER="${APP_USER:-sipjok}"
PORT_APP="${PORT_APP:-5000}"
DB_NAME="${DB_NAME:-sipjok}"
DB_USER="${DB_USER:-sipjok}"
DB_PASS="${DB_PASS:-}"
ADMIN_EMAIL="${ADMIN_EMAIL:-}"
ADMIN_PASSWORD="${ADMIN_PASSWORD:-}"
DOMAIN="${DOMAIN:-}"

SSH_CMD=(ssh -p "$SSH_PORT" "$SSH_HOST")

echo "==> 1/6 Build produksi di laptop"
npm run build

echo "==> 2/6 Kirim kode ke VPS ($SSH_HOST:$APP_DIR) via tar-over-ssh"
"${SSH_CMD[@]}" "mkdir -p $APP_DIR"
tar czf - \
  --exclude='node_modules' --exclude='.env' --exclude='.git' \
  dist server shared migrations drizzle.config.ts package.json package-lock.json tsconfig.json \
  | "${SSH_CMD[@]}" "tar xzf - -C $APP_DIR"

echo "==> 3/6 Siapkan .env di VPS (dibuat bila belum ada)"
# Nilai di-inline ke skrip remote (posisi argumen ssh rapuh terhadap argumen kosong)
REMOTE_SCRIPT=$(cat <<REMOTE_ENV
set -euo pipefail
APP_DIR="$APP_DIR"; PORT_APP="$PORT_APP"; DB_NAME="$DB_NAME"; DB_USER="$DB_USER"
DB_PASS="$DB_PASS"; ADMIN_EMAIL="$ADMIN_EMAIL"; ADMIN_PASSWORD="$ADMIN_PASSWORD"
ENVF="\$APP_DIR/.env"

if [[ -f "\$ENVF" ]]; then
  echo "    .env sudah ada — tidak diubah (hapus manual bila ingin regenerate)."
else
  if [[ -z "\$DB_PASS" ]]; then
    DB_PASS="\$(openssl rand -hex 24)"
    echo "    DB_PASS kosong di deploy.conf -> digenerate acak & diset ke PostgreSQL."
  fi
  sudo -u postgres psql -qc "ALTER USER \$DB_USER WITH PASSWORD '\$DB_PASS';" >/dev/null

  cat > "\$ENVF" <<ENVEOF
# Konfigurasi SIPJOK (dihasilkan push-to-vps.sh — chmod 600)
DATABASE_URL=postgresql://\$DB_USER:\$DB_PASS@127.0.0.1:5432/\$DB_NAME
JWT_SECRET=\$(openssl rand -hex 48)
JWT_TTL=7d
UPLOAD_DIR=\$APP_DIR/uploads
UPLOAD_MAX_MB=25
NODE_ENV=production
PORT=\$PORT_APP
VITE_APP_NAME=SIPJOK
VITE_APP_VERSION=1.0.0
VITE_API_TIMEOUT=30000
ENVEOF
  if [[ -n "\$ADMIN_EMAIL" && -n "\$ADMIN_PASSWORD" ]]; then
    { echo "ADMIN_EMAIL=\$ADMIN_EMAIL"; echo "ADMIN_PASSWORD=\$ADMIN_PASSWORD"; } >> "\$ENVF"
  fi
  chmod 600 "\$ENVF"
  echo "    .env dibuat."
fi
REMOTE_ENV
)
printf '%s' "$REMOTE_SCRIPT" | "${SSH_CMD[@]}" 'bash -s'

echo "==> 4/6 Install dependensi + push skema DB di VPS"
"${SSH_CMD[@]}" "cd $APP_DIR && npm ci --no-audit --no-fund 2>&1 | tail -2 \
  && npx drizzle-kit push --force \
  && sudo -u postgres psql -d $DB_NAME -f migrations/add-indexes.sql >/dev/null 2>&1 || true"

echo "==> 5/6 Seed user admin (jika dikonfigurasi) + jalankan ulang layanan"
"${SSH_CMD[@]}" "cd $APP_DIR \
  && if grep -q '^ADMIN_EMAIL=' .env 2>/dev/null; then npx tsx server/scripts/seed-admin.ts; fi \
  && chown -R $APP_USER:$APP_USER $APP_DIR \
  && systemctl restart sipjok"

echo "==> 6/6 Health check"
sleep 3
"${SSH_CMD[@]}" "curl -sf http://127.0.0.1:$PORT_APP/api/health" && echo " ✓ aplikasi hidup" || {
  echo "❌ Aplikasi belum hidup — cek log: ssh $SSH_HOST 'journalctl -u sipjok -n 50'"
  exit 1
}

if [[ -n "$DOMAIN" ]]; then
  echo "Buka: https://$DOMAIN"
else
  echo "Selesai. Isi DOMAIN di deploy.conf + jalankan 'certbot --nginx' untuk HTTPS."
fi
