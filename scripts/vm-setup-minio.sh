#!/bin/bash
# ─────────────────────────────────────────────────────────────────────────────
# vm-setup-minio.sh
# Starts MinIO as a standalone container on the VM host.
#   Port 9000 → S3 API  (used by tribenest-app via host.docker.internal)
#   Port 9001 → web console (restrict in Azure NSG to your IP only)
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

MINIO_ACCESS_KEY="varalabs"
MINIO_SECRET_KEY="VaraMinio@12345678"
CONTAINER_NAME="varalabs-minio"
DATA_DIR="/opt/varalabs/minio-data"
BUCKET_NAME="tribenest"
POLICY_FILE="$(cd "$(dirname "$0")/.." && pwd)/minio-anon-permission.json"

echo "==> Creating data directory at $DATA_DIR ..."
sudo mkdir -p "$DATA_DIR"
sudo chown "$USER":"$USER" "$DATA_DIR"

# Remove any old container with the same name
if docker ps -a --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
  echo "==> Removing existing container '$CONTAINER_NAME' ..."
  docker rm -f "$CONTAINER_NAME"
fi

echo "==> Starting MinIO container ..."
docker run -d \
  --name "$CONTAINER_NAME" \
  --restart unless-stopped \
  -p 127.0.0.1:9000:9000 \
  -p 9001:9001 \
  -v "$DATA_DIR":/data \
  -e MINIO_ROOT_USER="$MINIO_ACCESS_KEY" \
  -e MINIO_ROOT_PASSWORD="$MINIO_SECRET_KEY" \
  minio/minio:latest \
  server /data --console-address ":9001"

echo "==> Waiting for MinIO to be ready ..."
until docker exec "$CONTAINER_NAME" curl -sf http://localhost:9000/minio/health/live; do
  sleep 2
done

echo "==> Configuring bucket '$BUCKET_NAME' ..."
docker run --rm \
  --network host \
  -v "$POLICY_FILE":/policy.json:ro \
  minio/mc:latest \
  /bin/sh -c "
    mc alias set local http://127.0.0.1:9000 $MINIO_ACCESS_KEY $MINIO_SECRET_KEY &&
    if ! mc ls local/$BUCKET_NAME > /dev/null 2>&1; then
      mc mb local/$BUCKET_NAME &&
      mc anonymous set-json /policy.json local/$BUCKET_NAME &&
      echo 'Bucket created and public-read policy applied.';
    else
      echo 'Bucket already exists, skipping creation.';
    fi
  "

echo ""
echo "MinIO is running."
echo "  Container   : $CONTAINER_NAME"
echo "  S3 API      : http://127.0.0.1:9000 (host-only)"
echo "  Web console : http://<VM-public-IP>:9001"
echo "  Access key  : $MINIO_ACCESS_KEY"
echo "  Secret key  : $MINIO_SECRET_KEY"
echo "  Bucket      : $BUCKET_NAME"
echo "  Data dir    : $DATA_DIR"
echo ""
echo "NOTE: Lock down port 9001 in your Azure NSG to your IP only."
