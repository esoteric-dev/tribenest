#!/bin/bash
# ─────────────────────────────────────────────────────────────────────────────
# vm-setup-redis.sh
# Starts Redis as a standalone container on the VM host.
# Binds to 127.0.0.1:6379 only — not exposed to the public internet.
# The tribenest-app container reaches it via host.docker.internal:6379
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

REDIS_PASSWORD="VaraRedis@12345678"
CONTAINER_NAME="varalabs-redis"
DATA_DIR="/opt/varalabs/redis-data"

echo "==> Creating data directory at $DATA_DIR ..."
sudo mkdir -p "$DATA_DIR"
sudo chown "$USER":"$USER" "$DATA_DIR"

# Remove any old container with the same name
if docker ps -a --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
  echo "==> Removing existing container '$CONTAINER_NAME' ..."
  docker rm -f "$CONTAINER_NAME"
fi

echo "==> Starting Redis container ..."
docker run -d \
  --name "$CONTAINER_NAME" \
  --restart unless-stopped \
  -p 127.0.0.1:6379:6379 \
  -v "$DATA_DIR":/data \
  redis:7-alpine \
  redis-server \
    --requirepass "$REDIS_PASSWORD" \
    --appendonly yes \
    --maxmemory 256mb \
    --maxmemory-policy allkeys-lru

echo ""
echo "Redis is running."
echo "  Container : $CONTAINER_NAME"
echo "  Port      : 127.0.0.1:6379 (host-only)"
echo "  Password  : $REDIS_PASSWORD"
echo "  Data dir  : $DATA_DIR"
echo ""
echo "Quick health check:"
docker exec "$CONTAINER_NAME" redis-cli -a "$REDIS_PASSWORD" ping
