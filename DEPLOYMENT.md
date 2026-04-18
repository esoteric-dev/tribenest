# Deployment Guide — varalabs.systems

## Architecture

```
varalabs.systems          → Cloudflare Pages  (Next.js frontend — wrangler deploy)
api.varalabs.systems      → Cloudflare Tunnel → Azure VM port 80 → nginx → backend :8000
admin.varalabs.systems    → Cloudflare Tunnel → Azure VM port 80 → nginx → backend :8000
assets.varalabs.systems   → Cloudflare Tunnel → Azure VM port 9002 → tribenest-minio
media.varalabs.systems    → Cloudflare Tunnel → Azure VM port 7880 → LiveKit (future)
```

---

## VM Details

| Property | Value |
|---|---|
| Host | `20.196.73.173` |
| User | `azureuser` |
| OS | Debian 12 (bookworm) |
| SSH | `ssh azureuser@20.196.73.173` |

---

## Running Services on the VM

| Container | Image | Ports | Purpose |
|---|---|---|---|
| `tribenest-app` | `tribenest:varalabs` (local) | `80:80` | Backend API + admin SPA + Next.js (nginx inside) |
| `tribenest-minio` | `minio/minio:latest` | `9002:9000`, `9003:9001` | Object storage for tribenest |
| `openstream_redis_1` | `redis:7-alpine` | `6379:6379` | Redis (shared, no password) |

---

## Credentials

| Service | Credential |
|---|---|
| VM SSH | `azureuser` / `Test@12345678` |
| Database | `dbuser` / `Test@12345678` @ `openstream-db.postgres.database.azure.com:5432/postgres` |
| Redis | No password — `redis://localhost:6379` |
| MinIO | `varalabs` / `VaraMinio@12345678` — API on port 9002, console on port 9003 |
| MinIO bucket | `tribenest` (public-read policy applied) |
| JWT Secret | `varalabs-super-secret-jwt-key-change-in-real-prod-2024` |
| Cloudflare Tunnel | `varalabs-tunnel` (ID: `836973e3-99c5-4699-ad03-90cda6cd5f86`) |

---

## The `tribenest:varalabs` Docker Image

This is a patched local image built on the VM. It is NOT pushed to any registry.
Source: `ghcr.io/drenathan/tribenest:latest` + 5 patches applied in `/opt/tribenest-patch/`.

### Patches applied

| # | What | Why |
|---|---|---|
| 1 | Add `ssl: { rejectUnauthorized: false }` to postgres pool | Azure PostgreSQL enforces SSL |
| 2 | No-op the `1752782817414_add_search_index_for_posts` migration | `CREATE EXTENSION pg_trgm` is blocked on Azure PostgreSQL |
| 3 | Remove GIN index from `1752788885016_add_archived_at_to_products_table` | Same — `gin_trgm_ops` requires `pg_trgm` |
| 4 | nginx: `proxy_pass http://host.docker.internal:9002` for `assets.*` | MinIO runs on the host, not inside the container |
| 5 | Fix `/run/nginx` and `/var/lib/nginx` permissions | nginx runs as non-root `nextjs` user |

To rebuild after upstream updates:
```bash
ssh azureuser@20.196.73.173
cd /opt/tribenest-patch
docker pull ghcr.io/drenathan/tribenest:latest
docker build -t tribenest:varalabs .
docker stop tribenest-app && docker rm tribenest-app
cd /opt/tribenest && docker-compose -f docker-compose.varalabs.yml up -d
```

---

## Compose File Location

```
/opt/tribenest/docker-compose.varalabs.yml
```

---

## Cloudflare Tunnel

- **Tunnel name:** `varalabs-tunnel`
- **Tunnel ID:** `836973e3-99c5-4699-ad03-90cda6cd5f86`
- **Config:** `/home/azureuser/.cloudflared/config.yml`
- **Credentials:** `/home/azureuser/.cloudflared/836973e3-99c5-4699-ad03-90cda6cd5f86.json`
- **Service:** `systemctl status cloudflared`

DNS CNAMEs created automatically in Cloudflare:
- `api.varalabs.systems` → tunnel
- `admin.varalabs.systems` → tunnel
- `assets.varalabs.systems` → tunnel
- `media.varalabs.systems` → tunnel

---

## Common Operations

### Check all containers
```bash
ssh azureuser@20.196.73.173
docker ps
```

### View backend logs
```bash
docker logs tribenest-app -f
```

### Restart the app
```bash
cd /opt/tribenest
docker-compose -f docker-compose.varalabs.yml restart
```

### Check tunnel health
```bash
cloudflared tunnel info varalabs-tunnel
sudo systemctl status cloudflared
```

### MinIO console
Open in browser: `http://20.196.73.173:9003`
Login: `varalabs` / `VaraMinio@12345678`

---

## Frontend — served from the VM via Cloudflare Tunnel

The Next.js client runs **inside the `tribenest-app` container** on the VM (port 3000), served by nginx
on port 80 as the default catch-all server. It is exposed publicly through the Cloudflare Tunnel
alongside the backend — no separate hosting needed.

**Why not Cloudflare Pages / Cloudflare Workers?**
The Next.js bundle compiles to ~23 MB. Cloudflare Workers free tier allows 3 MB; paid allows 10 MB.
Neither is sufficient. The VM-hosted approach has no bundle size limit and runs full Node.js SSR.

### DNS routes through the tunnel

| Hostname | Tunnel target | Served by |
|---|---|---|
| `varalabs.systems` | `http://localhost:80` | nginx → Next.js :3000 |
| `www.varalabs.systems` | `http://localhost:80` | nginx → Next.js :3000 |
| `api.varalabs.systems` | `http://localhost:80` | nginx → backend :8000 |
| `admin.varalabs.systems` | `http://localhost:80` | nginx → backend :8000 |
| `assets.varalabs.systems` | `http://localhost:9002` | tribenest-minio |

All four tunnel connections are live and registered via `systemctl status cloudflared`.

### Environment variables baked into the Next.js build

The `next.config.js` `env` block sets these at build time from the container's environment:

```
ROOT_DOMAIN=varalabs.systems       (from docker-compose.varalabs.yml ROOT_DOMAIN)
API_URL=https://api.varalabs.systems (from docker-compose.varalabs.yml API_URL)
```

No separate env var configuration is needed — rebuilding the image picks up any changes.

---

## What to do when you update the backend code

1. Commit and push changes to `esoteric-dev/tribenest`
2. On the VM:
   ```bash
   cd /opt/tribenest && git pull
   cd /opt/tribenest-patch
   docker pull ghcr.io/drenathan/tribenest:latest   # if upstream image changed
   docker build -t tribenest:varalabs .
   docker stop tribenest-app && docker rm tribenest-app
   cd /opt/tribenest && docker-compose -f docker-compose.varalabs.yml up -d
   ```

## What to do when you update the frontend code

Frontend changes are deployed the same way as backend changes — rebuild the Docker image on the VM:

```bash
ssh azureuser@20.196.73.173
cd /opt/tribenest && git pull
cd /opt/tribenest-patch && docker build -t tribenest:varalabs .
docker stop tribenest-app && docker rm tribenest-app
cd /opt/tribenest && docker-compose -f docker-compose.varalabs.yml up -d
```

---

## Known Limitations

- `pg_trgm` full-text search on posts/products is disabled (Azure PostgreSQL blocks the extension). Search features that use `gin_trgm_ops` will fall back to exact matching.
- LiveKit (`media.varalabs.systems`) tunnel route exists but LiveKit is not yet installed on the VM.
