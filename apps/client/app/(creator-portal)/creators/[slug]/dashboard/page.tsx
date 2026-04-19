"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useCallback } from "react";
import axios from "axios";
import { useCreatorAuth } from "../../../../_contexts/creator-auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

type PlaylistVideo = {
  id: string;
  playlistId: string;
  title: string;
  videoUrl: string;
  videoFilename: string;
  position: number;
};

type StreamPlaylist = {
  id: string;
  title: string;
  status: "idle" | "live" | "paused" | "ended";
  repeatCount: number | null;
  currentRepeat: number;
  currentVideoIndex: number;
  scheduledStartAt: string | null;
  scheduledEndAt: string | null;
  items: PlaylistVideo[];
};

export default function CreatorDashboard({ params }: { params: Promise<{ slug: string }> }) {
  const { isAuthenticated, isLoading, account, authorizations, token, logout } = useCreatorAuth();
  const router = useRouter();
  const [slug, setSlug] = useState<string>("");

  useEffect(() => {
    params.then((p) => setSlug(p.slug));
  }, [params]);

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) { router.replace("/login"); return; }
    if (slug) {
      const owns = authorizations.some((a) => a.profile.subdomain === slug);
      if (!owns) router.replace("/login");
    }
  }, [isAuthenticated, isLoading, authorizations, slug]);

  if (isLoading || !slug) return <LoadingScreen />;
  if (!isAuthenticated) return null;

  const profile = authorizations.find((a) => a.profile.subdomain === slug)?.profile;
  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "varalabs.systems";

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col">
      <nav className="flex items-center justify-between px-6 py-4 border-b border-white/5">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-lg font-bold tracking-tight">TribeNest</Link>
          <span className="text-white/20">/</span>
          <span className="text-sm text-white/50">{profile?.name ?? slug}</span>
        </div>
        <div className="flex items-center gap-4">
          <a href={`https://admin.${rootDomain}`} target="_blank" rel="noreferrer"
            className="text-sm text-white/40 hover:text-white transition-colors">Admin panel ↗</a>
          <a href={`https://${slug}.${rootDomain}`} target="_blank" rel="noreferrer"
            className="text-sm text-white/40 hover:text-white transition-colors">View channel ↗</a>
          <button onClick={() => { logout(); router.push("/"); }}
            className="text-sm text-white/30 hover:text-white/60 transition-colors">Sign out</button>
        </div>
      </nav>

      <div className="flex-1 max-w-5xl mx-auto w-full px-4 py-10">
        <div className="mb-10">
          <h1 className="text-3xl font-bold">Welcome back, {account?.firstName}</h1>
          <p className="text-white/40 mt-1">
            Your channel:{" "}
            <a href={`https://${slug}.${rootDomain}`} target="_blank" rel="noreferrer"
              className="text-orange-400 hover:text-orange-300 transition-colors">
              {slug}.{rootDomain}
            </a>
          </p>
        </div>

        <section className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Stream Playlists</h2>
            {profile && token && (
              <CreatePlaylistButton profileId={profile.id} token={token} />
            )}
          </div>
          <div className="mb-4 px-4 py-3 rounded-lg bg-white/[0.03] border border-white/5 flex items-start gap-3">
            <span className="text-lg mt-0.5">📡</span>
            <div>
              <p className="text-sm text-white/70 font-medium">Multi-video 24/7 streams</p>
              <p className="text-xs text-white/40 mt-0.5">
                Create playlists with multiple videos that play one after another in a continuous loop. Schedule start/end times and set repetitions. Stream at{" "}
                <a href={`https://${slug}.${rootDomain}/live`} target="_blank" rel="noreferrer"
                  className="text-orange-400 hover:text-orange-300">
                  {slug}.{rootDomain}/live
                </a>
              </p>
            </div>
          </div>
          {profile && token && <PlaylistsList profileId={profile.id} token={token} />}
        </section>

        {profile && token && (
          <section className="mb-10">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-semibold">Streaming Platforms</h2>
                <p className="text-sm text-white/40 mt-0.5">Connect RTMP destinations to stream live or replay using OBS / Restream</p>
              </div>
            </div>
            <StreamChannels profileId={profile.id} token={token} slug={slug} rootDomain={rootDomain} />
          </section>
        )}

        <section>
          <h2 className="text-xl font-semibold mb-4">Manage your channel</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <QuickLink href={`https://admin.${rootDomain}`} icon="⚙️" title="Admin panel"
              description="Manage posts, memberships, events and website design." external />
            <QuickLink href={`https://${slug}.${rootDomain}`} icon="🌐" title="Your site"
              description="See what your audience sees when they visit your channel." external />
            <QuickLink href={`https://${slug}.${rootDomain}/live`} icon="📡" title="Live page"
              description="Your audience watches scheduled streams here." external />
          </div>
        </section>
      </div>
    </div>
  );
}

/* ── Stream Playlists ─────────────────────────────── */

function CreatePlaylistButton({ profileId, token }: { profileId: string; token: string }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [repeatCount, setRepeatCount] = useState("");
  const [scheduledStartAt, setScheduledStartAt] = useState("");
  const [scheduledEndAt, setScheduledEndAt] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const apiClient = axios.create({ baseURL: API_URL, headers: { authorization: `Bearer ${token}` } });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setError("");
    try {
      await apiClient.post("/stream-playlists", {
        profileId,
        title,
        repeatCount: repeatCount ? parseInt(repeatCount) : null,
        scheduledStartAt: scheduledStartAt || null,
        scheduledEndAt: scheduledEndAt || null,
      });
      setTitle(""); setRepeatCount(""); setScheduledStartAt(""); setScheduledEndAt("");
      setOpen(false);
      window.dispatchEvent(new CustomEvent("playlists-updated"));
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Failed to create playlist.");
    } finally { setSaving(false); }
  };

  if (!open) return (
    <button onClick={() => setOpen(true)}
      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-orange-500 hover:bg-orange-400 text-white text-sm font-semibold transition-colors">
      + New playlist
    </button>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
      <div className="w-full max-w-md bg-[#111] border border-white/10 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">Create stream playlist</h3>
          <button onClick={() => { setOpen(false); setError(""); }} className="text-white/40 hover:text-white text-xl">×</button>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {error && <div className="px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>}
          <ModalField label="Playlist name">
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Weekend Show" required className={modalInputClass} />
          </ModalField>
          <ModalField label="Repeat count (blank = infinite loop)">
            <input type="number" min="1" value={repeatCount} onChange={(e) => setRepeatCount(e.target.value)}
              placeholder="Leave blank to loop forever" className={modalInputClass} />
          </ModalField>
          <ModalField label="Schedule start (optional)">
            <input type="datetime-local" value={scheduledStartAt} onChange={(e) => setScheduledStartAt(e.target.value)} className={modalInputClass} />
          </ModalField>
          <ModalField label="Schedule end (optional)">
            <input type="datetime-local" value={scheduledEndAt} onChange={(e) => setScheduledEndAt(e.target.value)} className={modalInputClass} />
          </ModalField>
          <div className="flex gap-3 mt-2">
            <button type="button" onClick={() => { setOpen(false); setError(""); }}
              className="flex-1 py-3 rounded-lg border border-white/10 hover:border-white/30 text-white/60 hover:text-white text-sm font-semibold transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={saving || !title}
              className="flex-1 py-3 rounded-lg bg-orange-500 hover:bg-orange-400 disabled:opacity-50 text-white font-semibold text-sm transition-colors">
              {saving ? "Creating…" : "Create playlist"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function PlaylistsList({ profileId, token }: { profileId: string; token: string }) {
  const [playlists, setPlaylists] = useState<StreamPlaylist[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const apiClient = useCallback(() => axios.create({
    baseURL: API_URL,
    headers: { authorization: `Bearer ${token}` },
  }), [token]);

  const fetchPlaylists = useCallback(async () => {
    try {
      const { data } = await apiClient().get(`/stream-playlists?profileId=${profileId}`);
      setPlaylists(Array.isArray(data) ? data : []);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, [profileId, token]);

  useEffect(() => { fetchPlaylists(); }, [fetchPlaylists]);

  useEffect(() => {
    const handler = () => fetchPlaylists();
    window.addEventListener("playlists-updated", handler);
    return () => window.removeEventListener("playlists-updated", handler);
  }, [fetchPlaylists]);

  const doAction = async (playlistId: string, action: string) => {
    setActionLoading(playlistId + action);
    try {
      await apiClient().post(`/stream-playlists/${playlistId}/${action}?profileId=${profileId}`);
      await fetchPlaylists();
    } catch { /* ignore */ }
    finally { setActionLoading(null); }
  };

  const deletePlaylist = async (id: string) => {
    setActionLoading(id + "delete");
    try {
      await apiClient().delete(`/stream-playlists/${id}?profileId=${profileId}`);
      setPlaylists((prev) => prev.filter((p) => p.id !== id));
    } catch { /* ignore */ }
    finally { setActionLoading(null); }
  };

  if (loading) return <div className="h-32 flex items-center justify-center text-white/30 text-sm">Loading…</div>;

  if (playlists.length === 0) return (
    <div className="rounded-xl border border-white/5 bg-white/[0.02] flex flex-col items-center justify-center py-16 text-center">
      <span className="text-3xl mb-3">🎬</span>
      <p className="text-white/40 text-sm">No playlists yet</p>
      <p className="text-white/20 text-xs mt-1">Create a playlist, add videos, then hit Start to go live</p>
    </div>
  );

  return (
    <div className="flex flex-col gap-4">
      {playlists.map((pl) => (
        <PlaylistCard
          key={pl.id}
          playlist={pl}
          profileId={profileId}
          token={token}
          expanded={expandedId === pl.id}
          onToggle={() => setExpandedId(expandedId === pl.id ? null : pl.id)}
          onAction={doAction}
          onDelete={() => deletePlaylist(pl.id)}
          actionLoading={actionLoading}
          onRefresh={fetchPlaylists}
        />
      ))}
    </div>
  );
}

function PlaylistCard({
  playlist, profileId, token, expanded, onToggle, onAction, onDelete, actionLoading, onRefresh,
}: {
  playlist: StreamPlaylist; profileId: string; token: string;
  expanded: boolean; onToggle: () => void;
  onAction: (id: string, action: string) => void;
  onDelete: () => void;
  actionLoading: string | null;
  onRefresh: () => void;
}) {
  const [addVideoOpen, setAddVideoOpen] = useState(false);
  const [removingVideoId, setRemovingVideoId] = useState<string | null>(null);

  const apiClient = useCallback(() => axios.create({
    baseURL: API_URL,
    headers: { authorization: `Bearer ${token}` },
  }), [token]);

  const removeVideo = async (videoId: string) => {
    setRemovingVideoId(videoId);
    try {
      await apiClient().delete(`/stream-playlists/${playlist.id}/videos/${videoId}?profileId=${profileId}`);
      onRefresh();
    } catch { /* ignore */ }
    finally { setRemovingVideoId(null); }
  };

  const isLive = playlist.status === "live";
  const isPaused = playlist.status === "paused";
  const isIdle = playlist.status === "idle";
  const isEnded = playlist.status === "ended";

  return (
    <div className="rounded-xl border border-white/5 bg-white/[0.02] overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 flex items-center gap-3">
        <button onClick={onToggle} className="flex-1 flex items-center gap-3 text-left">
          <span className="text-sm font-semibold text-white/80 truncate">{playlist.title}</span>
          <PlaylistStatusBadge status={playlist.status} />
          <span className="text-xs text-white/30">{playlist.items?.length ?? 0} videos</span>
          {playlist.repeatCount !== null && (
            <span className="text-xs text-white/20">×{playlist.repeatCount}</span>
          )}
        </button>
        {/* Controls */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {isIdle && (
            <button onClick={() => onAction(playlist.id, "start")}
              disabled={!!actionLoading}
              className="px-3 py-1.5 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 text-xs font-semibold transition-colors disabled:opacity-50">
              ▶ Start
            </button>
          )}
          {isLive && (
            <>
              <button onClick={() => onAction(playlist.id, "pause")}
                disabled={!!actionLoading}
                className="px-3 py-1.5 rounded-lg bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30 text-xs font-semibold transition-colors disabled:opacity-50">
                ⏸ Pause
              </button>
              <button onClick={() => onAction(playlist.id, "stop")}
                disabled={!!actionLoading}
                className="px-3 py-1.5 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 text-xs font-semibold transition-colors disabled:opacity-50">
                ■ Stop
              </button>
            </>
          )}
          {isPaused && (
            <>
              <button onClick={() => onAction(playlist.id, "resume")}
                disabled={!!actionLoading}
                className="px-3 py-1.5 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 text-xs font-semibold transition-colors disabled:opacity-50">
                ▶ Resume
              </button>
              <button onClick={() => onAction(playlist.id, "stop")}
                disabled={!!actionLoading}
                className="px-3 py-1.5 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 text-xs font-semibold transition-colors disabled:opacity-50">
                ■ Stop
              </button>
            </>
          )}
          {isEnded && (
            <button onClick={() => onAction(playlist.id, "start")}
              disabled={!!actionLoading}
              className="px-3 py-1.5 rounded-lg bg-white/10 text-white/40 hover:bg-white/20 text-xs font-semibold transition-colors disabled:opacity-50">
              ↺ Restart
            </button>
          )}
          <button onClick={onDelete}
            disabled={!!actionLoading}
            className="px-2 py-1.5 text-white/20 hover:text-red-400 transition-colors text-xs disabled:opacity-50">
            ✕
          </button>
          <button onClick={onToggle} className="text-white/30 hover:text-white transition-colors text-sm">
            {expanded ? "▲" : "▼"}
          </button>
        </div>
      </div>

      {/* Expanded video list */}
      {expanded && (
        <div className="border-t border-white/5">
          {playlist.items?.length === 0 ? (
            <div className="flex flex-col items-center py-8 text-center">
              <p className="text-white/30 text-sm">No videos yet</p>
              <p className="text-white/20 text-xs mt-1">Add videos to this playlist</p>
            </div>
          ) : (
            <div>
              {playlist.items?.map((video, idx) => (
                <div key={video.id}
                  className={`px-4 py-3 border-b border-white/5 last:border-0 flex items-center gap-3 ${
                    isLive && idx === playlist.currentVideoIndex ? "bg-white/[0.03]" : ""
                  }`}>
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-white/5 text-white/30 text-xs flex items-center justify-center font-medium">
                    {isLive && idx === playlist.currentVideoIndex ? "▶" : idx + 1}
                  </span>
                  <span className="text-sm text-white/70 truncate flex-1">{video.title}</span>
                  {isLive && idx === playlist.currentVideoIndex && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/20">Playing</span>
                  )}
                  <button onClick={() => removeVideo(video.id)}
                    disabled={removingVideoId === video.id}
                    className="text-white/20 hover:text-red-400 transition-colors text-xs disabled:opacity-50">
                    {removingVideoId === video.id ? "…" : "remove"}
                  </button>
                </div>
              ))}
            </div>
          )}
          <div className="px-4 py-3 border-t border-white/5">
            {addVideoOpen ? (
              <AddVideoForm
                playlistId={playlist.id}
                profileId={profileId}
                token={token}
                onDone={() => { setAddVideoOpen(false); onRefresh(); }}
                onCancel={() => setAddVideoOpen(false)}
              />
            ) : (
              <button onClick={() => setAddVideoOpen(true)}
                className="text-sm text-orange-400 hover:text-orange-300 transition-colors">
                + Add video
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function AddVideoForm({ playlistId, profileId, token, onDone, onCancel }: {
  playlistId: string; profileId: string; token: string; onDone: () => void; onCancel: () => void;
}) {
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const apiClient = axios.create({ baseURL: API_URL, headers: { authorization: `Bearer ${token}` } });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !title) return;
    setUploading(true); setError("");
    try {
      const { data: { presignedUrl, remoteUrl } } = await apiClient.post("/stream-playlists/presigned-url", {
        profileId, filename: file.name,
      });
      await axios.put(presignedUrl, file, {
        headers: { "Content-Type": file.type || "video/mp4" },
        onUploadProgress: (evt) => { if (evt.total) setProgress(Math.round((evt.loaded * 100) / evt.total)); },
      });
      await apiClient.post(`/stream-playlists/${playlistId}/videos?profileId=${profileId}`, {
        title, videoUrl: remoteUrl, videoFilename: file.name,
      });
      onDone();
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Upload failed.");
    } finally { setUploading(false); }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      {error && <p className="text-red-400 text-xs">{error}</p>}
      <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Video title" required
        className={miniInputClass} />
      <div onClick={() => !uploading && fileRef.current?.click()}
        className="flex items-center justify-center gap-2 py-4 rounded-lg border border-dashed border-white/10 hover:border-orange-500/40 cursor-pointer transition-colors text-center">
        {uploading ? (
          <div className="flex flex-col items-center gap-1 w-full px-4">
            <div className="w-full bg-white/10 rounded-full h-1.5"><div className="h-full bg-orange-500 transition-all" style={{ width: `${progress}%` }} /></div>
            <span className="text-xs text-white/40">{progress}%</span>
          </div>
        ) : file ? (
          <span className="text-xs text-white/50">{file.name} ({(file.size / 1024 / 1024).toFixed(1)} MB)</span>
        ) : (
          <span className="text-xs text-white/30">Click to select video</span>
        )}
      </div>
      <input ref={fileRef} type="file" accept="video/*" onChange={(e) => setFile(e.target.files?.[0] ?? null)} className="hidden" />
      <div className="flex gap-2">
        <button type="button" onClick={onCancel} className="flex-1 py-2 rounded-lg border border-white/10 text-white/40 text-xs hover:text-white transition-colors">Cancel</button>
        <button type="submit" disabled={uploading || !file || !title}
          className="flex-1 py-2 rounded-lg bg-orange-500 hover:bg-orange-400 disabled:opacity-50 text-white text-xs font-semibold transition-colors">
          {uploading ? "Uploading…" : "Add video"}
        </button>
      </div>
    </form>
  );
}

function PlaylistStatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    idle: "bg-white/5 text-white/30 border-white/10",
    live: "bg-green-500/10 text-green-400 border-green-500/20",
    paused: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    ended: "bg-white/5 text-white/20 border-white/5",
  };
  const labels: Record<string, string> = { idle: "Idle", live: "🔴 Live", paused: "⏸ Paused", ended: "Ended" };
  return (
    <span className={`px-2 py-0.5 rounded-full border text-xs font-medium ${map[status] ?? map.idle}`}>
      {labels[status] ?? status}
    </span>
  );
}

/* ── Stream Channels ──────────────────────────────── */

type StreamChannel = {
  id: string;
  title: string;
  channelProvider: "youtube" | "twitch" | "custom_rtmp";
  currentEndpoint: string | null;
  externalId: string | null;
  brandingSettings: any;
};

const PLATFORMS = [
  {
    id: "youtube",
    name: "YouTube",
    icon: "▶",
    color: "#FF0000",
    bg: "bg-red-600",
    description: "Stream to YouTube Live",
    oauthSupported: true,
    rtmpUrl: "rtmp://a.rtmp.youtube.com/live2",
    rtmpPlaceholder: "rtmp://a.rtmp.youtube.com/live2",
  },
  {
    id: "twitch",
    name: "Twitch",
    icon: "♟",
    color: "#9146FF",
    bg: "bg-purple-600",
    description: "Stream to Twitch",
    oauthSupported: true,
    rtmpUrl: "rtmp://live.twitch.tv/app",
    rtmpPlaceholder: "rtmp://live.twitch.tv/app",
  },
  {
    id: "facebook",
    name: "Facebook",
    icon: "f",
    color: "#1877F2",
    bg: "bg-blue-600",
    description: "Stream to Facebook Live",
    oauthSupported: false,
    rtmpUrl: "rtmps://live-api-s.facebook.com:443/rtmp",
    rtmpPlaceholder: "rtmps://live-api-s.facebook.com:443/rtmp",
  },
  {
    id: "tiktok",
    name: "TikTok",
    icon: "♪",
    color: "#010101",
    bg: "bg-black border border-white/10",
    description: "Stream to TikTok Live",
    oauthSupported: false,
    rtmpUrl: "rtmp://push.tiktok.com/live",
    rtmpPlaceholder: "rtmp://push.tiktok.com/live",
  },
  {
    id: "instagram",
    name: "Instagram",
    icon: "◎",
    color: "#E1306C",
    bg: "bg-pink-600",
    description: "Stream to Instagram Live",
    oauthSupported: false,
    rtmpUrl: "rtmps://live-upload.instagram.com:443/rtmp",
    rtmpPlaceholder: "rtmps://live-upload.instagram.com:443/rtmp",
  },
  {
    id: "custom",
    name: "Custom RTMP",
    icon: "⚡",
    color: "#F97316",
    bg: "bg-orange-500",
    description: "Any RTMP destination",
    oauthSupported: false,
    rtmpUrl: "",
    rtmpPlaceholder: "rtmp://your-server/live",
  },
] as const;

function StreamChannels({ profileId, token, slug, rootDomain }: {
  profileId: string; token: string; slug: string; rootDomain: string;
}) {
  const [channels, setChannels] = useState<StreamChannel[]>([]);
  const [loading, setLoading] = useState(true);
  const [connectingPlatform, setConnectingPlatform] = useState<string | null>(null);
  const [rtmpForm, setRtmpForm] = useState<{ platformId: string; title: string; ingestUrl: string; streamKey: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const apiClient = useCallback(() => axios.create({
    baseURL: API_URL,
    headers: { authorization: `Bearer ${token}` },
  }), [token]);

  const fetchChannels = useCallback(() => {
    apiClient().get(`/streams/channels?profileId=${profileId}`)
      .then((r) => setChannels(Array.isArray(r.data) ? r.data : (r.data?.data ?? [])))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [profileId, token]);

  useEffect(() => { fetchChannels(); }, [fetchChannels]);

  const handleOAuth = async (platformId: string) => {
    setConnectingPlatform(platformId);
    try {
      const endpoint = platformId === "youtube"
        ? `/streams/oauth/youtube/url?profileId=${profileId}`
        : `/streams/oauth/twitch/url?profileId=${profileId}`;
      const { data } = await apiClient().get(endpoint);
      const oauthUrl = data.url || data;
      // Pass profileId as state param for callback
      window.location.href = oauthUrl;
    } catch {
      setConnectingPlatform(null);
    }
  };

  const handleRtmpConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rtmpForm) return;
    setSaving(true);
    setError("");
    try {
      const ingestUrl = rtmpForm.streamKey
        ? `${rtmpForm.ingestUrl.replace(/\/$/, "")}/${rtmpForm.streamKey}`
        : rtmpForm.ingestUrl;
      await apiClient().post("/streams/channels/custom-rtmp", {
        profileId,
        title: rtmpForm.title,
        ingestUrl,
      });
      setRtmpForm(null);
      fetchChannels();
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Failed to connect. Check your RTMP URL and stream key.");
    } finally {
      setSaving(false);
    }
  };

  const isConnected = (platformId: string) =>
    channels.some((c) =>
      c.channelProvider === platformId ||
      (platformId === "facebook" && c.channelProvider === "custom_rtmp" && c.currentEndpoint?.includes("facebook")) ||
      (platformId === "tiktok" && c.channelProvider === "custom_rtmp" && c.currentEndpoint?.includes("tiktok")) ||
      (platformId === "instagram" && c.channelProvider === "custom_rtmp" && c.currentEndpoint?.includes("instagram")) ||
      (platformId === "custom" && c.channelProvider === "custom_rtmp"),
    );

  const livePageUrl = `https://${slug}.${rootDomain}/live`;

  return (
    <div className="space-y-6">
      {/* Your built-in destination */}
      <div className="rounded-xl border border-green-500/20 bg-green-500/5 px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center text-lg">🌐</div>
          <div>
            <p className="text-sm font-semibold text-white/90">
              Your Channel Live Page
              <span className="ml-2 px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 text-xs font-medium">Always on</span>
            </p>
            <a href={livePageUrl} target="_blank" rel="noreferrer"
              className="text-xs text-green-400 hover:text-green-300 transition-colors">{livePageUrl}</a>
          </div>
        </div>
        <a href={livePageUrl} target="_blank" rel="noreferrer"
          className="text-xs px-3 py-1.5 rounded-lg border border-green-500/20 text-green-400 hover:bg-green-500/10 transition-colors">
          Preview ↗
        </a>
      </div>

      {/* Platform grid */}
      <div>
        <p className="text-xs text-white/30 uppercase tracking-wide font-medium mb-3">Connect platforms — stream to all at once</p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {PLATFORMS.map((platform) => {
            const connected = isConnected(platform.id);
            const connectedChannels = channels.filter((c) =>
              c.channelProvider === platform.id ||
              (platform.id !== "youtube" && platform.id !== "twitch" && c.channelProvider === "custom_rtmp"),
            );
            const isConnecting = connectingPlatform === platform.id;

            return (
              <div key={platform.id}
                className={`relative rounded-xl border p-4 transition-all ${
                  connected
                    ? "border-green-500/30 bg-green-500/5"
                    : "border-white/5 bg-white/[0.02] hover:border-white/10"
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-10 h-10 rounded-xl ${platform.bg} flex items-center justify-center text-white font-bold text-lg`}>
                    {platform.icon}
                  </div>
                  {connected && (
                    <span className="px-1.5 py-0.5 rounded-full bg-green-500/20 text-green-400 text-xs font-medium">
                      Connected
                    </span>
                  )}
                </div>
                <p className="text-sm font-semibold text-white/80 mb-0.5">{platform.name}</p>
                <p className="text-xs text-white/30 mb-3">{platform.description}</p>

                {connected ? (
                  <div className="text-xs text-white/30">
                    {connectedChannels.map((c) => (
                      <p key={c.id} className="truncate font-medium text-white/50">{c.title || "Connected"}</p>
                    ))}
                  </div>
                ) : platform.oauthSupported ? (
                  <button
                    onClick={() => handleOAuth(platform.id)}
                    disabled={isConnecting}
                    className="w-full py-2 rounded-lg text-xs font-semibold text-white transition-colors disabled:opacity-50"
                    style={{ backgroundColor: platform.color }}
                  >
                    {isConnecting ? "Connecting…" : `Connect ${platform.name}`}
                  </button>
                ) : (
                  <button
                    onClick={() => setRtmpForm({ platformId: platform.id, title: platform.name, ingestUrl: platform.rtmpUrl, streamKey: "" })}
                    className="w-full py-2 rounded-lg border border-white/10 hover:border-white/20 text-xs font-semibold text-white/60 hover:text-white transition-colors"
                  >
                    Add stream key
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* RTMP form modal */}
      {rtmpForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-sm bg-[#111] border border-white/10 rounded-xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-semibold">Connect {rtmpForm.title}</h3>
              <button onClick={() => { setRtmpForm(null); setError(""); }} className="text-white/40 hover:text-white text-xl">×</button>
            </div>
            <form onSubmit={handleRtmpConnect} className="flex flex-col gap-3">
              {error && <p className="text-red-400 text-xs px-3 py-2 bg-red-500/10 rounded-lg">{error}</p>}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-white/50">Channel name</label>
                <input value={rtmpForm.title} onChange={(e) => setRtmpForm({ ...rtmpForm, title: e.target.value })}
                  className={miniInputClass} required />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-white/50">RTMP URL</label>
                <input value={rtmpForm.ingestUrl} onChange={(e) => setRtmpForm({ ...rtmpForm, ingestUrl: e.target.value })}
                  placeholder={PLATFORMS.find((p) => p.id === rtmpForm.platformId)?.rtmpPlaceholder}
                  className={miniInputClass} required />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-white/50">Stream key</label>
                <input type="password" value={rtmpForm.streamKey} onChange={(e) => setRtmpForm({ ...rtmpForm, streamKey: e.target.value })}
                  placeholder="Your stream key (kept secret)" className={miniInputClass} />
                <p className="text-xs text-white/20">Your stream key will be appended to the RTMP URL</p>
              </div>
              <div className="flex gap-3 mt-2">
                <button type="button" onClick={() => { setRtmpForm(null); setError(""); }}
                  className="flex-1 py-2.5 rounded-lg border border-white/10 text-white/50 text-sm hover:text-white transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={saving}
                  className="flex-1 py-2.5 rounded-lg bg-orange-500 hover:bg-orange-400 disabled:opacity-50 text-white text-sm font-semibold transition-colors">
                  {saving ? "Connecting…" : "Connect"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Connected channels list */}
      {channels.length > 0 && (
        <div className="rounded-xl border border-white/5 bg-white/[0.02] overflow-hidden">
          <div className="px-4 py-3 border-b border-white/5">
            <p className="text-xs text-white/30 uppercase tracking-wide font-medium">
              Connected destinations — scheduled videos stream to all of these
            </p>
          </div>
          {channels.map((ch) => (
            <div key={ch.id} className="px-4 py-3 border-b border-white/5 last:border-0 flex items-center gap-3 text-sm">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold ${
                ch.channelProvider === "youtube" ? "bg-red-600" :
                ch.channelProvider === "twitch" ? "bg-purple-600" : "bg-orange-500"
              }`}>
                {ch.channelProvider === "youtube" ? "▶" : ch.channelProvider === "twitch" ? "♟" : "⚡"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white/80 font-medium truncate">{ch.title}</p>
                <p className="text-white/30 text-xs capitalize">{ch.channelProvider.replace("_", " ")}</p>
              </div>
              <span className="flex-shrink-0 px-2 py-0.5 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-xs">Active</span>
            </div>
          ))}
        </div>
      )}

      {loading && (
        <div className="py-8 flex items-center justify-center text-white/30 text-sm">Loading channels…</div>
      )}
    </div>
  );
}

const miniInputClass = "w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/20 focus:outline-none focus:border-orange-500/60 transition-colors text-sm";

/* ── Shared sub-components ─────────────────────────── */

function QuickLink({ href, icon, title, description, external }: {
  href: string; icon: string; title: string; description: string; external?: boolean;
}) {
  return (
    <a href={href} {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
      className="p-5 rounded-xl border border-white/5 bg-white/[0.02] hover:border-orange-500/20 hover:bg-white/[0.04] transition-colors flex flex-col gap-2 group">
      <span className="text-2xl">{icon}</span>
      <div>
        <p className="font-semibold text-sm group-hover:text-orange-400 transition-colors">
          {title} {external && <span className="text-white/20">↗</span>}
        </p>
        <p className="text-xs text-white/40 mt-0.5 leading-relaxed">{description}</p>
      </div>
    </a>
  );
}

function ModalField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm text-white/50">{label}</label>
      {children}
    </div>
  );
}

const modalInputClass = "w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/20 focus:outline-none focus:border-orange-500/60 transition-colors text-sm";

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
      <div className="w-6 h-6 rounded-full border-2 border-orange-500 border-t-transparent animate-spin" />
    </div>
  );
}
