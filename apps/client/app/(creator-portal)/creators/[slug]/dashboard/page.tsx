"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useCallback } from "react";
import axios from "axios";
import { useCreatorAuth } from "../../../../_contexts/creator-auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

type PlaylistVideo = { id: string; playlistId: string; title: string; videoUrl: string; videoFilename: string; position: number };
type StreamPlaylist = { id: string; title: string; status: "idle" | "live" | "paused" | "ended"; repeatCount: number | null; currentRepeat: number; currentVideoIndex: number; scheduledStartAt: string | null; scheduledEndAt: string | null; items: PlaylistVideo[] };
type StreamChannel = { id: string; title: string; channelProvider: "youtube" | "twitch" | "custom_rtmp"; currentEndpoint: string | null; externalId: string | null };

const PLATFORMS = [
  { id: "youtube",   name: "YouTube",     icon: "▶", color: "#FF0000", bg: "bg-red-600",    oauthSupported: true,  rtmpUrl: "rtmp://a.rtmp.youtube.com/live2",          rtmpPlaceholder: "rtmp://a.rtmp.youtube.com/live2" },
  { id: "twitch",    name: "Twitch",      icon: "♟", color: "#9146FF", bg: "bg-purple-600", oauthSupported: true,  rtmpUrl: "rtmp://live.twitch.tv/app",                rtmpPlaceholder: "rtmp://live.twitch.tv/app" },
  { id: "facebook",  name: "Facebook",    icon: "f", color: "#1877F2", bg: "bg-blue-600",   oauthSupported: false, rtmpUrl: "rtmps://live-api-s.facebook.com:443/rtmp", rtmpPlaceholder: "rtmps://live-api-s.facebook.com:443/rtmp" },
  { id: "tiktok",    name: "TikTok",      icon: "♪", color: "#010101", bg: "bg-zinc-900",   oauthSupported: false, rtmpUrl: "rtmp://push.tiktok.com/live",              rtmpPlaceholder: "rtmp://push.tiktok.com/live" },
  { id: "instagram", name: "Instagram",   icon: "◎", color: "#E1306C", bg: "bg-pink-600",   oauthSupported: false, rtmpUrl: "rtmps://live-upload.instagram.com:443/rtmp",rtmpPlaceholder: "rtmps://live-upload.instagram.com:443/rtmp" },
  { id: "custom",    name: "Custom RTMP", icon: "⚡", color: "#F97316", bg: "bg-orange-500", oauthSupported: false, rtmpUrl: "",                                         rtmpPlaceholder: "rtmp://your-server/live" },
] as const;

/* ── Helpers ────────────────────────────────────────── */
const inputClass = "w-full px-3.5 py-2.5 rounded-lg bg-[#121212] border border-[#303030] text-white placeholder-[#717171] focus:outline-none focus:border-[#888] transition-colors text-sm";
function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="flex flex-col gap-1.5"><label className="text-xs text-[#aaa]">{label}</label>{children}</div>;
}
function LoadingScreen() {
  return <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center"><div className="w-6 h-6 rounded-full border-2 border-white border-t-transparent animate-spin" /></div>;
}
function fmt(s: number) {
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
  return h > 0 ? `${h}:${String(m).padStart(2,"0")}:${String(sec).padStart(2,"0")}` : `${m}:${String(sec).padStart(2,"0")}`;
}

/* ── Main ───────────────────────────────────────────── */
export default function CreatorDashboard({ params }: { params: Promise<{ slug: string }> }) {
  const { isAuthenticated, isLoading, account, authorizations, token, logout } = useCreatorAuth();
  const router = useRouter();
  const [slug, setSlug] = useState("");
  const [activeSection, setActiveSection] = useState<"studio" | "playlists" | "destinations">("studio");

  useEffect(() => { params.then((p) => setSlug(p.slug)); }, [params]);
  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) { router.replace("/login"); return; }
    if (slug && !authorizations.some((a) => a.profile.subdomain === slug)) router.replace("/login");
  }, [isAuthenticated, isLoading, authorizations, slug]);

  if (isLoading || !slug) return <LoadingScreen />;
  if (!isAuthenticated) return null;

  const profile = authorizations.find((a) => a.profile.subdomain === slug)?.profile;
  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "varalabs.systems";
  const livePageUrl = `https://${slug}.${rootDomain}/live`;

  return (
    <div className="flex h-screen bg-[#0f0f0f] text-white overflow-hidden">
      {/* Narrow icon sidebar */}
      <aside className="w-[72px] flex-shrink-0 flex flex-col bg-[#0f0f0f] border-r border-[#272727]">
        <div className="flex items-center justify-center py-4 border-b border-[#272727]">
          <div className="w-9 h-9 rounded-xl bg-orange-500 flex items-center justify-center text-white font-black text-sm select-none">TN</div>
        </div>
        <nav className="flex-1 flex flex-col items-center py-3 gap-1">
          <NavIcon icon="📡" label="Studio"       active={activeSection === "studio"}       onClick={() => setActiveSection("studio")} />
          <NavIcon icon="📋" label="Playlists"    active={activeSection === "playlists"}    onClick={() => setActiveSection("playlists")} />
          <NavIcon icon="🔗" label="Destinations" active={activeSection === "destinations"} onClick={() => setActiveSection("destinations")} />
          <div className="mt-auto flex flex-col items-center gap-1 w-full px-1">
            <NavIcon icon="🌐" label="Live page" onClick={() => window.open(livePageUrl, "_blank")} />
            <NavIcon icon="⚙"  label="Admin"     onClick={() => window.open(`https://admin.${rootDomain}`, "_blank")} />
          </div>
        </nav>
        <div className="flex items-center justify-center py-4 border-t border-[#272727]">
          <button onClick={() => { logout(); router.push("/"); }} title={`${account?.firstName} — Sign out`}
            className="w-9 h-9 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold text-sm hover:ring-2 hover:ring-orange-400 transition-all">
            {account?.firstName?.[0]?.toUpperCase() ?? "?"}
          </button>
        </div>
      </aside>

      {/* Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {activeSection === "studio"       && profile && token && <StudioSection profile={profile} token={token} slug={slug} rootDomain={rootDomain} onGoToPlaylists={() => setActiveSection("playlists")} onGoToDestinations={() => setActiveSection("destinations")} />}
        {activeSection === "playlists"    && profile && token && <div className="flex-1 overflow-auto p-6"><PlaylistsSection profileId={profile.id} token={token} /></div>}
        {activeSection === "destinations" && profile && token && <div className="flex-1 overflow-auto p-6"><DestinationsSection profileId={profile.id} token={token} slug={slug} rootDomain={rootDomain} /></div>}
      </div>
    </div>
  );
}

/* ── Sidebar icon ───────────────────────────────────── */
function NavIcon({ icon, label, active, onClick }: { icon: string; label: string; active?: boolean; onClick?: () => void }) {
  return (
    <button onClick={onClick} title={label}
      className={`flex flex-col items-center gap-0.5 px-1 py-2 rounded-xl w-14 transition-all text-center ${active ? "bg-white/10 text-white" : "text-[#aaa] hover:bg-white/5 hover:text-white"}`}>
      <span className="text-xl leading-none">{icon}</span>
      <span className="text-[9px] leading-tight mt-0.5">{label}</span>
    </button>
  );
}

/* ── Studio section ─────────────────────────────────── */
function StudioSection({ profile, token, slug, rootDomain, onGoToPlaylists, onGoToDestinations }: {
  profile: any; token: string; slug: string; rootDomain: string; onGoToPlaylists: () => void; onGoToDestinations: () => void;
}) {
  const [livePlaylist, setLivePlaylist] = useState<StreamPlaylist | null>(null);
  const [allPlaylists, setAllPlaylists] = useState<StreamPlaylist[]>([]);
  const [channels, setChannels] = useState<StreamChannel[]>([]);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const api = useCallback(() => axios.create({ baseURL: API_URL, headers: { authorization: `Bearer ${token}` } }), [token]);

  const refresh = useCallback(async () => {
    try {
      const { data } = await api().get(`/stream-playlists?profileId=${profile.id}`);
      const list: StreamPlaylist[] = Array.isArray(data) ? data : [];
      setAllPlaylists(list);
      setLivePlaylist(list.find((p) => p.status === "live" || p.status === "paused") ?? null);
    } catch { /* ignore */ }
  }, [profile.id, token]);

  const refreshChannels = useCallback(async () => {
    try {
      const { data } = await api().get(`/streams/channels?profileId=${profile.id}`);
      setChannels(Array.isArray(data) ? data : (data?.data ?? []));
    } catch { /* ignore */ }
  }, [profile.id, token]);

  useEffect(() => {
    refresh(); refreshChannels();
    const t = setInterval(refresh, 3000);
    return () => clearInterval(t);
  }, [refresh, refreshChannels]);

  const doAction = async (playlistId: string, action: string) => {
    setActionLoading(action);
    try { await api().post(`/stream-playlists/${playlistId}/${action}?profileId=${profile.id}`); await refresh(); }
    catch { /* ignore */ } finally { setActionLoading(null); }
  };

  if (!livePlaylist) {
    return (
      <GoLiveSetup
        playlists={allPlaylists} channels={channels} profile={profile} token={token}
        slug={slug} rootDomain={rootDomain} actionLoading={actionLoading}
        onStart={(id) => doAction(id, "start")}
        onGoToDestinations={onGoToDestinations}
        onCreated={refresh}
      />
    );
  }

  return (
    <StudioLiveView
      livePlaylist={livePlaylist} channels={channels} profile={profile} token={token}
      actionLoading={actionLoading}
      onPause={()  => doAction(livePlaylist.id, "pause")}
      onResume={() => doAction(livePlaylist.id, "resume")}
      onEnd={()   => doAction(livePlaylist.id, "stop")}
      onRefresh={refresh}
    />
  );
}

/* ── Go Live setup ──────────────────────────────────── */
function GoLiveSetup({ playlists, channels, profile, token, slug, rootDomain, actionLoading, onStart, onGoToDestinations, onCreated }: {
  playlists: StreamPlaylist[]; channels: StreamChannel[]; profile: any; token: string;
  slug: string; rootDomain: string; actionLoading: string | null;
  onStart: (id: string) => void; onGoToDestinations: () => void; onCreated: () => void;
}) {
  const [createOpen, setCreateOpen] = useState(false);
  const livePageUrl = `https://${slug}.${rootDomain}/live`;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Top bar */}
      <div className="flex-shrink-0 border-b border-[#272727] px-6 h-[52px] flex items-center gap-4">
        <div className="flex items-center gap-2 text-sm text-[#717171]">
          <span className="w-2 h-2 rounded-full bg-[#444]" /> Not streaming
        </div>
        <div className="flex-1" />
        <a href={livePageUrl} target="_blank" rel="noreferrer"
          className="text-xs text-[#aaa] hover:text-white border border-[#303030] rounded px-3 py-1.5 transition-colors">
          🌐 Live page ↗
        </a>
        <button onClick={onGoToDestinations}
          className="text-xs text-[#aaa] hover:text-white border border-[#303030] rounded px-3 py-1.5 transition-colors">
          + Add destination
        </button>
      </div>

      <div className="flex-1 overflow-auto px-8 py-6">
        <div className="max-w-3xl mx-auto space-y-6">

          {/* Connected platforms */}
          {channels.length > 0 && (
            <div className="flex items-center gap-3 px-4 py-3 bg-[#212121] rounded-xl border border-[#303030]">
              <span className="text-xs text-[#aaa]">Streaming to:</span>
              {channels.map((ch) => (
                <span key={ch.id} className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-medium text-white ${ch.channelProvider === "youtube" ? "bg-red-700" : ch.channelProvider === "twitch" ? "bg-purple-700" : "bg-orange-600"}`}>
                  {ch.channelProvider === "youtube" ? "▶" : ch.channelProvider === "twitch" ? "♟" : "⚡"} {ch.title}
                </span>
              ))}
            </div>
          )}

          {/* Heading */}
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Select a playlist to go live</h2>
            <button onClick={() => setCreateOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#272727] hover:bg-[#333] text-white text-sm font-medium transition-colors">
              + New Playlist
            </button>
          </div>

          {/* Playlist list */}
          {playlists.length === 0 ? (
            <div className="bg-[#212121] rounded-xl border border-[#303030] flex flex-col items-center justify-center py-20 text-center">
              <div className="text-5xl mb-4">🎬</div>
              <p className="text-base font-semibold mb-1">No playlists yet</p>
              <p className="text-sm text-[#aaa] mb-6">Create a playlist, add your videos, then go live</p>
              <button onClick={() => setCreateOpen(true)}
                className="px-6 py-2.5 rounded-lg bg-white text-black text-sm font-semibold hover:bg-[#e5e5e5] transition-colors">
                Create playlist
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {playlists.map((pl) => (
                <div key={pl.id} className="bg-[#212121] border border-[#303030] hover:border-[#444] rounded-xl p-4 flex items-center gap-4 transition-colors">
                  <div className="w-12 h-12 rounded-lg bg-[#2a2a2a] border border-[#333] flex items-center justify-center text-2xl flex-shrink-0">🎬</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{pl.title}</p>
                    <p className="text-xs text-[#717171] mt-0.5">
                      {pl.items?.length ?? 0} video{pl.items?.length !== 1 ? "s" : ""}
                      {pl.repeatCount !== null ? ` · ×${pl.repeatCount} repeats` : " · Infinite loop"}
                      {pl.scheduledStartAt && ` · Starts ${new Date(pl.scheduledStartAt).toLocaleDateString()}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    {pl.status === "ended" && <span className="text-xs text-[#717171]">Ended</span>}
                    <button onClick={() => onStart(pl.id)} disabled={!!actionLoading}
                      className="flex items-center gap-2 px-5 py-2 rounded-lg bg-white text-black text-sm font-semibold hover:bg-[#e5e5e5] disabled:opacity-50 transition-colors">
                      {actionLoading === "start" ? "Starting…" : "▶  Go Live"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* No destinations nudge */}
          {channels.length === 0 && (
            <div className="flex items-center gap-4 px-4 py-3.5 bg-[#1a1a1a] rounded-xl border border-[#303030]">
              <span className="text-2xl">📡</span>
              <div className="flex-1">
                <p className="text-sm font-medium">No streaming destinations connected</p>
                <p className="text-xs text-[#717171] mt-0.5">Your stream will play on your live page. Connect YouTube, Twitch & more to simulcast everywhere.</p>
              </div>
              <button onClick={onGoToDestinations}
                className="px-4 py-2 rounded-lg border border-[#303030] text-sm hover:bg-white/5 flex-shrink-0 transition-colors">
                Add destinations
              </button>
            </div>
          )}
        </div>
      </div>

      {createOpen && (
        <CreatePlaylistModal profileId={profile.id} token={token} onDone={() => { setCreateOpen(false); onCreated(); }} onClose={() => setCreateOpen(false)} />
      )}
    </div>
  );
}

/* ── Studio live view ───────────────────────────────── */
function StudioLiveView({ livePlaylist, channels, profile, token, actionLoading, onPause, onResume, onEnd, onRefresh }: {
  livePlaylist: StreamPlaylist; channels: StreamChannel[]; profile: any; token: string;
  actionLoading: string | null; onPause: () => void; onResume: () => void; onEnd: () => void; onRefresh: () => void;
}) {
  const [activeTab, setActiveTab] = useState<"playlist" | "settings" | "platforms">("playlist");
  const [elapsed, setElapsed] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const isLive   = livePlaylist.status === "live";
  const isPaused = livePlaylist.status === "paused";
  const currentItem = livePlaylist.items?.[livePlaylist.currentVideoIndex] ?? null;

  useEffect(() => { const t = setInterval(() => setElapsed((e) => e + 1), 1000); return () => clearInterval(t); }, []);

  useEffect(() => {
    if (!videoRef.current || !currentItem?.videoUrl) return;
    if (videoRef.current.src !== currentItem.videoUrl) {
      videoRef.current.src = currentItem.videoUrl;
      videoRef.current.load();
      videoRef.current.play().catch(() => {});
    }
  }, [currentItem?.videoUrl]);

  return (
    <div className="flex flex-col h-full overflow-hidden">

      {/* ── Top stats bar ── */}
      <div className="flex-shrink-0 h-[52px] border-b border-[#272727] px-4 flex items-center gap-3 bg-[#0f0f0f]">
        {/* Live / Paused badge + timer */}
        {isLive ? (
          <>
            <span className="px-2 py-0.5 rounded bg-[#cc0000] text-white text-xs font-bold tracking-wider">LIVE</span>
            <span className="text-sm text-white font-mono tabular-nums">{fmt(elapsed)}</span>
          </>
        ) : (
          <span className="px-2 py-0.5 rounded bg-yellow-600 text-white text-xs font-bold">PAUSED</span>
        )}

        <div className="w-px h-4 bg-[#303030] mx-1" />

        {/* Stream title */}
        <span className="text-sm text-[#aaa] truncate max-w-[180px]">{livePlaylist.title}</span>

        <div className="w-px h-4 bg-[#303030] mx-1" />

        {/* Platform chips */}
        <div className="flex items-center gap-1.5 flex-1 min-w-0 overflow-hidden">
          {channels.length === 0
            ? <span className="text-xs text-[#555]">No platforms connected</span>
            : channels.map((ch) => (
                <span key={ch.id} className={`flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium text-white flex-shrink-0 ${ch.channelProvider === "youtube" ? "bg-red-700" : ch.channelProvider === "twitch" ? "bg-purple-700" : "bg-orange-600"}`}>
                  {ch.channelProvider === "youtube" ? "▶" : ch.channelProvider === "twitch" ? "♟" : "⚡"}
                  <span className="hidden sm:inline">{ch.title}</span>
                </span>
              ))
          }
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {isLive && (
            <button onClick={onPause} disabled={!!actionLoading}
              className="px-3 py-1.5 rounded border border-[#444] text-sm text-white hover:bg-white/5 disabled:opacity-40 transition-colors">
              ⏸ Pause
            </button>
          )}
          {isPaused && (
            <button onClick={onResume} disabled={!!actionLoading}
              className="px-3 py-1.5 rounded border border-[#444] text-sm text-white hover:bg-white/5 disabled:opacity-40 transition-colors">
              ▶ Resume
            </button>
          )}
          <button onClick={onEnd} disabled={!!actionLoading}
            className="px-4 py-1.5 rounded bg-white text-black text-sm font-semibold hover:bg-[#e5e5e5] disabled:opacity-40 transition-colors">
            {actionLoading === "stop" ? "Ending…" : "End Stream"}
          </button>
        </div>
      </div>

      {/* ── Two-column main ── */}
      <div className="flex-1 flex overflow-hidden">

        {/* Left: video + tabs */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden border-r border-[#272727]">

          {/* Video preview */}
          <div className="flex-shrink-0 relative bg-black" style={{ height: "320px" }}>
            {currentItem ? (
              <video ref={videoRef} muted autoPlay playsInline className="w-full h-full object-contain" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[#555] text-sm">No video loaded</div>
            )}

            {/* Status badge (top-left) */}
            <div className="absolute top-3 left-3">
              {isLive ? (
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-black/70 text-xs font-semibold text-white border border-white/10 backdrop-blur-sm">
                  <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" /> Streaming
                </span>
              ) : (
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-black/70 text-xs font-semibold text-yellow-400 border border-yellow-500/30 backdrop-blur-sm">
                  ⏸ Paused
                </span>
              )}
            </div>

            {/* Playlist selector (top-right) */}
            <div className="absolute top-3 right-3 flex items-center gap-2 px-3 py-1.5 rounded bg-black/70 border border-white/10 backdrop-blur-sm">
              <span className="text-xs text-white max-w-[160px] truncate">{livePlaylist.title}</span>
              <button onClick={onRefresh} className="text-[#aaa] hover:text-white text-sm transition-colors" title="Refresh">⟳</button>
            </div>
          </div>

          {/* Paused alert bar */}
          {isPaused && (
            <div className="flex-shrink-0 px-4 py-2.5 bg-[#332900] border-b border-yellow-700/40 flex items-center gap-3">
              <span className="text-yellow-400 text-lg flex-shrink-0">⚠</span>
              <p className="text-sm text-yellow-200 flex-1">Stream is paused — all platforms are offline. Resume to continue streaming.</p>
              <button onClick={onResume} disabled={!!actionLoading}
                className="flex-shrink-0 px-3 py-1.5 rounded bg-yellow-500 text-black text-xs font-semibold hover:bg-yellow-400 disabled:opacity-40 transition-colors">
                ▶ Resume
              </button>
            </div>
          )}

          {/* Tabs */}
          <div className="flex-shrink-0 flex border-b border-[#272727] bg-[#0f0f0f]">
            {(["playlist", "settings", "platforms"] as const).map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`px-5 py-3 text-sm font-medium transition-colors border-b-2 -mb-px ${activeTab === tab ? "border-white text-white" : "border-transparent text-[#aaa] hover:text-white"}`}>
                {tab === "playlist" ? "Playlist" : tab === "settings" ? "Stream settings" : "Platforms"}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="flex-1 overflow-auto bg-[#0f0f0f]">
            {activeTab === "playlist"  && <PlaylistTab  livePlaylist={livePlaylist} profileId={profile.id} token={token} onRefresh={onRefresh} />}
            {activeTab === "settings"  && <SettingsTab  livePlaylist={livePlaylist} />}
            {activeTab === "platforms" && <PlatformsTab channels={channels} />}
          </div>
        </div>

        {/* Right: playlist queue (like YouTube's chat panel) */}
        <div className="w-[340px] flex-shrink-0 flex flex-col overflow-hidden bg-[#0f0f0f]">
          {/* Header */}
          <div className="flex-shrink-0 flex items-center justify-between px-4 py-3 border-b border-[#272727]">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold">Playlist Queue</span>
              <span className="text-xs text-[#717171]">{livePlaylist.repeatCount !== null ? `×${livePlaylist.repeatCount}` : "∞ loop"}</span>
            </div>
            {livePlaylist.repeatCount !== null && (
              <span className="text-xs text-[#aaa]">Loop {livePlaylist.currentRepeat + 1}/{livePlaylist.repeatCount}</span>
            )}
          </div>

          {/* Video queue */}
          <div className="flex-1 overflow-auto">
            {(livePlaylist.items ?? []).length === 0 ? (
              <div className="flex items-center justify-center h-full text-sm text-[#555]">No videos in queue</div>
            ) : (
              (livePlaylist.items ?? []).map((video, idx) => {
                const isCurrent = idx === livePlaylist.currentVideoIndex;
                return (
                  <div key={video.id} className={`flex items-center gap-3 px-4 py-3 border-b border-[#1a1a1a] transition-colors ${isCurrent ? "bg-[#1a1a1a]" : "hover:bg-[#111]"}`}>
                    <div className={`w-8 h-8 rounded flex items-center justify-center text-xs font-bold flex-shrink-0 ${isCurrent ? "bg-[#cc0000] text-white" : "bg-[#272727] text-[#aaa]"}`}>
                      {isCurrent && isLive ? "▶" : idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm truncate ${isCurrent ? "text-white font-medium" : "text-[#aaa]"}`}>{video.title}</p>
                      {isCurrent && <p className="text-xs text-[#cc0000] mt-0.5">{isLive ? "Now streaming" : "Paused"}</p>}
                    </div>
                    {isCurrent && isLive && (
                      <span className="flex-shrink-0 px-1.5 py-0.5 rounded bg-[#cc0000]/20 text-[#ff4444] text-[10px] font-semibold border border-[#cc0000]/20">LIVE</span>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Queue footer */}
          <div className="flex-shrink-0 border-t border-[#272727] px-4 py-2.5 flex items-center justify-between">
            <span className="text-xs text-[#555]">{livePlaylist.items?.length ?? 0} video{livePlaylist.items?.length !== 1 ? "s" : ""}</span>
            <span className="text-xs flex items-center gap-1.5">{isLive ? <><span className="w-1.5 h-1.5 rounded-full bg-[#cc0000] animate-pulse" /> Streaming</> : <><span className="w-1.5 h-1.5 rounded-full bg-yellow-500" /> Paused</>}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Playlist tab ───────────────────────────────────── */
function PlaylistTab({ livePlaylist, profileId, token, onRefresh }: { livePlaylist: StreamPlaylist; profileId: string; token: string; onRefresh: () => void }) {
  const [addOpen, setAddOpen] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const api = axios.create({ baseURL: API_URL, headers: { authorization: `Bearer ${token}` } });
  const isLive = livePlaylist.status === "live";

  const removeVideo = async (videoId: string) => {
    setRemovingId(videoId);
    try { await api.delete(`/stream-playlists/${livePlaylist.id}/videos/${videoId}?profileId=${profileId}`); onRefresh(); }
    catch { /* ignore */ } finally { setRemovingId(null); }
  };

  return (
    <div className="p-4 space-y-1">
      {(livePlaylist.items ?? []).map((video, idx) => {
        const isCurrent = idx === livePlaylist.currentVideoIndex;
        return (
          <div key={video.id} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${isCurrent ? "bg-white/5 border border-white/10" : "hover:bg-white/[0.03]"}`}>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${isCurrent ? "bg-[#cc0000] text-white" : "bg-[#272727] text-[#aaa]"}`}>
              {isCurrent && isLive ? "▶" : idx + 1}
            </span>
            <span className="flex-1 text-sm text-[#ccc] truncate">{video.title}</span>
            {isCurrent && <span className="text-xs text-[#cc0000] flex-shrink-0">Playing</span>}
            <button onClick={() => removeVideo(video.id)} disabled={removingId === video.id}
              className="text-[#555] hover:text-red-400 text-xs transition-colors disabled:opacity-40 flex-shrink-0">
              {removingId === video.id ? "…" : "Remove"}
            </button>
          </div>
        );
      })}
      <div className="pt-2">
        {!addOpen ? (
          <button onClick={() => setAddOpen(true)} className="text-sm text-[#aaa] hover:text-white transition-colors">+ Add video to queue</button>
        ) : (
          <div className="border border-[#303030] rounded-xl p-4 bg-[#111]">
            <AddVideoForm playlistId={livePlaylist.id} profileId={profileId} token={token}
              onDone={() => { setAddOpen(false); onRefresh(); }} onCancel={() => setAddOpen(false)} />
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Settings tab ───────────────────────────────────── */
function SettingsTab({ livePlaylist }: { livePlaylist: StreamPlaylist }) {
  const rows = [
    ["Title",          livePlaylist.title],
    ["Loop settings",  livePlaylist.repeatCount !== null ? `Repeat ${livePlaylist.repeatCount} time${livePlaylist.repeatCount !== 1 ? "s" : ""}` : "Loop indefinitely (∞)"],
    ["Current repeat", livePlaylist.repeatCount !== null ? `${livePlaylist.currentRepeat + 1} / ${livePlaylist.repeatCount}` : `Loop ${livePlaylist.currentRepeat + 1}`],
    ["Current video",  `${livePlaylist.currentVideoIndex + 1} of ${livePlaylist.items?.length ?? 0}`],
    ...(livePlaylist.scheduledStartAt ? [["Scheduled start", new Date(livePlaylist.scheduledStartAt).toLocaleString()]] : []),
    ...(livePlaylist.scheduledEndAt   ? [["Scheduled end",   new Date(livePlaylist.scheduledEndAt).toLocaleString()]]   : []),
  ];
  return (
    <div className="p-5 space-y-4">
      {rows.map(([label, value]) => (
        <div key={label}>
          <p className="text-xs text-[#717171] uppercase tracking-wider font-semibold mb-1">{label}</p>
          <p className="text-sm text-white">{value}</p>
        </div>
      ))}
    </div>
  );
}

/* ── Platforms tab ──────────────────────────────────── */
function PlatformsTab({ channels }: { channels: StreamChannel[] }) {
  return (
    <div className="p-5 space-y-3">
      <div className="flex items-center gap-3 p-3 rounded-lg bg-green-500/[0.07] border border-green-500/20">
        <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center flex-shrink-0">🌐</div>
        <div className="flex-1">
          <p className="text-sm font-medium">Your Live Page</p>
          <p className="text-xs text-green-400 mt-0.5">Always active</p>
        </div>
        <span className="px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 text-xs border border-green-500/20">● Live</span>
      </div>
      {channels.length === 0 ? (
        <p className="text-sm text-[#555] text-center py-6">No external platforms connected.</p>
      ) : (
        channels.map((ch) => (
          <div key={ch.id} className="flex items-center gap-3 p-3 rounded-lg bg-[#111] border border-[#272727]">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold flex-shrink-0 ${ch.channelProvider === "youtube" ? "bg-red-700" : ch.channelProvider === "twitch" ? "bg-purple-700" : "bg-orange-600"}`}>
              {ch.channelProvider === "youtube" ? "▶" : ch.channelProvider === "twitch" ? "♟" : "⚡"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{ch.title}</p>
              <p className="text-xs text-[#717171] capitalize">{ch.channelProvider.replace("_", " ")}</p>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 text-xs border border-green-500/20">● Streaming</span>
          </div>
        ))
      )}
    </div>
  );
}

/* ── Create playlist modal ──────────────────────────── */
function CreatePlaylistModal({ profileId, token, onDone, onClose }: { profileId: string; token: string; onDone: () => void; onClose: () => void }) {
  const [title, setTitle] = useState(""); const [repeatCount, setRepeatCount] = useState(""); const [start, setStart] = useState(""); const [end, setEnd] = useState(""); const [creating, setCreating] = useState(false);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setCreating(true);
    try {
      await axios.create({ baseURL: API_URL, headers: { authorization: `Bearer ${token}` } }).post("/stream-playlists", { profileId, title, repeatCount: repeatCount ? parseInt(repeatCount) : null, scheduledStartAt: start || null, scheduledEndAt: end || null });
      onDone();
    } catch { /* ignore */ } finally { setCreating(false); }
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4" onClick={onClose}>
      <div className="w-full max-w-md bg-[#212121] border border-[#303030] rounded-xl p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-semibold">Create playlist</h3>
          <button onClick={onClose} className="text-[#717171] hover:text-white text-xl leading-none">×</button>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <FormField label="Playlist name"><input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Weekend Show" required className={inputClass} autoFocus /></FormField>
          <FormField label="Repeat count (blank = infinite loop)"><input type="number" min="1" value={repeatCount} onChange={(e) => setRepeatCount(e.target.value)} placeholder="Leave blank to loop forever" className={inputClass} /></FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Start time (optional)"><input type="datetime-local" value={start} onChange={(e) => setStart(e.target.value)} className={inputClass} /></FormField>
            <FormField label="End time (optional)"><input type="datetime-local" value={end} onChange={(e) => setEnd(e.target.value)} className={inputClass} /></FormField>
          </div>
          <div className="flex gap-3 mt-1">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-lg border border-[#303030] text-[#aaa] text-sm hover:text-white transition-colors">Cancel</button>
            <button type="submit" disabled={creating || !title} className="flex-1 py-2.5 rounded-lg bg-white text-black text-sm font-semibold hover:bg-[#e5e5e5] disabled:opacity-50 transition-colors">{creating ? "Creating…" : "Create"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ── Playlists section (full page) ──────────────────── */
function PlaylistsSection({ profileId, token }: { profileId: string; token: string }) {
  const [playlists, setPlaylists] = useState<StreamPlaylist[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const api = useCallback(() => axios.create({ baseURL: API_URL, headers: { authorization: `Bearer ${token}` } }), [token]);

  const fetch = useCallback(async () => {
    try { const { data } = await api().get(`/stream-playlists?profileId=${profileId}`); setPlaylists(Array.isArray(data) ? data : []); }
    catch { /* ignore */ } finally { setLoading(false); }
  }, [profileId, token]);

  useEffect(() => { fetch(); }, [fetch]);

  const doAction = async (id: string, action: string) => {
    setActionLoading(id + action);
    try { await api().post(`/stream-playlists/${id}/${action}?profileId=${profileId}`); await fetch(); }
    catch { /* ignore */ } finally { setActionLoading(null); }
  };

  const deletePlaylist = async (id: string) => {
    setActionLoading(id + "delete");
    try { await api().delete(`/stream-playlists/${id}?profileId=${profileId}`); setPlaylists((p) => p.filter((x) => x.id !== id)); }
    catch { /* ignore */ } finally { setActionLoading(null); }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg font-bold">Playlists</h1>
          <p className="text-sm text-[#717171] mt-0.5">Manage your 24/7 stream playlists</p>
        </div>
        <button onClick={() => setCreateOpen(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-black text-sm font-semibold hover:bg-[#e5e5e5] transition-colors">+ New Playlist</button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24 text-[#555] text-sm">Loading…</div>
      ) : playlists.length === 0 ? (
        <div className="bg-[#212121] rounded-xl border border-[#303030] flex flex-col items-center justify-center py-20 text-center">
          <div className="text-5xl mb-4">🎬</div>
          <p className="text-base font-semibold mb-1">No playlists yet</p>
          <p className="text-sm text-[#717171] mb-5">Create a playlist, add videos, then go live</p>
          <button onClick={() => setCreateOpen(true)} className="px-5 py-2.5 rounded-lg bg-white text-black text-sm font-semibold hover:bg-[#e5e5e5] transition-colors">Create your first playlist</button>
        </div>
      ) : (
        <div className="space-y-2">
          {playlists.map((pl) => (
            <PlaylistCard key={pl.id} playlist={pl} profileId={profileId} token={token}
              expanded={expandedId === pl.id} onToggle={() => setExpandedId(expandedId === pl.id ? null : pl.id)}
              onAction={doAction} onDelete={() => deletePlaylist(pl.id)} actionLoading={actionLoading} onRefresh={fetch} />
          ))}
        </div>
      )}

      {createOpen && <CreatePlaylistModal profileId={profileId} token={token} onDone={() => { setCreateOpen(false); fetch(); }} onClose={() => setCreateOpen(false)} />}
    </div>
  );
}

/* ── Playlist card ──────────────────────────────────── */
function PlaylistCard({ playlist, profileId, token, expanded, onToggle, onAction, onDelete, actionLoading, onRefresh }: {
  playlist: StreamPlaylist; profileId: string; token: string; expanded: boolean; onToggle: () => void;
  onAction: (id: string, action: string) => void; onDelete: () => void; actionLoading: string | null; onRefresh: () => void;
}) {
  const [addVideoOpen, setAddVideoOpen] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const api = useCallback(() => axios.create({ baseURL: API_URL, headers: { authorization: `Bearer ${token}` } }), [token]);
  const isLive   = playlist.status === "live";
  const isPaused = playlist.status === "paused";
  const isIdle   = playlist.status === "idle" || playlist.status === "ended";

  const removeVideo = async (videoId: string) => {
    setRemovingId(videoId);
    try { await api().delete(`/stream-playlists/${playlist.id}/videos/${videoId}?profileId=${profileId}`); onRefresh(); }
    catch { /* ignore */ } finally { setRemovingId(null); }
  };

  return (
    <div className="bg-[#212121] border border-[#303030] rounded-xl overflow-hidden">
      <div className="px-4 py-3.5 flex items-center gap-3">
        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${isLive ? "bg-[#cc0000] animate-pulse" : isPaused ? "bg-yellow-400" : "bg-[#444]"}`} />
        <button onClick={onToggle} className="flex-1 text-left min-w-0">
          <p className="text-sm font-semibold truncate">{playlist.title}</p>
          <p className="text-xs text-[#717171] mt-0.5">
            {playlist.items?.length ?? 0} video{playlist.items?.length !== 1 ? "s" : ""}
            {playlist.repeatCount !== null ? ` · ×${playlist.repeatCount}` : " · ∞ loop"}
            {playlist.scheduledStartAt && ` · Starts ${new Date(playlist.scheduledStartAt).toLocaleDateString()}`}
          </p>
        </button>
        <span className={`text-xs font-semibold flex-shrink-0 ${isLive ? "text-[#ff4444]" : isPaused ? "text-yellow-400" : "text-[#555]"}`}>
          {isLive ? "● Live" : isPaused ? "⏸ Paused" : playlist.status === "ended" ? "Ended" : "Idle"}
        </span>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {isIdle   && <button onClick={() => onAction(playlist.id, "start")}  disabled={!!actionLoading} className="px-3 py-1.5 rounded-lg bg-white text-black text-xs font-semibold hover:bg-[#e5e5e5] disabled:opacity-40 transition-colors">▶ Start</button>}
          {isLive   && <>
            <button onClick={() => onAction(playlist.id, "pause")} disabled={!!actionLoading} className="px-3 py-1.5 rounded-lg border border-[#404040] text-white text-xs hover:bg-white/5 disabled:opacity-40 transition-colors">⏸</button>
            <button onClick={() => onAction(playlist.id, "stop")}  disabled={!!actionLoading} className="px-3 py-1.5 rounded-lg border border-[#404040] text-[#ff6666] text-xs hover:bg-red-500/10 disabled:opacity-40 transition-colors">■ Stop</button>
          </>}
          {isPaused && <>
            <button onClick={() => onAction(playlist.id, "resume")} disabled={!!actionLoading} className="px-3 py-1.5 rounded-lg bg-white text-black text-xs font-semibold hover:bg-[#e5e5e5] disabled:opacity-40 transition-colors">▶ Resume</button>
            <button onClick={() => onAction(playlist.id, "stop")}   disabled={!!actionLoading} className="px-3 py-1.5 rounded-lg border border-[#404040] text-[#ff6666] text-xs hover:bg-red-500/10 disabled:opacity-40 transition-colors">■ Stop</button>
          </>}
          <button onClick={onDelete} disabled={!!actionLoading} className="w-7 h-7 rounded-lg flex items-center justify-center text-[#555] hover:text-red-400 hover:bg-red-500/10 transition-colors text-sm disabled:opacity-40">✕</button>
          <button onClick={onToggle} className="w-7 h-7 rounded-lg flex items-center justify-center text-[#555] hover:text-white hover:bg-white/5 transition-colors text-xs">{expanded ? "▲" : "▼"}</button>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-[#272727]">
          {(playlist.items?.length ?? 0) === 0 ? (
            <div className="py-8 text-center text-sm text-[#555]">No videos yet — add one below</div>
          ) : (
            <div className="divide-y divide-[#1a1a1a]">
              {playlist.items?.map((video, idx) => (
                <div key={video.id} className={`px-4 py-2.5 flex items-center gap-3 ${isLive && idx === playlist.currentVideoIndex ? "bg-[#1a1a1a]" : ""}`}>
                  <span className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${isLive && idx === playlist.currentVideoIndex ? "bg-[#cc0000] text-white" : "bg-[#2a2a2a] text-[#555]"}`}>
                    {isLive && idx === playlist.currentVideoIndex ? "▶" : idx + 1}
                  </span>
                  <span className="text-sm text-[#ccc] truncate flex-1">{video.title}</span>
                  {isLive && idx === playlist.currentVideoIndex && <span className="text-xs text-[#cc0000] flex-shrink-0">Playing</span>}
                  <button onClick={() => removeVideo(video.id)} disabled={removingId === video.id} className="text-[#555] hover:text-red-400 text-xs transition-colors disabled:opacity-40">{removingId === video.id ? "…" : "remove"}</button>
                </div>
              ))}
            </div>
          )}
          <div className="px-4 py-3 border-t border-[#272727]">
            {addVideoOpen ? (
              <AddVideoForm playlistId={playlist.id} profileId={profileId} token={token} onDone={() => { setAddVideoOpen(false); onRefresh(); }} onCancel={() => setAddVideoOpen(false)} />
            ) : (
              <button onClick={() => setAddVideoOpen(true)} className="text-sm text-[#aaa] hover:text-white transition-colors">+ Add video</button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Add video form ─────────────────────────────────── */
function AddVideoForm({ playlistId, profileId, token, onDone, onCancel }: { playlistId: string; profileId: string; token: string; onDone: () => void; onCancel: () => void }) {
  const [title, setTitle] = useState(""); const [file, setFile] = useState<File | null>(null); const [uploading, setUploading] = useState(false); const [progress, setProgress] = useState(0); const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const api = axios.create({ baseURL: API_URL, headers: { authorization: `Bearer ${token}` } });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); if (!file || !title) return; setUploading(true); setError("");
    const CHUNK = 50 * 1024 * 1024; let uploadId: string | null = null, key: string | null = null;
    try {
      const { data: start } = await api.post("/stream-playlists/multipart/start", { profileId, filename: file.name }); uploadId = start.uploadId; key = start.key;
      const total = Math.ceil(file.size / CHUNK);
      for (let i = 0; i < total; i++) {
        const chunk = file.slice(i * CHUNK, (i + 1) * CHUNK);
        const { data: { presignedUrl } } = await api.post("/stream-playlists/multipart/part-url", { profileId, key, uploadId, partNumber: i + 1 });
        await axios.put(presignedUrl, chunk, { headers: { "Content-Type": file.type || "video/mp4" }, onUploadProgress: (evt) => { if (evt.total) setProgress(Math.round(((i + evt.loaded / evt.total) / total) * 100)); } });
      }
      const { data: { remoteUrl } } = await api.post("/stream-playlists/multipart/complete", { profileId, key, uploadId });
      await api.post(`/stream-playlists/${playlistId}/videos?profileId=${profileId}`, { title, videoUrl: remoteUrl, videoFilename: file.name });
      onDone();
    } catch (err: any) {
      if (uploadId && key) api.post("/stream-playlists/multipart/abort", { profileId, key, uploadId }).catch(() => {});
      setError(err?.response?.data?.message ?? "Upload failed.");
    } finally { setUploading(false); }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      {error && <p className="text-red-400 text-xs">{error}</p>}
      <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Video title" required className={inputClass} />
      <div onClick={() => !uploading && fileRef.current?.click()} className="flex items-center justify-center py-5 rounded-xl border border-dashed border-[#303030] hover:border-[#555] cursor-pointer transition-colors">
        {uploading ? (
          <div className="flex flex-col items-center gap-2 w-full px-6">
            <div className="w-full bg-[#272727] rounded-full h-1.5"><div className="h-full bg-white rounded-full transition-all" style={{ width: `${progress}%` }} /></div>
            <span className="text-xs text-[#aaa]">{progress}%</span>
          </div>
        ) : file ? (
          <span className="text-xs text-[#aaa]">{file.name} ({(file.size / 1024 / 1024).toFixed(1)} MB)</span>
        ) : (
          <div className="text-center">
            <p className="text-sm text-[#717171]">Click to select video</p>
            <p className="text-xs text-[#555] mt-0.5">Up to 2 GB</p>
          </div>
        )}
      </div>
      <input ref={fileRef} type="file" accept="video/*" onChange={(e) => setFile(e.target.files?.[0] ?? null)} className="hidden" />
      <div className="flex gap-2">
        <button type="button" onClick={onCancel} className="flex-1 py-2 rounded-lg border border-[#303030] text-[#aaa] text-sm hover:text-white transition-colors">Cancel</button>
        <button type="submit" disabled={uploading || !file || !title} className="flex-1 py-2 rounded-lg bg-white text-black text-sm font-semibold hover:bg-[#e5e5e5] disabled:opacity-50 transition-colors">{uploading ? "Uploading…" : "Add Video"}</button>
      </div>
    </form>
  );
}

/* ── Destinations section ───────────────────────────── */
function DestinationsSection({ profileId, token, slug, rootDomain }: { profileId: string; token: string; slug: string; rootDomain: string }) {
  const [channels, setChannels] = useState<StreamChannel[]>([]);
  const [loading, setLoading] = useState(true);
  const [connectingPlatform, setConnectingPlatform] = useState<string | null>(null);
  const [rtmpForm, setRtmpForm] = useState<{ platformId: string; title: string; ingestUrl: string; streamKey: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const livePageUrl = `https://${slug}.${rootDomain}/live`;

  const api = useCallback(() => axios.create({ baseURL: API_URL, headers: { authorization: `Bearer ${token}` } }), [token]);
  const fetchChannels = useCallback(() => {
    api().get(`/streams/channels?profileId=${profileId}`)
      .then((r) => setChannels(Array.isArray(r.data) ? r.data : (r.data?.data ?? [])))
      .catch(() => {}).finally(() => setLoading(false));
  }, [profileId, token]);
  useEffect(() => { fetchChannels(); }, [fetchChannels]);

  const handleOAuth = async (platformId: string) => {
    setConnectingPlatform(platformId);
    try {
      const endpoint = platformId === "youtube" ? `/streams/oauth/youtube/url?profileId=${profileId}` : `/streams/oauth/twitch/url?profileId=${profileId}`;
      const { data } = await api().get(endpoint);
      window.location.href = data.url || data;
    } catch { setConnectingPlatform(null); }
  };

  const handleRtmpConnect = async (e: React.FormEvent) => {
    e.preventDefault(); if (!rtmpForm) return; setSaving(true); setError("");
    try {
      const ingestUrl = rtmpForm.streamKey ? `${rtmpForm.ingestUrl.replace(/\/$/, "")}/${rtmpForm.streamKey}` : rtmpForm.ingestUrl;
      await api().post("/streams/channels/custom-rtmp", { profileId, title: rtmpForm.title, ingestUrl });
      setRtmpForm(null); fetchChannels();
    } catch (err: any) { setError(err?.response?.data?.message ?? "Failed to connect."); }
    finally { setSaving(false); }
  };

  const isConnected = (platformId: string) => channels.some((c) =>
    c.channelProvider === platformId ||
    (platformId !== "youtube" && platformId !== "twitch" && c.channelProvider === "custom_rtmp"),
  );

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-lg font-bold">Destinations</h1>
        <p className="text-sm text-[#717171] mt-0.5">Connect platforms to simulcast everywhere</p>
      </div>

      {/* Always-on */}
      <div className="flex items-center justify-between p-4 rounded-xl border border-green-500/20 bg-green-500/[0.05] mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-green-500/15 flex items-center justify-center text-xl">🌐</div>
          <div>
            <p className="text-sm font-semibold">Your Channel Live Page <span className="ml-2 px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 text-xs">Always on</span></p>
            <a href={livePageUrl} target="_blank" rel="noreferrer" className="text-xs text-green-400 hover:text-green-300 transition-colors">{livePageUrl}</a>
          </div>
        </div>
        <a href={livePageUrl} target="_blank" rel="noreferrer" className="text-xs px-3 py-1.5 rounded-lg border border-green-500/20 text-green-400 hover:bg-green-500/10 transition-colors">Preview ↗</a>
      </div>

      {/* Platform grid */}
      <p className="text-xs text-[#555] uppercase tracking-widest font-semibold mb-3">Connect platforms</p>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
        {PLATFORMS.map((platform) => {
          const connected = isConnected(platform.id);
          const isConnecting = connectingPlatform === platform.id;
          return (
            <div key={platform.id} className={`rounded-xl border p-4 transition-all ${connected ? "border-green-500/25 bg-green-500/[0.04]" : "border-[#272727] bg-[#212121] hover:border-[#444]"}`}>
              <div className="flex items-start justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl ${platform.bg} flex items-center justify-center text-white font-bold text-lg`}>{platform.icon}</div>
                {connected && <span className="px-1.5 py-0.5 rounded-full bg-green-500/20 text-green-400 text-[10px] font-semibold">✓ Connected</span>}
              </div>
              <p className="text-sm font-semibold mb-3">{platform.name}</p>
              {!connected && (
                platform.oauthSupported ? (
                  <button onClick={() => handleOAuth(platform.id)} disabled={isConnecting}
                    className="w-full py-2 rounded-lg text-xs font-semibold text-white disabled:opacity-40 hover:opacity-90 transition-opacity"
                    style={{ backgroundColor: platform.color }}>
                    {isConnecting ? "Connecting…" : `Connect ${platform.name}`}
                  </button>
                ) : (
                  <button onClick={() => setRtmpForm({ platformId: platform.id, title: platform.name, ingestUrl: platform.rtmpUrl, streamKey: "" })}
                    className="w-full py-2 rounded-lg border border-[#303030] hover:border-[#555] text-xs font-semibold text-[#aaa] hover:text-white transition-colors">
                    Add stream key
                  </button>
                )
              )}
            </div>
          );
        })}
      </div>

      {/* Active connections */}
      {channels.length > 0 && (
        <div className="rounded-xl border border-[#272727] bg-[#212121] overflow-hidden">
          <div className="px-4 py-3 border-b border-[#272727]"><p className="text-xs text-[#555] uppercase tracking-widest font-semibold">Active connections</p></div>
          {channels.map((ch) => (
            <div key={ch.id} className="px-4 py-3 border-b border-[#1a1a1a] last:border-0 flex items-center gap-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold flex-shrink-0 ${ch.channelProvider === "youtube" ? "bg-red-700" : ch.channelProvider === "twitch" ? "bg-purple-700" : "bg-orange-600"}`}>
                {ch.channelProvider === "youtube" ? "▶" : ch.channelProvider === "twitch" ? "♟" : "⚡"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{ch.title}</p>
                <p className="text-xs text-[#717171] capitalize">{ch.channelProvider.replace("_", " ")}</p>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-xs">Active</span>
            </div>
          ))}
        </div>
      )}
      {loading && <div className="py-8 flex items-center justify-center text-[#555] text-sm">Loading…</div>}

      {/* RTMP modal */}
      {rtmpForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4" onClick={() => { setRtmpForm(null); setError(""); }}>
          <div className="w-full max-w-sm bg-[#212121] border border-[#303030] rounded-xl p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-semibold">Connect {rtmpForm.title}</h3>
              <button onClick={() => { setRtmpForm(null); setError(""); }} className="text-[#717171] hover:text-white text-xl leading-none">×</button>
            </div>
            <form onSubmit={handleRtmpConnect} className="flex flex-col gap-4">
              {error && <p className="text-red-400 text-xs px-3 py-2 bg-red-500/10 rounded-lg">{error}</p>}
              <FormField label="Channel name"><input value={rtmpForm.title} onChange={(e) => setRtmpForm({ ...rtmpForm, title: e.target.value })} className={inputClass} required /></FormField>
              <FormField label="RTMP URL"><input value={rtmpForm.ingestUrl} onChange={(e) => setRtmpForm({ ...rtmpForm, ingestUrl: e.target.value })} placeholder={PLATFORMS.find((p) => p.id === rtmpForm.platformId)?.rtmpPlaceholder} className={inputClass} required /></FormField>
              <FormField label="Stream key">
                <input type="password" value={rtmpForm.streamKey} onChange={(e) => setRtmpForm({ ...rtmpForm, streamKey: e.target.value })} placeholder="Your stream key" className={inputClass} />
                <p className="text-xs text-[#555] mt-1">Appended to the RTMP URL</p>
              </FormField>
              <div className="flex gap-3 mt-1">
                <button type="button" onClick={() => { setRtmpForm(null); setError(""); }} className="flex-1 py-2.5 rounded-lg border border-[#303030] text-[#aaa] text-sm hover:text-white transition-colors">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 py-2.5 rounded-lg bg-white text-black text-sm font-semibold hover:bg-[#e5e5e5] disabled:opacity-50 transition-colors">{saving ? "Connecting…" : "Connect"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
