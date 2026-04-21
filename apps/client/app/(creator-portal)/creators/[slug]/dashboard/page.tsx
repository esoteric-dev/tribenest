"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useCallback } from "react";
import axios from "axios";
import { useCreatorAuth } from "../../../../_contexts/creator-auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

/* ── Types ──────────────────────────────────────────── */

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

type StreamChannel = {
  id: string;
  title: string;
  channelProvider: "youtube" | "twitch" | "custom_rtmp";
  currentEndpoint: string | null;
  externalId: string | null;
  brandingSettings: any;
};

/* ── Platform definitions ───────────────────────────── */

const PLATFORMS = [
  { id: "youtube", name: "YouTube", icon: "▶", color: "#FF0000", bg: "bg-red-600", oauthSupported: true, rtmpUrl: "rtmp://a.rtmp.youtube.com/live2", rtmpPlaceholder: "rtmp://a.rtmp.youtube.com/live2" },
  { id: "twitch", name: "Twitch", icon: "♟", color: "#9146FF", bg: "bg-purple-600", oauthSupported: true, rtmpUrl: "rtmp://live.twitch.tv/app", rtmpPlaceholder: "rtmp://live.twitch.tv/app" },
  { id: "facebook", name: "Facebook", icon: "f", color: "#1877F2", bg: "bg-blue-600", oauthSupported: false, rtmpUrl: "rtmps://live-api-s.facebook.com:443/rtmp", rtmpPlaceholder: "rtmps://live-api-s.facebook.com:443/rtmp" },
  { id: "tiktok", name: "TikTok", icon: "♪", color: "#010101", bg: "bg-zinc-900", oauthSupported: false, rtmpUrl: "rtmp://push.tiktok.com/live", rtmpPlaceholder: "rtmp://push.tiktok.com/live" },
  { id: "instagram", name: "Instagram", icon: "◎", color: "#E1306C", bg: "bg-pink-600", oauthSupported: false, rtmpUrl: "rtmps://live-upload.instagram.com:443/rtmp", rtmpPlaceholder: "rtmps://live-upload.instagram.com:443/rtmp" },
  { id: "custom", name: "Custom RTMP", icon: "⚡", color: "#F97316", bg: "bg-orange-500", oauthSupported: false, rtmpUrl: "", rtmpPlaceholder: "rtmp://your-server/live" },
] as const;

/* ── Main dashboard ─────────────────────────────────── */

export default function CreatorDashboard({ params }: { params: Promise<{ slug: string }> }) {
  const { isAuthenticated, isLoading, account, authorizations, token, logout } = useCreatorAuth();
  const router = useRouter();
  const [slug, setSlug] = useState<string>("");
  const [activeSection, setActiveSection] = useState<"home" | "playlists" | "destinations">("home");

  useEffect(() => { params.then((p) => setSlug(p.slug)); }, [params]);

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
  const livePageUrl = `https://${slug}.${rootDomain}/live`;

  return (
    <div className="flex min-h-screen bg-[#1c1c1e] text-white">

      {/* ── Sidebar ── */}
      <aside className="w-52 flex-shrink-0 bg-[#141416] flex flex-col border-r border-white/[0.06]">
        {/* Logo */}
        <div className="px-5 py-5 border-b border-white/[0.06]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center text-white font-black text-sm">TN</div>
            <div>
              <p className="text-sm font-bold text-white leading-none">TribeNest</p>
              <p className="text-[10px] text-white/30 mt-0.5">Creator Studio</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          <p className="text-[10px] uppercase tracking-widest text-white/25 font-semibold px-2 mb-2">Streaming</p>
          <SidebarItem icon="⊞" label="Dashboard" active={activeSection === "home"} onClick={() => setActiveSection("home")} />
          <SidebarItem icon="▶" label="Playlists" active={activeSection === "playlists"} onClick={() => setActiveSection("playlists")} />

          <p className="text-[10px] uppercase tracking-widest text-white/25 font-semibold px-2 mt-5 mb-2">Destinations</p>
          <SidebarItem icon="⊕" label="Social Platforms" active={activeSection === "destinations"} onClick={() => setActiveSection("destinations")} />
          <SidebarItem icon="🌐" label="Live Page" onClick={() => window.open(livePageUrl, "_blank")} />

          <p className="text-[10px] uppercase tracking-widest text-white/25 font-semibold px-2 mt-5 mb-2">Channel</p>
          <SidebarItem icon="⚙" label="Admin Panel" onClick={() => window.open(`https://admin.${rootDomain}`, "_blank")} />
          <SidebarItem icon="↗" label="Your Site" onClick={() => window.open(`https://${slug}.${rootDomain}`, "_blank")} />
        </nav>

        {/* User */}
        <div className="px-4 py-4 border-t border-white/[0.06]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-orange-400 font-bold text-sm flex-shrink-0">
              {account?.firstName?.[0]?.toUpperCase() ?? "?"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white/80 truncate">{account?.firstName} {account?.lastName}</p>
              <p className="text-[10px] text-white/30 truncate">{slug}.{rootDomain}</p>
            </div>
            <button onClick={() => { logout(); router.push("/"); }} className="text-white/20 hover:text-white/60 transition-colors text-xs" title="Sign out">⏻</button>
          </div>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Top bar */}
        <header className="h-14 bg-[#141416] border-b border-white/[0.06] flex items-center px-6 gap-4 flex-shrink-0">
          {activeSection === "home" && profile && token && (
            <QuickCreateButton profileId={profile.id} token={token} />
          )}
          <div className="flex-1" />
          <a href={livePageUrl} target="_blank" rel="noreferrer"
            className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white/70 transition-colors border border-white/10 rounded-lg px-3 py-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            Live Page
          </a>
          <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold text-sm">
            {account?.firstName?.[0]?.toUpperCase() ?? "?"}
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto p-6">

          {activeSection === "home" && profile && token && (
            <HomeSection
              profile={profile}
              token={token}
              slug={slug}
              rootDomain={rootDomain}
              onGoToPlaylists={() => setActiveSection("playlists")}
              onGoToDestinations={() => setActiveSection("destinations")}
            />
          )}

          {activeSection === "playlists" && profile && token && (
            <PlaylistsSection profileId={profile.id} token={token} />
          )}

          {activeSection === "destinations" && profile && token && (
            <DestinationsSection profileId={profile.id} token={token} slug={slug} rootDomain={rootDomain} />
          )}

        </main>
      </div>
    </div>
  );
}

/* ── Sidebar item ───────────────────────────────────── */

function SidebarItem({ icon, label, active, onClick }: { icon: string; label: string; active?: boolean; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2.5 px-2 py-2 rounded-lg text-sm transition-all text-left ${
        active ? "bg-white/10 text-white font-medium" : "text-white/40 hover:text-white/70 hover:bg-white/5"
      }`}
    >
      <span className="text-base w-5 text-center">{icon}</span>
      {label}
    </button>
  );
}

/* ── Quick create button (top bar) ─────────────────── */

function QuickCreateButton({ profileId, token }: { profileId: string; token: string }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [saving, setSaving] = useState(false);
  const apiClient = axios.create({ baseURL: API_URL, headers: { authorization: `Bearer ${token}` } });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await apiClient.post("/stream-playlists", { profileId, title, repeatCount: null });
      setTitle(""); setOpen(false);
      window.dispatchEvent(new CustomEvent("playlists-updated"));
    } catch { /* ignore */ }
    finally { setSaving(false); }
  };

  return (
    <>
      <button onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-orange-500 hover:bg-orange-400 text-white text-sm font-semibold transition-colors">
        <span className="text-base leading-none">+</span> New Playlist
      </button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4" onClick={() => setOpen(false)}>
          <div className="w-full max-w-sm bg-[#1c1c1e] border border-white/10 rounded-2xl p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-base font-semibold mb-4">Create playlist</h3>
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Playlist name…" required className={inputClass} autoFocus />
              <div className="flex gap-2 mt-1">
                <button type="button" onClick={() => setOpen(false)} className="flex-1 py-2.5 rounded-xl border border-white/10 text-white/50 text-sm hover:text-white transition-colors">Cancel</button>
                <button type="submit" disabled={saving || !title} className="flex-1 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-400 disabled:opacity-50 text-white text-sm font-semibold transition-colors">
                  {saving ? "Creating…" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

/* ── Home section ───────────────────────────────────── */

function HomeSection({ profile, token, slug, rootDomain, onGoToPlaylists, onGoToDestinations }: {
  profile: any; token: string; slug: string; rootDomain: string;
  onGoToPlaylists: () => void; onGoToDestinations: () => void;
}) {
  const [channels, setChannels] = useState<StreamChannel[]>([]);
  const [connectingPlatform, setConnectingPlatform] = useState<string | null>(null);
  const apiClient = useCallback(() => axios.create({ baseURL: API_URL, headers: { authorization: `Bearer ${token}` } }), [token]);

  useEffect(() => {
    apiClient().get(`/streams/channels?profileId=${profile.id}`)
      .then((r) => setChannels(Array.isArray(r.data) ? r.data : (r.data?.data ?? [])))
      .catch(() => {});
  }, [profile.id, token]);

  const handleOAuth = async (platformId: string) => {
    setConnectingPlatform(platformId);
    try {
      const endpoint = platformId === "youtube"
        ? `/streams/oauth/youtube/url?profileId=${profile.id}`
        : `/streams/oauth/twitch/url?profileId=${profile.id}`;
      const { data } = await apiClient().get(endpoint);
      window.location.href = data.url || data;
    } catch { setConnectingPlatform(null); }
  };

  const platformIcons: Record<string, string> = { youtube: "▶", twitch: "♟", facebook: "f", tiktok: "♪", instagram: "◎" };

  return (
    <div className="max-w-6xl mx-auto space-y-5">

      {/* Add Social Platform banner */}
      <div className="rounded-2xl border border-white/[0.08] bg-[#1e1e20] px-5 py-3.5 flex items-center gap-4">
        <button
          onClick={onGoToDestinations}
          className="flex items-center gap-3 px-4 py-2 rounded-xl bg-white/[0.07] hover:bg-white/[0.11] border border-white/10 transition-colors text-sm font-semibold text-white flex-shrink-0"
        >
          <span className="text-lg">⊕</span> Add Social Platform
        </button>
        <div className="flex items-center gap-2 flex-wrap">
          {channels.length > 0 ? (
            channels.map((ch) => (
              <span key={ch.id} className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold text-white ${
                ch.channelProvider === "youtube" ? "bg-red-600/80" :
                ch.channelProvider === "twitch" ? "bg-purple-600/80" : "bg-orange-500/80"
              }`}>
                {platformIcons[ch.channelProvider] ?? "⚡"} {ch.title}
              </span>
            ))
          ) : (
            <p className="text-sm text-white/30">Connect platforms to simulcast your streams everywhere at once</p>
          )}
        </div>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Left: How to stream */}
        <div className="rounded-2xl border border-white/[0.08] bg-[#1e1e20] overflow-hidden">
          <div className="px-5 py-4 border-b border-white/[0.06]">
            <h2 className="text-sm font-semibold text-white/80">How would you like to stream?</h2>
          </div>
          <div className="p-4 space-y-3">

            {/* Pre-recorded playlist */}
            <StreamOptionCard
              thumbnail="🎬"
              thumbnailBg="bg-gradient-to-br from-orange-500/30 to-red-600/30"
              title="Pre-recorded Playlist"
              description="Stream video files one after another in a continuous loop — 24/7 simulive."
              action={
                <button onClick={onGoToPlaylists}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.07] hover:bg-white/[0.12] border border-white/10 text-xs font-semibold text-white/80 transition-colors">
                  Manage Playlists ▾
                </button>
              }
            />

            {/* Live page */}
            <StreamOptionCard
              thumbnail="📡"
              thumbnailBg="bg-gradient-to-br from-green-500/20 to-teal-600/20"
              title="Your Live Page"
              description="Always-on public page where your audience watches your scheduled streams."
              action={
                <a href={`https://${slug}.${rootDomain}/live`} target="_blank" rel="noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.07] hover:bg-white/[0.12] border border-white/10 text-xs font-semibold text-white/80 transition-colors">
                  Open Live Page ↗
                </a>
              }
            />

            {/* Connect destinations */}
            <StreamOptionCard
              thumbnail="⚡"
              thumbnailBg="bg-gradient-to-br from-purple-500/20 to-blue-600/20"
              title="Simulcast Destinations"
              description="Stream to YouTube, Twitch, Facebook, TikTok & more simultaneously."
              action={
                <div className="flex items-center gap-2">
                  {PLATFORMS.slice(0, 3).map((p) => (
                    <button
                      key={p.id}
                      onClick={p.oauthSupported ? () => handleOAuth(p.id) : onGoToDestinations}
                      disabled={connectingPlatform === p.id}
                      title={p.name}
                      className={`w-7 h-7 rounded-lg ${p.bg} flex items-center justify-center text-white text-xs font-bold hover:opacity-80 transition-opacity disabled:opacity-40`}>
                      {connectingPlatform === p.id ? "…" : p.icon}
                    </button>
                  ))}
                  <button onClick={onGoToDestinations}
                    className="px-3 py-1.5 rounded-lg bg-white/[0.07] hover:bg-white/[0.12] border border-white/10 text-xs font-semibold text-white/60 transition-colors">
                    All platforms →
                  </button>
                </div>
              }
            />
          </div>
        </div>

        {/* Right: Playlists & Schedules */}
        <div className="rounded-2xl border border-white/[0.08] bg-[#1e1e20] overflow-hidden flex flex-col">
          <div className="px-5 py-4 border-b border-white/[0.06] flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white/80">Playlists & Schedules</h2>
            <button onClick={onGoToPlaylists} className="text-xs text-orange-400 hover:text-orange-300 transition-colors">View all →</button>
          </div>
          <div className="flex-1">
            <PlaylistsPreview profileId={profile.id} token={token} />
          </div>
        </div>

      </div>
    </div>
  );
}

/* ── Stream option card ─────────────────────────────── */

function StreamOptionCard({ thumbnail, thumbnailBg, title, description, action }: {
  thumbnail: string; thumbnailBg: string; title: string; description: string; action: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-4 p-4 rounded-xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
      <div className={`w-16 h-16 rounded-xl ${thumbnailBg} flex items-center justify-center text-3xl flex-shrink-0`}>
        {thumbnail}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-white/90 mb-0.5">{title}</p>
        <p className="text-xs text-white/40 mb-2 leading-relaxed">{description}</p>
        {action}
      </div>
    </div>
  );
}

/* ── Playlists preview (home right panel) ───────────── */

function PlaylistsPreview({ profileId, token }: { profileId: string; token: string }) {
  const [playlists, setPlaylists] = useState<StreamPlaylist[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(() => {
    axios.create({ baseURL: API_URL, headers: { authorization: `Bearer ${token}` } })
      .get(`/stream-playlists?profileId=${profileId}`)
      .then((r) => setPlaylists(Array.isArray(r.data) ? r.data : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [profileId, token]);

  useEffect(() => { fetch(); window.addEventListener("playlists-updated", fetch); return () => window.removeEventListener("playlists-updated", fetch); }, [fetch]);

  if (loading) return <div className="flex items-center justify-center py-16 text-white/20 text-sm">Loading…</div>;

  if (playlists.length === 0) return (
    <div className="flex flex-col items-center justify-center py-16 text-center px-6">
      <div className="w-14 h-14 rounded-2xl bg-orange-500/10 flex items-center justify-center text-2xl mb-3">🎬</div>
      <p className="text-sm font-semibold text-white/50 mb-1">No playlists yet</p>
      <p className="text-xs text-white/25">Create a playlist, add videos, then start to go live</p>
    </div>
  );

  return (
    <div className="divide-y divide-white/[0.05]">
      {playlists.slice(0, 6).map((pl) => {
        const statusColor = pl.status === "live" ? "text-green-400" : pl.status === "paused" ? "text-yellow-400" : "text-white/25";
        const statusDot = pl.status === "live" ? "bg-green-400 animate-pulse" : pl.status === "paused" ? "bg-yellow-400" : "bg-white/20";
        return (
          <div key={pl.id} className="px-5 py-3.5 flex items-center gap-3 hover:bg-white/[0.02] transition-colors">
            <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${statusDot}`} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white/80 truncate">{pl.title}</p>
              <p className="text-xs text-white/30">{pl.items?.length ?? 0} video{pl.items?.length !== 1 ? "s" : ""}{pl.repeatCount ? ` · ×${pl.repeatCount}` : " · ∞ loop"}</p>
            </div>
            <span className={`text-xs font-medium flex-shrink-0 ${statusColor}`}>
              {pl.status === "live" ? "● Live" : pl.status === "paused" ? "⏸ Paused" : pl.status === "ended" ? "Ended" : "Idle"}
            </span>
          </div>
        );
      })}
    </div>
  );
}

/* ── Playlists full section ─────────────────────────── */

function PlaylistsSection({ profileId, token }: { profileId: string; token: string }) {
  const [playlists, setPlaylists] = useState<StreamPlaylist[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [createTitle, setCreateTitle] = useState("");
  const [createRepeat, setCreateRepeat] = useState("");
  const [createStart, setCreateStart] = useState("");
  const [createEnd, setCreateEnd] = useState("");
  const [creating, setCreating] = useState(false);

  const apiClient = useCallback(() => axios.create({ baseURL: API_URL, headers: { authorization: `Bearer ${token}` } }), [token]);

  const fetchPlaylists = useCallback(async () => {
    try { const { data } = await apiClient().get(`/stream-playlists?profileId=${profileId}`); setPlaylists(Array.isArray(data) ? data : []); }
    catch { /* ignore */ } finally { setLoading(false); }
  }, [profileId, token]);

  useEffect(() => { fetchPlaylists(); }, [fetchPlaylists]);
  useEffect(() => { const h = () => fetchPlaylists(); window.addEventListener("playlists-updated", h); return () => window.removeEventListener("playlists-updated", h); }, [fetchPlaylists]);

  const doAction = async (playlistId: string, action: string) => {
    setActionLoading(playlistId + action);
    try { await apiClient().post(`/stream-playlists/${playlistId}/${action}?profileId=${profileId}`); await fetchPlaylists(); }
    catch { /* ignore */ } finally { setActionLoading(null); }
  };

  const deletePlaylist = async (id: string) => {
    setActionLoading(id + "delete");
    try { await apiClient().delete(`/stream-playlists/${id}?profileId=${profileId}`); setPlaylists((p) => p.filter((x) => x.id !== id)); }
    catch { /* ignore */ } finally { setActionLoading(null); }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault(); setCreating(true);
    try {
      await apiClient().post("/stream-playlists", { profileId, title: createTitle, repeatCount: createRepeat ? parseInt(createRepeat) : null, scheduledStartAt: createStart || null, scheduledEndAt: createEnd || null });
      setCreateTitle(""); setCreateRepeat(""); setCreateStart(""); setCreateEnd(""); setCreateOpen(false);
      fetchPlaylists();
    } catch { /* ignore */ } finally { setCreating(false); }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg font-bold text-white">Playlists</h1>
          <p className="text-sm text-white/30 mt-0.5">Create multi-video 24/7 streams and schedule them</p>
        </div>
        <button onClick={() => setCreateOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-400 text-white text-sm font-semibold transition-colors">
          + New Playlist
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24 text-white/20 text-sm">Loading…</div>
      ) : playlists.length === 0 ? (
        <div className="rounded-2xl border border-white/[0.08] bg-[#1e1e20] flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-orange-500/10 flex items-center justify-center text-3xl mb-4">🎬</div>
          <p className="text-base font-semibold text-white/50 mb-1">No playlists yet</p>
          <p className="text-sm text-white/25 mb-5">Create a playlist, add videos, then hit Start</p>
          <button onClick={() => setCreateOpen(true)} className="px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-400 text-white text-sm font-semibold transition-colors">Create your first playlist</button>
        </div>
      ) : (
        <div className="space-y-3">
          {playlists.map((pl) => (
            <PlaylistCard key={pl.id} playlist={pl} profileId={profileId} token={token}
              expanded={expandedId === pl.id} onToggle={() => setExpandedId(expandedId === pl.id ? null : pl.id)}
              onAction={doAction} onDelete={() => deletePlaylist(pl.id)}
              actionLoading={actionLoading} onRefresh={fetchPlaylists} />
          ))}
        </div>
      )}

      {/* Create modal */}
      {createOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4" onClick={() => setCreateOpen(false)}>
          <div className="w-full max-w-md bg-[#1c1c1e] border border-white/10 rounded-2xl p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-semibold">Create playlist</h3>
              <button onClick={() => setCreateOpen(false)} className="text-white/30 hover:text-white text-xl">×</button>
            </div>
            <form onSubmit={handleCreate} className="flex flex-col gap-3.5">
              <FormField label="Playlist name">
                <input value={createTitle} onChange={(e) => setCreateTitle(e.target.value)} placeholder="e.g. Weekend Show" required className={inputClass} autoFocus />
              </FormField>
              <FormField label="Repeat count (blank = infinite loop)">
                <input type="number" min="1" value={createRepeat} onChange={(e) => setCreateRepeat(e.target.value)} placeholder="Leave blank to loop forever" className={inputClass} />
              </FormField>
              <div className="grid grid-cols-2 gap-3">
                <FormField label="Schedule start (optional)">
                  <input type="datetime-local" value={createStart} onChange={(e) => setCreateStart(e.target.value)} className={inputClass} />
                </FormField>
                <FormField label="Schedule end (optional)">
                  <input type="datetime-local" value={createEnd} onChange={(e) => setCreateEnd(e.target.value)} className={inputClass} />
                </FormField>
              </div>
              <div className="flex gap-3 mt-1">
                <button type="button" onClick={() => setCreateOpen(false)} className="flex-1 py-2.5 rounded-xl border border-white/10 text-white/50 text-sm hover:text-white transition-colors">Cancel</button>
                <button type="submit" disabled={creating || !createTitle} className="flex-1 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-400 disabled:opacity-50 text-white font-semibold text-sm transition-colors">
                  {creating ? "Creating…" : "Create Playlist"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Playlist card ──────────────────────────────────── */

function PlaylistCard({ playlist, profileId, token, expanded, onToggle, onAction, onDelete, actionLoading, onRefresh }: {
  playlist: StreamPlaylist; profileId: string; token: string;
  expanded: boolean; onToggle: () => void;
  onAction: (id: string, action: string) => void;
  onDelete: () => void;
  actionLoading: string | null;
  onRefresh: () => void;
}) {
  const [addVideoOpen, setAddVideoOpen] = useState(false);
  const [removingVideoId, setRemovingVideoId] = useState<string | null>(null);
  const apiClient = useCallback(() => axios.create({ baseURL: API_URL, headers: { authorization: `Bearer ${token}` } }), [token]);

  const removeVideo = async (videoId: string) => {
    setRemovingVideoId(videoId);
    try { await apiClient().delete(`/stream-playlists/${playlist.id}/videos/${videoId}?profileId=${profileId}`); onRefresh(); }
    catch { /* ignore */ } finally { setRemovingVideoId(null); }
  };

  const isLive = playlist.status === "live";
  const isPaused = playlist.status === "paused";
  const isIdle = playlist.status === "idle" || playlist.status === "ended";

  const statusStyles: Record<string, string> = {
    live: "text-green-400", paused: "text-yellow-400", idle: "text-white/25", ended: "text-white/25",
  };
  const statusLabel: Record<string, string> = {
    live: "● Live", paused: "⏸ Paused", idle: "Idle", ended: "Ended",
  };

  return (
    <div className="rounded-2xl border border-white/[0.08] bg-[#1e1e20] overflow-hidden">
      <div className="px-5 py-4 flex items-center gap-3">
        {/* Status dot */}
        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${isLive ? "bg-green-400 animate-pulse" : isPaused ? "bg-yellow-400" : "bg-white/15"}`} />

        {/* Title + meta */}
        <button onClick={onToggle} className="flex-1 flex items-center gap-3 text-left min-w-0">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white/90 truncate">{playlist.title}</p>
            <p className="text-xs text-white/30 mt-0.5">
              {playlist.items?.length ?? 0} video{playlist.items?.length !== 1 ? "s" : ""}
              {playlist.repeatCount !== null ? ` · ×${playlist.repeatCount}` : " · ∞ loop"}
              {playlist.scheduledStartAt && ` · Starts ${new Date(playlist.scheduledStartAt).toLocaleDateString()}`}
            </p>
          </div>
        </button>

        {/* Status label */}
        <span className={`text-xs font-semibold flex-shrink-0 ${statusStyles[playlist.status] ?? statusStyles.idle}`}>
          {statusLabel[playlist.status] ?? playlist.status}
        </span>

        {/* Controls */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {isIdle && (
            <button onClick={() => onAction(playlist.id, "start")} disabled={!!actionLoading}
              className="px-3 py-1.5 rounded-lg bg-green-500/15 text-green-400 hover:bg-green-500/25 text-xs font-semibold transition-colors disabled:opacity-40">
              ▶ Start
            </button>
          )}
          {isLive && (
            <>
              <button onClick={() => onAction(playlist.id, "pause")} disabled={!!actionLoading}
                className="px-3 py-1.5 rounded-lg bg-yellow-500/15 text-yellow-400 hover:bg-yellow-500/25 text-xs font-semibold transition-colors disabled:opacity-40">
                ⏸
              </button>
              <button onClick={() => onAction(playlist.id, "stop")} disabled={!!actionLoading}
                className="px-3 py-1.5 rounded-lg bg-red-500/15 text-red-400 hover:bg-red-500/25 text-xs font-semibold transition-colors disabled:opacity-40">
                ■ Stop
              </button>
            </>
          )}
          {isPaused && (
            <>
              <button onClick={() => onAction(playlist.id, "resume")} disabled={!!actionLoading}
                className="px-3 py-1.5 rounded-lg bg-green-500/15 text-green-400 hover:bg-green-500/25 text-xs font-semibold transition-colors disabled:opacity-40">
                ▶ Resume
              </button>
              <button onClick={() => onAction(playlist.id, "stop")} disabled={!!actionLoading}
                className="px-3 py-1.5 rounded-lg bg-red-500/15 text-red-400 hover:bg-red-500/25 text-xs font-semibold transition-colors disabled:opacity-40">
                ■ Stop
              </button>
            </>
          )}
          <button onClick={onDelete} disabled={!!actionLoading}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-white/20 hover:text-red-400 hover:bg-red-500/10 transition-colors text-sm disabled:opacity-40">
            ✕
          </button>
          <button onClick={onToggle} className="w-7 h-7 rounded-lg flex items-center justify-center text-white/30 hover:text-white hover:bg-white/5 transition-colors text-xs">
            {expanded ? "▲" : "▼"}
          </button>
        </div>
      </div>

      {/* Expanded content */}
      {expanded && (
        <div className="border-t border-white/[0.06]">
          {playlist.items?.length === 0 ? (
            <div className="py-8 text-center text-sm text-white/25">No videos yet — add one below</div>
          ) : (
            <div className="divide-y divide-white/[0.04]">
              {playlist.items?.map((video, idx) => (
                <div key={video.id} className={`px-5 py-3 flex items-center gap-3 ${isLive && idx === playlist.currentVideoIndex ? "bg-white/[0.03]" : ""}`}>
                  <span className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    isLive && idx === playlist.currentVideoIndex ? "bg-orange-500 text-white" : "bg-white/5 text-white/30"
                  }`}>
                    {isLive && idx === playlist.currentVideoIndex ? "▶" : idx + 1}
                  </span>
                  <span className="text-sm text-white/70 truncate flex-1">{video.title}</span>
                  {isLive && idx === playlist.currentVideoIndex && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/20 flex-shrink-0">Playing</span>
                  )}
                  <button onClick={() => removeVideo(video.id)} disabled={removingVideoId === video.id}
                    className="text-white/15 hover:text-red-400 transition-colors text-xs disabled:opacity-40 flex-shrink-0">
                    {removingVideoId === video.id ? "…" : "remove"}
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="px-5 py-3 border-t border-white/[0.06]">
            {addVideoOpen ? (
              <AddVideoForm playlistId={playlist.id} profileId={profileId} token={token}
                onDone={() => { setAddVideoOpen(false); onRefresh(); }} onCancel={() => setAddVideoOpen(false)} />
            ) : (
              <button onClick={() => setAddVideoOpen(true)} className="text-sm text-orange-400 hover:text-orange-300 transition-colors">+ Add video</button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Add video form ─────────────────────────────────── */

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
    const CHUNK_SIZE = 50 * 1024 * 1024; // 50 MB per part (well under Cloudflare's limit)
    let uploadId: string | null = null;
    let key: string | null = null;
    try {
      // Start multipart upload
      const { data: startData } = await apiClient.post("/stream-playlists/multipart/start", { profileId, filename: file.name });
      uploadId = startData.uploadId;
      key = startData.key;

      const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
      for (let i = 0; i < totalChunks; i++) {
        const chunk = file.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE);
        const { data: { presignedUrl } } = await apiClient.post("/stream-playlists/multipart/part-url", { profileId, key, uploadId, partNumber: i + 1 });
        await axios.put(presignedUrl, chunk, {
          headers: { "Content-Type": file.type || "video/mp4" },
          onUploadProgress: (evt) => {
            if (evt.total) {
              const chunkProgress = evt.loaded / evt.total;
              setProgress(Math.round(((i + chunkProgress) / totalChunks) * 100));
            }
          },
        });
      }

      // Complete multipart — backend fetches ETags via ListParts
      const { data: { remoteUrl } } = await apiClient.post("/stream-playlists/multipart/complete", { profileId, key, uploadId });
      await apiClient.post(`/stream-playlists/${playlistId}/videos?profileId=${profileId}`, { title, videoUrl: remoteUrl, videoFilename: file.name });
      onDone();
    } catch (err: any) {
      if (uploadId && key) {
        apiClient.post("/stream-playlists/multipart/abort", { profileId, key, uploadId }).catch(() => {});
      }
      setError(err?.response?.data?.message ?? "Upload failed.");
    } finally { setUploading(false); }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 pt-1">
      {error && <p className="text-red-400 text-xs">{error}</p>}
      <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Video title" required className={inputClass} />
      <div onClick={() => !uploading && fileRef.current?.click()}
        className="flex items-center justify-center gap-2 py-5 rounded-xl border border-dashed border-white/10 hover:border-orange-500/40 cursor-pointer transition-colors text-center">
        {uploading ? (
          <div className="flex flex-col items-center gap-1.5 w-full px-6">
            <div className="w-full bg-white/10 rounded-full h-1.5"><div className="h-full bg-orange-500 rounded-full transition-all" style={{ width: `${progress}%` }} /></div>
            <span className="text-xs text-white/40">{progress}%</span>
          </div>
        ) : file ? (
          <span className="text-xs text-white/50">{file.name} ({(file.size / 1024 / 1024).toFixed(1)} MB)</span>
        ) : (
          <div className="text-center">
            <p className="text-sm text-white/30">Click to select video</p>
            <p className="text-xs text-white/15 mt-0.5">Up to 2 GB</p>
          </div>
        )}
      </div>
      <input ref={fileRef} type="file" accept="video/*" onChange={(e) => setFile(e.target.files?.[0] ?? null)} className="hidden" />
      <div className="flex gap-2">
        <button type="button" onClick={onCancel} className="flex-1 py-2 rounded-xl border border-white/10 text-white/40 text-sm hover:text-white transition-colors">Cancel</button>
        <button type="submit" disabled={uploading || !file || !title}
          className="flex-1 py-2 rounded-xl bg-orange-500 hover:bg-orange-400 disabled:opacity-50 text-white text-sm font-semibold transition-colors">
          {uploading ? "Uploading…" : "Add Video"}
        </button>
      </div>
    </form>
  );
}

/* ── Destinations section ───────────────────────────── */

function DestinationsSection({ profileId, token, slug, rootDomain }: {
  profileId: string; token: string; slug: string; rootDomain: string;
}) {
  const [channels, setChannels] = useState<StreamChannel[]>([]);
  const [loading, setLoading] = useState(true);
  const [connectingPlatform, setConnectingPlatform] = useState<string | null>(null);
  const [rtmpForm, setRtmpForm] = useState<{ platformId: string; title: string; ingestUrl: string; streamKey: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const livePageUrl = `https://${slug}.${rootDomain}/live`;

  const apiClient = useCallback(() => axios.create({ baseURL: API_URL, headers: { authorization: `Bearer ${token}` } }), [token]);
  const fetchChannels = useCallback(() => {
    apiClient().get(`/streams/channels?profileId=${profileId}`)
      .then((r) => setChannels(Array.isArray(r.data) ? r.data : (r.data?.data ?? [])))
      .catch(() => {}).finally(() => setLoading(false));
  }, [profileId, token]);

  useEffect(() => { fetchChannels(); }, [fetchChannels]);

  const handleOAuth = async (platformId: string) => {
    setConnectingPlatform(platformId);
    try {
      const endpoint = platformId === "youtube" ? `/streams/oauth/youtube/url?profileId=${profileId}` : `/streams/oauth/twitch/url?profileId=${profileId}`;
      const { data } = await apiClient().get(endpoint);
      window.location.href = data.url || data;
    } catch { setConnectingPlatform(null); }
  };

  const handleRtmpConnect = async (e: React.FormEvent) => {
    e.preventDefault(); if (!rtmpForm) return;
    setSaving(true); setError("");
    try {
      const ingestUrl = rtmpForm.streamKey ? `${rtmpForm.ingestUrl.replace(/\/$/, "")}/${rtmpForm.streamKey}` : rtmpForm.ingestUrl;
      await apiClient().post("/streams/channels/custom-rtmp", { profileId, title: rtmpForm.title, ingestUrl });
      setRtmpForm(null); fetchChannels();
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Failed to connect.");
    } finally { setSaving(false); }
  };

  const isConnected = (platformId: string) => channels.some((c) =>
    c.channelProvider === platformId ||
    (platformId === "facebook" && c.channelProvider === "custom_rtmp" && c.currentEndpoint?.includes("facebook")) ||
    (platformId === "tiktok" && c.channelProvider === "custom_rtmp" && c.currentEndpoint?.includes("tiktok")) ||
    (platformId === "instagram" && c.channelProvider === "custom_rtmp" && c.currentEndpoint?.includes("instagram")) ||
    (platformId === "custom" && c.channelProvider === "custom_rtmp"),
  );

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-lg font-bold text-white">Social Platforms</h1>
        <p className="text-sm text-white/30 mt-0.5">Connect destinations to simulcast your streams everywhere</p>
      </div>

      {/* Always-on built-in */}
      <div className="rounded-2xl border border-green-500/20 bg-green-500/[0.05] px-5 py-4 flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-green-500/15 flex items-center justify-center text-xl">🌐</div>
          <div>
            <p className="text-sm font-semibold text-white/90">Your Channel Live Page
              <span className="ml-2 px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 text-xs font-medium">Always on</span>
            </p>
            <a href={livePageUrl} target="_blank" rel="noreferrer" className="text-xs text-green-400 hover:text-green-300 transition-colors">{livePageUrl}</a>
          </div>
        </div>
        <a href={livePageUrl} target="_blank" rel="noreferrer"
          className="text-xs px-3 py-1.5 rounded-lg border border-green-500/20 text-green-400 hover:bg-green-500/10 transition-colors flex-shrink-0">
          Preview ↗
        </a>
      </div>

      {/* Platform grid */}
      <p className="text-xs text-white/25 uppercase tracking-widest font-semibold mb-3">Connect platforms</p>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
        {PLATFORMS.map((platform) => {
          const connected = isConnected(platform.id);
          const isConnecting = connectingPlatform === platform.id;
          const connectedChannels = channels.filter((c) =>
            c.channelProvider === platform.id ||
            (platform.id !== "youtube" && platform.id !== "twitch" && c.channelProvider === "custom_rtmp"),
          );
          return (
            <div key={platform.id} className={`rounded-2xl border p-4 transition-all ${connected ? "border-green-500/25 bg-green-500/[0.04]" : "border-white/[0.07] bg-[#1e1e20] hover:border-white/[0.12]"}`}>
              <div className="flex items-start justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl ${platform.bg} flex items-center justify-center text-white font-bold text-lg`}>{platform.icon}</div>
                {connected && <span className="px-1.5 py-0.5 rounded-full bg-green-500/20 text-green-400 text-[10px] font-semibold">✓ Connected</span>}
              </div>
              <p className="text-sm font-semibold text-white/80 mb-0.5">{platform.name}</p>
              {connected ? (
                <div className="mt-2 space-y-0.5">
                  {connectedChannels.map((c) => <p key={c.id} className="text-xs text-white/40 truncate">{c.title || "Connected"}</p>)}
                </div>
              ) : (
                <div className="mt-3">
                  {platform.oauthSupported ? (
                    <button onClick={() => handleOAuth(platform.id)} disabled={isConnecting}
                      className="w-full py-2 rounded-xl text-xs font-semibold text-white transition-all disabled:opacity-40 hover:opacity-90"
                      style={{ backgroundColor: platform.color }}>
                      {isConnecting ? "Connecting…" : `Connect ${platform.name}`}
                    </button>
                  ) : (
                    <button onClick={() => setRtmpForm({ platformId: platform.id, title: platform.name, ingestUrl: platform.rtmpUrl, streamKey: "" })}
                      className="w-full py-2 rounded-xl border border-white/10 hover:border-white/20 text-xs font-semibold text-white/50 hover:text-white transition-colors">
                      Add stream key
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Connected list */}
      {channels.length > 0 && (
        <div className="rounded-2xl border border-white/[0.07] bg-[#1e1e20] overflow-hidden">
          <div className="px-5 py-3 border-b border-white/[0.06]">
            <p className="text-xs text-white/25 uppercase tracking-widest font-semibold">Active connections</p>
          </div>
          {channels.map((ch) => (
            <div key={ch.id} className="px-5 py-3.5 border-b border-white/[0.04] last:border-0 flex items-center gap-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold flex-shrink-0 ${
                ch.channelProvider === "youtube" ? "bg-red-600" : ch.channelProvider === "twitch" ? "bg-purple-600" : "bg-orange-500"
              }`}>{ch.channelProvider === "youtube" ? "▶" : ch.channelProvider === "twitch" ? "♟" : "⚡"}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white/80 truncate">{ch.title}</p>
                <p className="text-xs text-white/30 capitalize">{ch.channelProvider.replace("_", " ")}</p>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-xs flex-shrink-0">Active</span>
            </div>
          ))}
        </div>
      )}

      {loading && <div className="py-8 flex items-center justify-center text-white/20 text-sm">Loading…</div>}

      {/* RTMP modal */}
      {rtmpForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4" onClick={() => { setRtmpForm(null); setError(""); }}>
          <div className="w-full max-w-sm bg-[#1c1c1e] border border-white/10 rounded-2xl p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-semibold">Connect {rtmpForm.title}</h3>
              <button onClick={() => { setRtmpForm(null); setError(""); }} className="text-white/30 hover:text-white text-xl">×</button>
            </div>
            <form onSubmit={handleRtmpConnect} className="flex flex-col gap-3.5">
              {error && <p className="text-red-400 text-xs px-3 py-2 bg-red-500/10 rounded-xl">{error}</p>}
              <FormField label="Channel name"><input value={rtmpForm.title} onChange={(e) => setRtmpForm({ ...rtmpForm, title: e.target.value })} className={inputClass} required /></FormField>
              <FormField label="RTMP URL"><input value={rtmpForm.ingestUrl} onChange={(e) => setRtmpForm({ ...rtmpForm, ingestUrl: e.target.value })} placeholder={PLATFORMS.find((p) => p.id === rtmpForm.platformId)?.rtmpPlaceholder} className={inputClass} required /></FormField>
              <FormField label="Stream key">
                <input type="password" value={rtmpForm.streamKey} onChange={(e) => setRtmpForm({ ...rtmpForm, streamKey: e.target.value })} placeholder="Your stream key" className={inputClass} />
                <p className="text-xs text-white/20 mt-1">Appended to the RTMP URL</p>
              </FormField>
              <div className="flex gap-3 mt-1">
                <button type="button" onClick={() => { setRtmpForm(null); setError(""); }} className="flex-1 py-2.5 rounded-xl border border-white/10 text-white/50 text-sm hover:text-white transition-colors">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-400 disabled:opacity-50 text-white text-sm font-semibold transition-colors">
                  {saving ? "Connecting…" : "Connect"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Shared helpers ─────────────────────────────────── */

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs text-white/40">{label}</label>
      {children}
    </div>
  );
}

const inputClass = "w-full px-3.5 py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.08] text-white placeholder-white/20 focus:outline-none focus:border-orange-500/50 transition-colors text-sm";

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-[#141416] flex items-center justify-center">
      <div className="w-6 h-6 rounded-full border-2 border-orange-500 border-t-transparent animate-spin" />
    </div>
  );
}
