# Varalabs Streaming Platform — Build Progress

> Last updated: 2026-04-19

## What We're Building

A **Restream.io-like** multi-platform streaming platform at **varalabs.systems**:

- Creators sign up and log in via the creator portal
- Connect YouTube, Twitch, Facebook, TikTok, Instagram, or Custom RTMP endpoints
- Upload pre-recorded videos and schedule them to stream at specific times (simulive)
- Scheduled videos automatically push to **all connected platforms** via FFmpeg
- Viewers watch at `{slug}.varalabs.systems/live`

---

## Infrastructure

| Component | Details |
|-----------|---------|
| Azure VM | 20.196.73.173 |
| Docker image | `tribenest:varalabs` (patched from upstream) |
| Source on VM | `/opt/tribenest-src` |
| Patch dir | `/opt/tribenest-patch/` |
| Docker Compose | `/opt/tribenest/docker-compose.varalabs.yml` |
| Cloudflare Tunnel | VM port 80 → varalabs.systems |
| Redis | Separate container, port 6379, password `VaraRedis@12345678` |

---

## Deployment Workflow

```bash
# 1. Dev machine — push changes
git push origin main

# 2. VM — pull and rebuild backend
cd /opt/tribenest-src && git pull
cd apps/backend
npx tsc && npx tsc-alias
cp dist/configuration/secrets.js /opt/tribenest-patch/backend-patch/configuration/secrets.js
cp dist/services/admin/scheduledStream/index.js /opt/tribenest-patch/backend-patch/services/admin/scheduledStream/index.js

# 3. VM — rebuild frontend
cd /opt/tribenest-src/apps/client
ROOT_DOMAIN=varalabs.systems NEXT_PUBLIC_API_URL=https://api.varalabs.systems npx next build
tar -czf /opt/tribenest-patch/next-build.tar.gz .next

# 4. VM — rebuild Docker image and redeploy
cd /opt/tribenest-patch
docker build -t tribenest:varalabs .
cd /opt/tribenest
docker-compose -f docker-compose.varalabs.yml up -d --force-recreate
```

---

## Source Changes (commit `ad08c5c`)

| File | Change |
|------|--------|
| `apps/backend/src/configuration/secrets.ts` | Added `CREATOR_PORTAL_URL`, `GOOGLE_REDIRECT_URI`, `TWITCH_REDIRECT_URI` |
| `apps/backend/src/services/admin/scheduledStream/index.ts` | FFmpeg push to all RTMP channels on activation |
| `apps/client/app/oauth/youtube/page.tsx` | YouTube OAuth callback page (**new**) |
| `apps/client/app/oauth/twitch/page.tsx` | Twitch OAuth callback page (**new**) |
| `apps/client/app/(creator-portal)/creators/[slug]/dashboard/page.tsx` | Full platform connect UI with OAuth + RTMP form |

### Previously fixed (already deployed)
- `profileAuthorization.model.ts` — added `p.subdomain` to select (fixes redirect after login)
- `scheduledStreams/schema.ts` — wrapped in `body:` for ValidateSchema decorator
- `LiveBroadcastsContent.tsx` — scheduled stream live video player

---

## Pending Tasks

- [ ] On VM: rebuild backend (`tsc` + `tsc-alias`) and copy to patch dir
- [ ] On VM: rebuild Next.js and tar `.next`
- [ ] Add FFmpeg to Dockerfile (before `USER nextjs`):
  ```dockerfile
  RUN apt-get update && apt-get install -y ffmpeg && rm -rf /var/lib/apt/lists/*
  ```
- [ ] Rebuild Docker image and redeploy
- [ ] Add OAuth credentials to `docker-compose.varalabs.yml`:
  ```yaml
  GOOGLE_CLIENT_ID: "..."
  GOOGLE_CLIENT_SECRET: "..."
  TWITCH_CLIENT_ID: "..."
  TWITCH_CLIENT_SECRET: "..."
  ```
- [ ] Test full Restream.io flow end-to-end

---

## Environment Variables (docker-compose.varalabs.yml)

### Currently set
```yaml
MULTI_TENANT: "true"
JWT_SECRET: "varalabs-secret-jwt-2026"
CREATOR_PORTAL_URL: "https://varalabs.systems"
GOOGLE_REDIRECT_URI: "https://varalabs.systems/oauth/youtube"
TWITCH_REDIRECT_URI: "https://varalabs.systems/oauth/twitch"
REDIS_URL: "redis://:VaraRedis@12345678@172.17.0.1:6379"
```

### Still needed (for OAuth to work)
```yaml
GOOGLE_CLIENT_ID: ""       # From Google Cloud Console
GOOGLE_CLIENT_SECRET: ""   # From Google Cloud Console
TWITCH_CLIENT_ID: ""       # From dev.twitch.tv
TWITCH_CLIENT_SECRET: ""   # From dev.twitch.tv
```

**OAuth redirect URIs to register:**
- Google: `https://varalabs.systems/oauth/youtube`
- Twitch: `https://varalabs.systems/oauth/twitch`

---

## Key Technical Gotchas

1. **`tsc-alias` is required** after `tsc` — otherwise `@src/` imports fail at runtime
2. **`ValidateSchema` decorator** wraps body as `{ body, query }` — all schemas need `body:` wrapper
3. **`/streams/channels`** returns paginated `{ data, total, page }` — not a plain array
4. **Custom RTMP** expects `{ profileId, title, ingestUrl }` where `ingestUrl = rtmpUrl + "/" + streamKey`
5. **`MULTI_TENANT=true`** must be set — otherwise account creation is blocked
6. **Next.js version** in compiled `.next` must match container's `node_modules/next` — tar and inject if mismatch
7. **Patch Dockerfile** injects over upstream image — never edit upstream source on the VM directly

---

## How Simulive Streaming Works

1. Creator uploads video → gets presigned S3/MinIO URL → video stored at `scheduled-streams/{profileId}/{filename}`
2. Creator schedules stream with `scheduledAt` time and video URL
3. BullMQ cron job runs every minute → calls `activateDueStreams()`
4. For each due stream: status set to `"live"`, then FFmpeg spawned for each connected channel
5. FFmpeg reads video at real-time speed (`-re`) from MinIO URL and pushes to RTMP endpoint
6. Viewers on `{slug}.varalabs.systems/live` see the `<video>` player with the stream
