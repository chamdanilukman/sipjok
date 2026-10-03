#!/usr/bin/env bash
# =====================================================================
# backup.sh — backup harian PostgreSQL SIPJOK ke /opt/sipjok/backups.
# Dipasang via cron (lihat docs/DEPLOY-VPS.md). Rotasi: simpan 7 terakhir.
#   sudo -u postgres pg_dump sipjok | gzip > backup.sql.gz
# Restore:
#   gunzip -c /opt/sipjok/backups/sipjok-YYYY-MM-DD.sql.gz | sudo -u postgres psql sipjok
# =====================================================================
set -euo pipefail

BACKUP_DIR="${1:-/opt/sipjok/backups}"
DB_NAME="${SIPJOK_DB_NAME:-sipjok}"
KEEP=7

mkdir -p "$BACKUP_DIR"
STAMP="$(date +%F)"
FILE="$BACKUP_DIR/$DB_NAME-$STAMP.sql.gz"

sudo -u postgres pg_dump "$DB_NAME" | gzip > "$FILE"

# Rotasi: hapus backup lebih lama dari KEEP hari
find "$BACKUP_DIR" -name "$DB_NAME-*.sql.gz" -type f -mtime +$KEEP -delete

echo "[$(date '+%F %T')] Backup OK: $FILE ($(du -h "$FILE" | cut -f1))"
