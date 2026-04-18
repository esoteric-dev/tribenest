#!/bin/bash
# ─────────────────────────────────────────────────────────────────────────────
# vm-start-app.sh
# Pulls the latest tribenest image and starts the app container.
# Run this after vm-setup-redis.sh and vm-setup-minio.sh have completed.
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

REPO_DIR="$(cd "$(dirname "$0")/.." && pwd)"
COMPOSE_FILE="$REPO_DIR/docker-compose.varalabs.yml"

# JWT_SECRET must be set in the environment or passed in.
# Generate one with: openssl rand -hex 64
if [ -z "${JWT_SECRET:-}" ]; then
  echo "ERROR: JWT_SECRET environment variable is not set."
  echo "Generate one with:  export JWT_SECRET=\$(openssl rand -hex 64)"
  exit 1
fi

echo "==> Pulling latest image ..."
docker pull ghcr.io/drenathan/tribenest:latest

echo "==> Starting tribenest-app ..."
docker compose -f "$COMPOSE_FILE" up -d

echo ""
echo "Container status:"
docker compose -f "$COMPOSE_FILE" ps

echo ""
echo "==> Running database migrations ..."
docker exec tribenest-app node /app/apps/backend/build/db/_migration/index.js up

echo ""
echo "App is live. Logs:"
echo "  docker compose -f $COMPOSE_FILE logs -f"
