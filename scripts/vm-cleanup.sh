#!/bin/bash

# Docker cleanup script for the Varalabs VM
# Removes exited containers, dangling images, and unused layers to free disk + RAM.
# Safe to run while the app is live — only touches stopped/unreferenced resources.

set -e

BOLD='\033[1m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log()  { echo -e "${BOLD}[cleanup]${NC} $1"; }
ok()   { echo -e "${GREEN}  ✓${NC} $1"; }
warn() { echo -e "${YELLOW}  !${NC} $1"; }

# ── Snapshot before ────────────────────────────────────────────────────────────

log "Disk and memory before cleanup:"
df -h / | awk 'NR==2 {printf "  Disk: %s used / %s total (%s free)\n", $3, $2, $4}'
free -m  | awk '/Mem:/ {printf "  RAM:  %d MB used / %d MB total (%d MB free)\n", $3, $2, $7}'
echo ""

# ── 1. Stopped containers ──────────────────────────────────────────────────────

log "Removing exited/dead containers..."
STOPPED=$(docker ps -a --filter "status=exited" --filter "status=dead" --filter "status=created" -q)
if [ -n "$STOPPED" ]; then
  echo "$STOPPED" | xargs docker rm -f
  ok "Removed $(echo "$STOPPED" | wc -l | tr -d ' ') container(s)"
else
  ok "No stopped containers to remove"
fi

# ── 2. Dangling images (untagged layers from old builds) ───────────────────────

log "Removing dangling images (untagged build layers)..."
DANGLING=$(docker images -f "dangling=true" -q)
if [ -n "$DANGLING" ]; then
  echo "$DANGLING" | xargs docker rmi
  ok "Removed dangling images"
else
  ok "No dangling images"
fi

# ── 3. Old tribenest images (keep only the current :varalabs tag) ──────────────

log "Removing old tribenest image versions..."
CURRENT=$(docker inspect --format='{{.Id}}' tribenest:varalabs 2>/dev/null || true)
OLD_IMAGES=$(docker images tribenest --format "{{.ID}}" | grep -v "^${CURRENT:7:12}" || true)
if [ -n "$OLD_IMAGES" ]; then
  echo "$OLD_IMAGES" | xargs docker rmi -f 2>/dev/null || true
  ok "Removed old tribenest image versions"
else
  ok "No old tribenest images to remove"
fi

# ── 4. Unused volumes ──────────────────────────────────────────────────────────

log "Removing unused volumes..."
VOLS=$(docker volume ls -qf dangling=true)
if [ -n "$VOLS" ]; then
  echo "$VOLS" | xargs docker volume rm
  ok "Removed unused volumes"
else
  ok "No unused volumes"
fi

# ── 5. Build cache ─────────────────────────────────────────────────────────────

log "Pruning build cache..."
docker builder prune -f --keep-storage=500mb 2>/dev/null || docker builder prune -f 2>/dev/null || true
ok "Build cache pruned"

# ── Snapshot after ─────────────────────────────────────────────────────────────

echo ""
log "Disk and memory after cleanup:"
df -h / | awk 'NR==2 {printf "  Disk: %s used / %s total (%s free)\n", $3, $2, $4}'
free -m  | awk '/Mem:/ {printf "  RAM:  %d MB used / %d MB total (%d MB free)\n", $3, $2, $7}'

# ── Verify app is still running ────────────────────────────────────────────────

echo ""
log "Running containers:"
docker ps --format "  {{.Names}}\t{{.Status}}" | grep -v "^$"

echo ""
ok "Cleanup complete."
