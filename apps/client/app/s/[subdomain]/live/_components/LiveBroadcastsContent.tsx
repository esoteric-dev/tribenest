"use client";
import { useEditorContext } from "@tribe-nest/frontend-shared";
import InternalPageRenderer from "../../_components/internal-page-renderer";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useRef } from "react";

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
  const videoRef = useRef<HTMLVideoElement>(null);
  const queryClient = useQueryClient();

  const { data: livePlaylist } = useQuery<LivePlaylist | null>({
    queryKey: ["live-playlist", profile?.id],
    queryFn: async () => {
      const res = await httpClient!.get("/public/stream-playlists/live", {
        params: { profileId: profile?.id },
      });
      return res.data ?? null;
    },
    enabled: !!profile?.id && !!httpClient,
    refetchInterval: 10000,
  });

  const current = livePlaylist?.currentItem ?? null;

  // When video ends, tell server to advance and refresh
  const handleEnded = useCallback(async () => {
    if (!livePlaylist || !httpClient) return;
    const expectedIndex = livePlaylist.currentVideoIndex;
    try {
      await httpClient.post(`/public/stream-playlists/${livePlaylist.id}/advance`, {
        expectedIndex,
      });
    } catch { /* ignore */ }
    // Immediately refetch to get new state
    queryClient.invalidateQueries({ queryKey: ["live-playlist", profile?.id] });
  }, [livePlaylist, httpClient, profile?.id, queryClient]);

  // Auto-play when current item changes
  useEffect(() => {
    const v = videoRef.current;
    if (!v || !current) return;
    v.load();
    v.play().catch(() => {});
  }, [current?.id]);

  if (!livePlaylist || livePlaylist.status !== "live" || !current) {
    return (
      <InternalPageRenderer pagePathname="/live">
        <div
          className="flex items-center justify-center min-h-[400px]"
          style={{ color: themeSettings.colors.text }}
        >
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

  const items = livePlaylist.items ?? [];
  const currentIdx = livePlaylist.currentVideoIndex;

  return (
    <InternalPageRenderer pagePathname="/live">
      <div
        className="w-full px-4 sm:px-6 lg:px-8 py-6"
        style={{
          backgroundColor: themeSettings.colors.background,
          color: themeSettings.colors.text,
          fontFamily: themeSettings.fontFamily,
        }}
      >
        <div className="max-w-5xl mx-auto">
          {/* Live badge + title */}
          <div className="flex items-center gap-3 mb-4">
            <span className="px-2 py-1 rounded-full bg-red-500 text-white text-xs font-bold animate-pulse">
              ● LIVE
            </span>
            <h2 className="text-xl font-bold" style={{ color: themeSettings.colors.text }}>
              {current.title}
            </h2>
          </div>

          {/* Video player */}
          <div
            className="overflow-hidden mb-6"
            style={{
              borderRadius: `${themeSettings.cornerRadius}px`,
              border: `1px solid ${themeSettings.colors.primary}40`,
              background: "#000",
            }}
          >
            <video
              ref={videoRef}
              key={current.id}
              src={current.videoUrl}
              controls
              autoPlay
              playsInline
              onEnded={handleEnded}
              style={{ width: "100%", maxHeight: "70vh", display: "block" }}
            />
          </div>

          {/* Playlist — only show if more than one video */}
          {items.length > 1 && (
            <div>
              <h3
                className="text-sm font-semibold uppercase tracking-wide mb-3"
                style={{ color: themeSettings.colors.text, opacity: 0.5 }}
              >
                Up next
              </h3>
              <div className="flex flex-col gap-2">
                {items.map((item, idx) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg"
                    style={{
                      background: idx === currentIdx
                        ? `${themeSettings.colors.primary}20`
                        : "transparent",
                      border: `1px solid ${idx === currentIdx ? themeSettings.colors.primary + "60" : "transparent"}`,
                      borderRadius: `${themeSettings.cornerRadius}px`,
                    }}
                  >
                    <span
                      className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                      style={{
                        background: idx === currentIdx ? themeSettings.colors.primary : `${themeSettings.colors.primary}20`,
                        color: idx === currentIdx ? "#fff" : themeSettings.colors.text,
                      }}
                    >
                      {idx === currentIdx ? "▶" : idx + 1}
                    </span>
                    <span
                      className="text-sm font-medium truncate flex-1"
                      style={{ color: themeSettings.colors.text }}
                    >
                      {item.title}
                    </span>
                    {idx === currentIdx && (
                      <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-red-500 text-white font-medium flex-shrink-0">
                        Now playing
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Repeat info */}
          {livePlaylist.repeatCount !== null && (
            <p className="text-xs mt-4" style={{ color: themeSettings.colors.text, opacity: 0.3 }}>
              Loop {livePlaylist.currentRepeat + 1} of {livePlaylist.repeatCount}
            </p>
          )}
        </div>
      </div>
    </InternalPageRenderer>
  );
}
