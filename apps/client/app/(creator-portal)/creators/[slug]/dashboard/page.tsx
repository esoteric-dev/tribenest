"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useCallback } from "react";
import axios from "axios";
import { useCreatorAuth } from "../../../../_contexts/creator-auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

type ScheduledStream = {
  id: string;
  title: string;
  videoFilename: string;
  videoUrl: string;
  scheduledAt: string;
  status: "pending" | "live" | "ended";
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
            <h2 className="text-xl font-semibold">Stream Scheduler</h2>
            {profile && token && (
              <ScheduleButton profileId={profile.id} token={token} />
            )}
          </div>
          {/* Where it streams callout */}
          <div className="mb-4 px-4 py-3 rounded-lg bg-white/[0.03] border border-white/5 flex items-start gap-3">
            <span className="text-lg mt-0.5">📡</span>
            <div>
              <p className="text-sm text-white/70 font-medium">Where do scheduled videos stream?</p>
              <p className="text-xs text-white/40 mt-0.5">
                Scheduled videos play automatically on your live page at{" "}
                <a href={`https://${slug}.${rootDomain}/live`} target="_blank" rel="noreferrer"
                  className="text-orange-400 hover:text-orange-300">
                  {slug}.{rootDomain}/live
                </a>
                {" "}at the scheduled time. Viewers can watch directly in the browser — no app needed.
              </p>
            </div>
          </div>
          {profile && token && <ScheduledStreamsList profileId={profile.id} token={token} />}
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

/* ── Stream scheduler ─────────────────────────────── */

function ScheduleButton({ profileId, token }: { profileId: string; token: string }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [scheduledAt, setScheduledAt] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const [, forceRefresh] = useState(0);

  const apiClient = axios.create({
    baseURL: API_URL,
    headers: { authorization: `Bearer ${token}` },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !title || !scheduledAt) return;
    setUploading(true);
    setError("");

    try {
      // Step 1: get presigned URL
      const { data: { presignedUrl, remoteUrl } } = await apiClient.post("/scheduled-streams/presigned-url", {
        profileId,
        filename: file.name,
      });

      // Step 2: upload video directly to MinIO
      await axios.put(presignedUrl, file, {
        headers: { "Content-Type": file.type || "video/mp4" },
        onUploadProgress: (e) => {
          if (e.total) setUploadProgress(Math.round((e.loaded * 100) / e.total));
        },
      });

      // Step 3: create scheduled stream record
      await apiClient.post("/scheduled-streams", {
        profileId,
        title,
        videoFilename: file.name,
        videoUrl: remoteUrl,
        scheduledAt: new Date(scheduledAt).toISOString(),
      });

      setTitle(""); setFile(null); setScheduledAt(""); setOpen(false); setUploadProgress(0);
      forceRefresh((n) => n + 1);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  if (!open) {
    return (
      <button onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-orange-500 hover:bg-orange-400 text-white text-sm font-semibold transition-colors">
        + Schedule stream
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
      <div className="w-full max-w-md bg-[#111] border border-white/10 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">Schedule a stream</h3>
          <button onClick={() => { setOpen(false); setError(""); }} className="text-white/40 hover:text-white text-xl leading-none">×</button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {error && <div className="px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>}

          <ModalField label="Stream title">
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Episode 3 — Deep Dive"
              required className={modalInputClass} />
          </ModalField>

          <ModalField label="Video file">
            <div onClick={() => !uploading && fileRef.current?.click()}
              className="flex flex-col items-center justify-center gap-2 py-8 rounded-lg border-2 border-dashed border-white/10 hover:border-orange-500/40 cursor-pointer transition-colors text-center">
              {uploading ? (
                <>
                  <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden mx-4 max-w-xs">
                    <div className="h-full bg-orange-500 transition-all" style={{ width: `${uploadProgress}%` }} />
                  </div>
                  <span className="text-sm text-white/50">Uploading… {uploadProgress}%</span>
                </>
              ) : file ? (
                <>
                  <span className="text-2xl">🎬</span>
                  <span className="text-sm text-white/70">{file.name}</span>
                  <span className="text-xs text-white/30">{(file.size / 1024 / 1024).toFixed(1)} MB</span>
                </>
              ) : (
                <>
                  <span className="text-2xl">📁</span>
                  <span className="text-sm text-white/50">Click to select a video</span>
                  <span className="text-xs text-white/25">MP4, MOV, MKV supported</span>
                </>
              )}
            </div>
            <input ref={fileRef} type="file" accept="video/*"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)} className="hidden" />
          </ModalField>

          <ModalField label="Go live at">
            <input type="datetime-local" value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)}
              required min={new Date().toISOString().slice(0, 16)} className={modalInputClass} />
          </ModalField>

          <div className="flex gap-3 mt-2">
            <button type="button" onClick={() => { setOpen(false); setError(""); }}
              className="flex-1 py-3 rounded-lg border border-white/10 hover:border-white/30 text-white/60 hover:text-white text-sm font-semibold transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={uploading || !file}
              className="flex-1 py-3 rounded-lg bg-orange-500 hover:bg-orange-400 disabled:opacity-50 text-white font-semibold text-sm transition-colors">
              {uploading ? "Uploading…" : "Schedule"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ScheduledStreamsList({ profileId, token }: { profileId: string; token: string }) {
  const [streams, setStreams] = useState<ScheduledStream[]>([]);
  const [loading, setLoading] = useState(true);

  const apiClient = axios.create({
    baseURL: API_URL,
    headers: { authorization: `Bearer ${token}` },
  });

  const fetchStreams = useCallback(async () => {
    try {
      const { data } = await apiClient.get(`/scheduled-streams?profileId=${profileId}`);
      setStreams(data);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, [profileId, token]);

  useEffect(() => { fetchStreams(); }, [fetchStreams]);

  const deleteStream = async (id: string) => {
    await apiClient.delete(`/scheduled-streams/${id}?profileId=${profileId}`);
    setStreams((prev) => prev.filter((s) => s.id !== id));
  };

  if (loading) return <div className="h-32 flex items-center justify-center text-white/30 text-sm">Loading…</div>;

  return (
    <div className="rounded-xl border border-white/5 bg-white/[0.02] overflow-hidden">
      <div className="px-4 py-3 border-b border-white/5 grid grid-cols-4 text-xs text-white/30 uppercase tracking-wide font-medium">
        <span>Title</span><span>File</span><span>Scheduled for</span><span>Status</span>
      </div>

      {streams.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <span className="text-3xl mb-3">📅</span>
          <p className="text-white/40 text-sm">No streams scheduled yet</p>
          <p className="text-white/20 text-xs mt-1">Click "Schedule stream" to upload a video and pick a time</p>
        </div>
      ) : (
        streams.map((s) => (
          <div key={s.id} className="px-4 py-3 border-b border-white/5 last:border-0 grid grid-cols-4 items-center text-sm">
            <span className="text-white/80 truncate pr-2">{s.title}</span>
            <span className="text-white/40 truncate pr-2 text-xs">{s.videoFilename}</span>
            <span className="text-white/50 text-xs">{new Date(s.scheduledAt).toLocaleString()}</span>
            <div className="flex items-center gap-3">
              <StatusBadge status={s.status} />
              {s.status !== "live" && (
                <button onClick={() => deleteStream(s.id)}
                  className="text-white/20 hover:text-red-400 transition-colors text-xs">delete</button>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    pending: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    live: "bg-green-500/10 text-green-400 border-green-500/20",
    ended: "bg-white/5 text-white/30 border-white/10",
  };
  return (
    <span className={`px-2 py-0.5 rounded-full border text-xs font-medium ${map[status] ?? map.ended}`}>
      {status === "live" ? "🔴 Live" : status === "pending" ? "Scheduled" : "Ended"}
    </span>
  );
}

/* ── Stream Channels ──────────────────────────────── */

type StreamChannel = {
  id: string;
  name: string;
  type: string;
  rtmpUrl?: string;
  streamKey?: string;
};

function StreamChannels({ profileId, token, slug, rootDomain }: {
  profileId: string; token: string; slug: string; rootDomain: string;
}) {
  const [channels, setChannels] = useState<StreamChannel[]>([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [name, setName] = useState("");
  const [rtmpUrl, setRtmpUrl] = useState("");
  const [streamKey, setStreamKey] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const apiClient = axios.create({
    baseURL: API_URL,
    headers: { authorization: `Bearer ${token}` },
  });

  useEffect(() => {
    apiClient.get(`/streams/channels?profileId=${profileId}`)
      .then((r) => setChannels(Array.isArray(r.data) ? r.data : (r.data?.data ?? [])))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [profileId]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const { data } = await apiClient.post("/streams/channels/custom-rtmp", {
        profileId,
        name,
        rtmpUrl,
        streamKey,
      });
      setChannels((prev) => [...prev, data]);
      setName(""); setRtmpUrl(""); setStreamKey(""); setAddOpen(false);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Failed to add channel.");
    } finally {
      setSaving(false);
    }
  };

  const livePageUrl = `https://${slug}.${rootDomain}/live`;

  return (
    <div className="space-y-4">
      {/* Built-in destination */}
      <div className="rounded-xl border border-orange-500/20 bg-orange-500/5 px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xl">🌐</span>
          <div>
            <p className="text-sm font-semibold text-white/80">Your Live Page <span className="ml-2 px-1.5 py-0.5 rounded bg-green-500/20 text-green-400 text-xs">Always active</span></p>
            <a href={livePageUrl} target="_blank" rel="noreferrer"
              className="text-xs text-orange-400 hover:text-orange-300">{livePageUrl}</a>
          </div>
        </div>
      </div>

      {/* RTMP channels */}
      <div className="rounded-xl border border-white/5 bg-white/[0.02] overflow-hidden">
        <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
          <span className="text-xs text-white/30 uppercase tracking-wide font-medium">Custom RTMP destinations</span>
          {!addOpen && (
            <button onClick={() => setAddOpen(true)}
              className="text-xs px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors">
              + Add destination
            </button>
          )}
        </div>

        {addOpen && (
          <form onSubmit={handleAdd} className="px-4 py-4 border-b border-white/5 flex flex-col gap-3">
            {error && <p className="text-red-400 text-xs">{error}</p>}
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name (e.g. YouTube, Twitch)"
              required className={miniInputClass} />
            <input value={rtmpUrl} onChange={(e) => setRtmpUrl(e.target.value)} placeholder="RTMP URL (e.g. rtmp://a.rtmp.youtube.com/live2)"
              required className={miniInputClass} />
            <input value={streamKey} onChange={(e) => setStreamKey(e.target.value)} placeholder="Stream key"
              required className={miniInputClass} />
            <div className="flex gap-2">
              <button type="button" onClick={() => { setAddOpen(false); setError(""); }}
                className="flex-1 py-2 rounded-lg border border-white/10 text-white/50 text-xs hover:text-white transition-colors">
                Cancel
              </button>
              <button type="submit" disabled={saving}
                className="flex-1 py-2 rounded-lg bg-orange-500 hover:bg-orange-400 disabled:opacity-50 text-white text-xs font-semibold transition-colors">
                {saving ? "Saving…" : "Save"}
              </button>
            </div>
          </form>
        )}

        {loading ? (
          <div className="py-10 flex items-center justify-center text-white/30 text-sm">Loading…</div>
        ) : channels.length === 0 ? (
          <div className="py-10 flex flex-col items-center justify-center text-center gap-2">
            <span className="text-2xl">📺</span>
            <p className="text-white/40 text-sm">No RTMP destinations added</p>
            <p className="text-white/20 text-xs max-w-xs">
              Add your YouTube, Twitch, or Facebook Live RTMP URL + stream key to restream using OBS or Restream.io
            </p>
          </div>
        ) : (
          channels.map((ch) => (
            <div key={ch.id} className="px-4 py-3 border-b border-white/5 last:border-0 flex items-center justify-between text-sm">
              <div className="flex items-center gap-3">
                <span className="text-lg">
                  {ch.name?.toLowerCase().includes("youtube") ? "▶️" :
                   ch.name?.toLowerCase().includes("twitch") ? "💜" :
                   ch.name?.toLowerCase().includes("facebook") ? "🔵" : "📡"}
                </span>
                <div>
                  <p className="text-white/80 font-medium">{ch.name}</p>
                  <p className="text-white/30 text-xs mt-0.5 font-mono">{ch.rtmpUrl}</p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-white/30 text-xs">RTMP</span>
            </div>
          ))
        )}
      </div>

      <div className="px-4 py-3 rounded-lg bg-white/[0.02] border border-white/5">
        <p className="text-xs text-white/30 leading-relaxed">
          <span className="text-white/50 font-medium">How to use RTMP destinations:</span>{" "}
          Open OBS → Settings → Stream → Custom → paste your RTMP URL and stream key. Go live in OBS to push to that platform.
          For multi-platform streaming use{" "}
          <a href="https://restream.io" target="_blank" rel="noreferrer" className="text-orange-400 hover:text-orange-300">Restream.io</a>{" "}
          as your single RTMP endpoint.
        </p>
      </div>
    </div>
  );
}

const miniInputClass = "w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/20 focus:outline-none focus:border-orange-500/60 transition-colors text-xs";

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
