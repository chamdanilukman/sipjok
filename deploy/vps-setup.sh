#!/usr/bin/env bash
# =====================================================================
# vps-setup.sh — PROVISI AWAL VPS (Debian/Ubuntu) untuk SIPJOK.
# Jalankan SEKALI di VPS sebagai root:
#   bash deploy/vps-setup.sh            (dari root repo, setelah deploy.conf diisi)
#   atau: ssh thor 'bash -s' < deploy/vps-setup.sh   (tidak disarankan: butuh deploy.conf)
#
# Yang dipasang: PostgreSQL, Nginx, Node.js 20, certbot, ufw rule,
# user & database aplikasi, direktori /opt/sipjok, systemd unit.
# =====================================================================
set -euo pipefail

CONF="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/deploy.conf"
if [[ ! -f "$CONF" ]]; then
  echo "❌ $CONF tidak ada. Salin deploy/deploy.conf.example dulu dan isi nilainya."
  exit 1
fi
# shellcheck disable=SC1090
source "$CONF"

DOMAIN="${DOMAIN:?Isi DOMAIN di deploy.conf dulu}"
APP_DIR="${APP_DIR:-/opt/sipjok}"
APP_USER="${APP_USER:-sipjok}"
PORT_APP="${PORT_APP:-5000}"
DB_NAME="${DB_NAME:-sipjok}"
DB_USER="${DB_USER:-sipjok}"
DB_PASS="${DB_PASS:-$(openssl rand -hex 24)}"

echo "==> 1/8 Update & install paket (postgresql nginx certbot git rsync ufw)"
export DEBIAN_FRONTEND=noninteractive
apt-get update -y
apt-get install -y postgresql nginx certbot python3-certbot-nginx git rsync ufw curl openssl

echo "==> 2/8 Install Node.js 20 (NodeSource) bila belum ada"
if ! command -v node >/dev/null || [[ "$(node -v | cut -dv -f2 | cut -d. -f1)" -lt 20 ]]; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y nodejs
fi
echo "    node $(node -v)"

echo "==> 3/8 Firewall ufw: buka SSH, HTTP, HTTPS"
ufw allow 22/tcp   || true
ufw allow 80/tcp   || true
ufw allow 443/tcp  || true
yes | ufw enable || true

echo "==> 4/8 Database PostgreSQL: user & database '${DB_USER}'"
sudo -u postgres psql -tAc "SELECT 1 FROM pg_roles WHERE rolname='${DB_USER}'" | grep -q 1 || \
  sudo -u postgres psql -c "CREATE USER ${DB_USER} WITH PASSWORD '${DB_PASS}';"
sudo -u postgres psql -tAc "SELECT 1 FROM pg_database WHERE datname='${DB_NAME}'" | grep -q 1 || \
  sudo -u postgres psql -c "CREATE DATABASE ${DB_NAME} OWNER ${DB_USER};"
sudo -u postgres psql -c "ALTER DATABASE ${DB_NAME} OWNER TO ${DB_USER};"

echo "==> 5/8 User sistem & direktori aplikasi ${APP_DIR}"
id -u "${APP_USER}" >/dev/null 2>&1 || useradd --system --create-home --shell /bin/bash "${APP_USER}"
mkdir -p "${APP_DIR}/uploads" "${APP_DIR}/backups"
chown -R "${APP_USER}:${APP_USER}" "${APP_DIR}"

echo "==> 6/8 Systemd unit /etc/systemd/system/sipjok.service"
sed -e "s|__APP_DIR__|${APP_DIR}|g" \
    -e "s|__APP_USER__|${APP_USER}|g" \
    -e "s|__PORT_APP__|${PORT_APP}|g" \
    "$(dirname "${BASH_SOURCE[0]}")/sipjok.service" > /etc/systemd/system/sipjok.service
systemctl daemon-reload
systemctl enable sipjok.service

echo "==> 7/8 Nginx site untuk ${DOMAIN}"
sed -e "s|__DOMAIN__|${DOMAIN}|g" \
    -e "s|__PORT_APP__|${PORT_APP}|g" \
    "$(dirname "${BASH_SOURCE[0]}")/nginx-sipjok.conf" > /etc/nginx/sites-available/sipjok.conf
ln -sf /etc/nginx/sites-available/sipjok.conf /etc/nginx/sites-enabled/sipjok.conf
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl reload nginx

echo "==> 8/8 HTTPS via certbot (Let's Encrypt) untuk ${DOMAIN}"
echo "    Pastikan DNS AAAA ${DOMAIN} sudah menunjuk ke IP publik VPS ini!"
read -r -p "Lanjutkan certbot sekarang? [y/N] " jawab
if [[ "${jawab:-n}" =~ ^[Yy]$ ]]; then
  certbot --nginx -d "${DOMAIN}" --non-interactive --agree-tos --register-unsafely-without-email \
    || certbot --nginx -d "${DOMAIN}" --non-interactive --agree-tos
else
  echo "    Lewati. Jalankan manual nanti:"
  echo "    certbot --nginx -d ${DOMAIN}"
fi

cat <<RINGKAS

=====================================================================
 PROVISI SELESAI — catatan penting (simpan!)
=====================================================================
DATABASE_URL (untuk .env aplikasi):
  postgresql://${DB_USER}:${DB_PASS}@127.0.0.1:5432/${DB_NAME}

Langkah berikutnya (dari laptop):
  1. bash deploy/push-to-vps.sh          # build + kirim kode + start
  2. ssh ${SSH_HOST:-thor} 'cat ${APP_DIR}/.env'   # cek konfigurasi

Login pertama dibuat otomatis oleh push-to-vps.sh (seed:admin).
=====================================================================
RINGKAS
