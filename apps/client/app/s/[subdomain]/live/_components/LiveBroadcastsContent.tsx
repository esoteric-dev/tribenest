"use client";
import { useEditorContext } from "@tribe-nest/frontend-shared";
import InternalPageRenderer from "../../_components/internal-page-renderer";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useRef, useState } from "react";

type PlaylistItem = {
  id: string;
  playlistId: string;
  title: string;
  videoUrl: string;
  position: number;
};

type LivePlaylist = {
  id: string;
  title: string;
  status: "live" | "paused" | "idle" | "ended";
  repeatCount: number | null;
  currentRepeat: number;
  currentVideoIndex: number;
  currentVideoStartedAt: string | null;
  currentItem: PlaylistItem | null;
  items: PlaylistItem[];
  totalVideos: number;
};

export function LiveBroadcastsContent() {
  const { profile, httpClient, themeSettings } = useEditorContext();
  const queryClient = useQueryClient();

  // Dual-buffer: two video elements, one visible/playing, one hidden/preloading
  const videoA = useRef<HTMLVideoElement>(null);
  const videoB = useRef<HTMLVideoElement>(null);
  // Which slot is currently active (visible/playing)
  const [activeSlot, setActiveSlot] = useState<"a" | "b">("a");
  const activeSlotRef = useRef<"a" | "b">("a");

  // Local index/repeat for optimistic advance — synced from server, updated instantly on end
  const [localIndex, setLocalIndex] = useState<number | null>(null);
  const localIndexRef = useRef<number>(0);
  const [localRepeat, setLocalRepeat] = useState<number>(0);
  const localRepeatRef = useRef<number>(0);
  const advancingRef = useRef(false);
  const playlistIdRef = useRef<string | null>(null);

  const { data: livePlaylist } = useQuery<LivePlaylist | null>({
    queryKey: ["live-playlist", profile?.id],
    queryFn: async () => {
      const res = await httpClient!.get("/public/stream-playlists/live", {
        params: { profileId: profile?.id },
      });
      return res.data ?? null;
    },
    enabled: !!profile?.id && !!httpClient,
    refetchInterval: 5000,
  });

  const items = livePlaylist?.items ?? [];

  // When a new playlist starts, reset everything and load first two videos
  useEffect(() => {
    if (!livePlaylist || livePlaylist.status !== "live") return;
    if (livePlaylist.id === playlistIdRef.current) return;
    playlistIdRef.current = livePlaylist.id;

    const idx = livePlaylist.currentVideoIndex;
    localIndexRef.current = idx;
    setLocalIndex(idx);
    localRepeatRef.current = livePlaylist.currentRepeat;
    setLocalRepeat(livePlaylist.currentRepeat);
    setActiveSlot("a");
    activeSlotRef.current = "a";

    const first = livePlaylist.items[idx];
    const second = livePlaylist.items[idx + 1] ?? null;

    if (videoA.current && first) {
      videoA.current.src = first.videoUrl;
      videoA.current.load();
      videoA.current.play().catch(() => {});
    }
    if (videoB.current && second) {
      videoB.current.src = second.videoUrl;
      videoB.current.load();
    }
  }, [livePlaylist?.id, livePlaylist?.status]);

  // If server index jumps ahead (another session advanced), resync
  useEffect(() => {
    if (!livePlaylist || livePlaylist.status !== "live") return;
    const serverIdx = livePlaylist.currentVideoIndex;
    if (serverIdx > localIndexRef.current) {
      localIndexRef.current = serverIdx;
      setLocalIndex(serverIdx);

      // Reload active slot with correct video
      const activeEl = activeSlotRef.current === "a" ? videoA.current : videoB.current;
      const inactiveEl = activeSlotRef.current === "a" ? videoB.current : videoA.current;
      const current = livePlaylist.items[serverIdx];
      const next = livePlaylist.items[serverIdx + 1] ?? null;
      if (activeEl && current) {
        activeEl.src = current.videoUrl;
        activeEl.load();
        activeEl.play().catch(() => {});
      }
      if (inactiveEl && next) {
        inactiveEl.src = next.videoUrl;
        inactiveEl.load();
      }
    }
  }, [livePlaylist?.currentVideoIndex]);

  const getNextIndex = useCallback((idx: number, total: number, repeatCount: number | null, currentRepeat: number): number | null => {
    if (idx + 1 < total) return idx + 1;
    const nextRepeat = currentRepeat + 1;
    if (repeatCount === null || nextRepeat < repeatCount) return 0;
    return null; // done
  }, []);

  const handleEnded = useCallback(async (slot: "a" | "b") => {
    // Only the active slot should trigger advance
    if (slot !== activeSlotRef.current) return;
    if (!livePlaylist || !httpClient || advancingRef.current) return;
    advancingRef.current = true;

    const total = items.length;
    const currentIdx = localIndexRef.current;
    if (total === 0) { advancingRef.current = false; return; }

    const currentRepeat = localRepeatRef.current;
    const nextIdx = getNextIndex(currentIdx, total, livePlaylist.repeatCount, currentRepeat);

    if (nextIdx !== null) {
      // If we wrapped back to the start, increment the local repeat counter
      const nextRepeat = nextIdx === 0 && currentIdx !== 0 ? currentRepeat + 1 : currentRepeat;
      localRepeatRef.current = nextRepeat;
      setLocalRepeat(nextRepeat);

      // Swap slots instantly — the inactive one was preloading nextIdx
      const newSlot: "a" | "b" = slot === "a" ? "b" : "a";
      activeSlotRef.current = newSlot;
      localIndexRef.current = nextIdx;
      setActiveSlot(newSlot);
      setLocalIndex(nextIdx);

      // Play the newly active (it was preloading)
      const newActiveEl = newSlot === "a" ? videoA.current : videoB.current;
      const newInactiveEl = newSlot === "a" ? videoB.current : videoA.current;
      if (newActiveEl) newActiveEl.play().catch(() => {});

      // Preload the one after next on the now-inactive slot
      const afterNextIdx = getNextIndex(nextIdx, total, livePlaylist.repeatCount, nextRepeat);
      if (newInactiveEl && afterNextIdx !== null && items[afterNextIdx]) {
        newInactiveEl.src = items[afterNextIdx].videoUrl;
        newInactiveEl.load();
      }
    }

    // Background: sync with server
    try {
      await httpClient.post(`/public/stream-playlists/${livePlaylist.id}/advance`, {
        expectedIndex: currentIdx,
      });
      queryClient.invalidateQueries({ queryKey: ["live-playlist", profile?.id] });
    } catch { /* ignore */ }

    advancingRef.current = false;
  }, [livePlaylist, httpClient, profile?.id, queryClient, items, getNextIndex]);

  const effectiveIndex = localIndex ?? livePlaylist?.currentVideoIndex ?? 0;
  const current = items[effectiveIndex] ?? null;

  if (!livePlaylist || livePlaylist.status !== "live" || !current) {
    return (
      <InternalPageRenderer pagePathname="/live">
        <div className="flex items-center justify-center min-h-[400px]" style={{ color: themeSettings.colors.text }}>
          <div className="text-center">
            <div className="text-4xl mb-4">📡</div>
            <h3 className="text-lg font-semibold mb-2" style={{ color: themeSettings.colors.text }}>
              No Live Stream
            </h3>
            <p style={{ color: themeSettings.colors.text, opacity: 0.6 }}>
              {livePlaylist?.status === "paused"
                ? "Stream is paused. Check back soon."
                : "No stream is live right now. Check back later."}
            </p>
          </div>
        </div>
      </InternalPageRenderer>
    );
  }

  const videoStyle: React.CSSProperties = { width: "100%", maxHeight: "70vh", display: "block", background: "#000" };
  const hiddenStyle: React.CSSProperties = { position: "absolute", width: 0, height: 0, opacity: 0, pointerEvents: "none" };

  return (
    <InternalPageRenderer pagePathname="/live">
      <div
        className="w-full px-4 sm:px-6 lg:px-8 py-6"
        style={{ backgroundColor: themeSettings.colors.background, color: themeSettings.colors.text, fontFamily: themeSettings.fontFamily }}
      >
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <span className="px-2 py-1 rounded-full bg-red-500 text-white text-xs font-bold animate-pulse">● LIVE</span>
            <h2 className="text-xl font-bold" style={{ color: themeSettings.colors.text }}>{current.title}</h2>
          </div>

          {/* Dual-buffer video player */}
          <div
            className="overflow-hidden mb-6 relative"
            style={{ borderRadius: `${themeSettings.cornerRadius}px`, border: `1px solid ${themeSettings.colors.primary}40`, background: "#000" }}
          >
            <video
              ref={videoA}
              controls
              playsInline
              onEnded={() => handleEnded("a")}
              style={activeSlot === "a" ? videoStyle : hiddenStyle}
            />
            <video
              ref={videoB}
              controls
              playsInline
              onEnded={() => handleEnded("b")}
              style={activeSlot === "b" ? videoStyle : hiddenStyle}
            />
          </div>

          {items.length > 1 && (
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wide mb-3" style={{ color: themeSettings.colors.text, opacity: 0.5 }}>
                Up next
              </h3>
              <div className="flex flex-col gap-2">
                {items.map((item, idx) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg"
                    style={{
                      background: idx === effectiveIndex ? `${themeSettings.colors.primary}20` : "transparent",
                      border: `1px solid ${idx === effectiveIndex ? themeSettings.colors.primary + "60" : "transparent"}`,
                      borderRadius: `${themeSettings.cornerRadius}px`,
                    }}
                  >
                    <span
                      className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                      style={{
                        background: idx === effectiveIndex ? themeSettings.colors.primary : `${themeSettings.colors.primary}20`,
                        color: idx === effectiveIndex ? "#fff" : themeSettings.colors.text,
                      }}
                    >
                      {idx === effectiveIndex ? "▶" : idx + 1}
                    </span>
                    <span className="text-sm font-medium truncate flex-1" style={{ color: themeSettings.colors.text }}>{item.title}</span>
                    {idx === effectiveIndex && (
                      <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-red-500 text-white font-medium flex-shrink-0">Now playing</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {livePlaylist.repeatCount !== null && (
            <p className="text-xs mt-4" style={{ color: themeSettings.colors.text, opacity: 0.3 }}>
              Loop {localRepeat + 1} of {livePlaylist.repeatCount}
            </p>
          )}
        </div>
      </div>
    </InternalPageRenderer>
  );
}
