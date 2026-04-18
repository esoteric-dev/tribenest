"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useCreatorAuth } from "../../../../_contexts/creator-auth";

type ScheduledStream = {
  id: string;
  title: string;
  fileName: string;
  scheduledAt: string;
  status: "scheduled" | "live" | "ended";
};

export default function CreatorDashboard({ params }: { params: Promise<{ slug: string }> }) {
  const { isAuthenticated, isLoading, account, authorizations, logout } = useCreatorAuth();
  const router = useRouter();
  const [slug, setSlug] = useState<string>("");

  useEffect(() => {
    params.then((p) => setSlug(p.slug));
  }, [params]);

  // Redirect if not authenticated
  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }
    // Check this slug belongs to this user
    const owns = authorizations.some((a) => a.profile.subdomain === slug);
    if (slug && !owns) {
      router.replace("/login");
    }
  }, [isAuthenticated, isLoading, authorizations, slug]);

  if (isLoading || !slug) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) return null;

  const profile = authorizations.find((a) => a.profile.subdomain === slug)?.profile;
  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "varalabs.systems";

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col">
      {/* Top nav */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-white/5">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-lg font-bold tracking-tight">
            TribeNest
          </Link>
          <span className="text-white/20">/</span>
          <span className="text-sm text-white/50">{profile?.name ?? slug}</span>
        </div>

        <div className="flex items-center gap-4">
          <a
            href={`https://admin.${rootDomain}`}
            target="_blank"
            rel="noreferrer"
            className="text-sm text-white/40 hover:text-white transition-colors"
          >
            Admin panel ↗
          </a>
          <a
            href={`https://${slug}.${rootDomain}`}
            target="_blank"
            rel="noreferrer"
            className="text-sm text-white/40 hover:text-white transition-colors"
          >
            View channel ↗
          </a>
          <button
            onClick={() => { logout(); router.push("/"); }}
            className="text-sm text-white/30 hover:text-white/60 transition-colors"
          >
            Sign out
          </button>
        </div>
      </nav>

      <div className="flex-1 max-w-5xl mx-auto w-full px-4 py-10">
        {/* Welcome */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold">
            Welcome back, {account?.firstName}
          </h1>
          <p className="text-white/40 mt-1">
            Your channel:{" "}
            <a
              href={`https://${slug}.${rootDomain}`}
              target="_blank"
              rel="noreferrer"
              className="text-orange-400 hover:text-orange-300 transition-colors"
            >
              {slug}.{rootDomain}
            </a>
          </p>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <StatCard label="Scheduled streams" value="—" />
          <StatCard label="Total views" value="—" />
          <StatCard label="Members" value="—" />
          <StatCard label="Videos uploaded" value="—" />
        </div>

        {/* Stream scheduler */}
        <section className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Stream Scheduler</h2>
            <ScheduleButton />
          </div>

          <ScheduledStreamsTable />
        </section>

        {/* Quick links */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Manage your channel</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <QuickLink
              href={`https://admin.${rootDomain}`}
              icon="⚙️"
              title="Admin panel"
              description="Manage posts, memberships, events and website design."
              external
            />
            <QuickLink
              href={`https://${slug}.${rootDomain}`}
              icon="🌐"
              title="Your site"
              description="See what your audience sees when they visit your channel."
              external
            />
            <QuickLink
              href={`/creators/${slug}/dashboard`}
              icon="📅"
              title="Schedule a stream"
              description="Upload a video and set a date — it goes live automatically."
            />
          </div>
        </section>
      </div>
    </div>
  );
}

/* ── Sub-components ─────────────────────────────────── */

function ScheduleButton() {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [scheduledAt, setScheduledAt] = useState("");
  const [uploading, setUploading] = useState(false);
  const [streams, setStreams] = useState<ScheduledStream[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !title || !scheduledAt) return;
    setUploading(true);

    // Simulate upload — real implementation will POST to backend
    await new Promise((r) => setTimeout(r, 1500));
    setStreams((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        title,
        fileName: file.name,
        scheduledAt,
        status: "scheduled",
      },
    ]);
    setTitle("");
    setFile(null);
    setScheduledAt("");
    setOpen(false);
    setUploading(false);
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-orange-500 hover:bg-orange-400 text-white text-sm font-semibold transition-colors"
      >
        + Schedule stream
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
      <div className="w-full max-w-md bg-[#111] border border-white/10 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">Schedule a stream</h3>
          <button onClick={() => setOpen(false)} className="text-white/40 hover:text-white text-xl leading-none">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <ModalField label="Stream title">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Episode 3 — Deep Dive"
              required
              className={modalInputClass}
            />
          </ModalField>

          <ModalField label="Video file">
            <div
              onClick={() => fileRef.current?.click()}
              className="flex flex-col items-center justify-center gap-2 py-8 rounded-lg border-2 border-dashed border-white/10 hover:border-orange-500/40 cursor-pointer transition-colors text-center"
            >
              {file ? (
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
            <input
              ref={fileRef}
              type="file"
              accept="video/*"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="hidden"
            />
          </ModalField>

          <ModalField label="Go live at">
            <input
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              required
              min={new Date().toISOString().slice(0, 16)}
              className={modalInputClass}
            />
          </ModalField>

          <div className="flex gap-3 mt-2">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="flex-1 py-3 rounded-lg border border-white/10 hover:border-white/30 text-white/60 hover:text-white text-sm font-semibold transition-colors"
            >
              Cancel
            </button>
            <button type="submit" disabled={uploading} className="flex-1 py-3 rounded-lg bg-orange-500 hover:bg-orange-400 disabled:opacity-50 text-white font-semibold text-sm transition-colors">
              {uploading ? "Scheduling…" : "Schedule"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ScheduledStreamsTable() {
  return (
    <div className="rounded-xl border border-white/5 bg-white/[0.02] overflow-hidden">
      <div className="px-4 py-3 border-b border-white/5 grid grid-cols-4 text-xs text-white/30 uppercase tracking-wide font-medium">
        <span>Title</span>
        <span>File</span>
        <span>Scheduled for</span>
        <span>Status</span>
      </div>
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <span className="text-3xl mb-3">📅</span>
        <p className="text-white/40 text-sm">No streams scheduled yet</p>
        <p className="text-white/20 text-xs mt-1">Click "Schedule stream" to upload a video and pick a time</p>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-4 rounded-xl border border-white/5 bg-white/[0.02]">
      <p className="text-2xl font-bold mb-1">{value}</p>
      <p className="text-xs text-white/40">{label}</p>
    </div>
  );
}

function QuickLink({
  href,
  icon,
  title,
  description,
  external,
}: {
  href: string;
  icon: string;
  title: string;
  description: string;
  external?: boolean;
}) {
  const props = external ? { target: "_blank", rel: "noreferrer" } : {};
  return (
    <a
      href={href}
      {...props}
      className="p-5 rounded-xl border border-white/5 bg-white/[0.02] hover:border-orange-500/20 hover:bg-white/[0.04] transition-colors flex flex-col gap-2 group"
    >
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

const modalInputClass =
  "w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/20 focus:outline-none focus:border-orange-500/60 transition-colors text-sm";

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
      <div className="w-6 h-6 rounded-full border-2 border-orange-500 border-t-transparent animate-spin" />
    </div>
  );
}
