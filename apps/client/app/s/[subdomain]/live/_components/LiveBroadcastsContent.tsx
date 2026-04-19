"use client";
import { useEditorContext } from "@tribe-nest/frontend-shared";
import InternalPageRenderer from "../../_components/internal-page-renderer";
import { useQuery } from "@tanstack/react-query";
import { ILiveBroadcast } from "./types";
import { formatDateTime } from "@tribe-nest/frontend-shared";
import { Play, Calendar } from "lucide-react";

type ScheduledStream = {
  id: string;
  title: string;
  videoUrl: string;
  scheduledAt: string;
  status: "pending" | "live" | "ended";
};

export function LiveBroadcastsContent() {
  const { profile, httpClient, navigate, themeSettings } = useEditorContext();

  const { data: liveScheduledStream } = useQuery<ScheduledStream | null>({
    queryKey: ["live-scheduled-stream", profile?.id],
    queryFn: async () => {
      const res = await httpClient!.get("/public/scheduled-streams/live", {
        params: { profileId: profile?.id },
      });
      return res.data ?? null;
    },
    enabled: !!profile?.id && !!httpClient,
    refetchInterval: 30000,
  });

  const {
    data: broadcasts,
    isLoading: broadcastsLoading,
    error,
  } = useQuery<ILiveBroadcast[]>({
    queryKey: ["live-broadcasts", profile?.id],
    queryFn: async () => {
      const res = await httpClient!.get("/public/broadcasts", {
        params: { profileId: profile?.id },
      });
      return res.data;
    },
    enabled: !!profile?.id && !!httpClient,
  });

  const handleBroadcastClick = (broadcastId: string) => {
    navigate(`/live/${broadcastId}`);
  };

  const getBroadcastStatus = (broadcast: ILiveBroadcast) => {
    if (broadcast.startedAt && !broadcast.endedAt) {
      return { text: "LIVE", className: "bg-red-500 text-white" };
    }

    const now = new Date();

    if (broadcast.startDate && new Date(broadcast.startDate) > now) {
      return { text: "UPCOMING", className: "bg-blue-500 text-white" };
    }
    return { text: "ENDED", className: "bg-gray-500 text-white" };
  };

  if (broadcastsLoading) {
    return (
      <InternalPageRenderer pagePathname="/live">
        <div className="flex items-center justify-center min-h-[400px]" style={{ color: themeSettings.colors.text }}>
          <div
            className="animate-spin rounded-full h-8 w-8 border-b-2"
            style={{ borderColor: themeSettings.colors.primary }}
          ></div>
        </div>
      </InternalPageRenderer>
    );
  }

  if (error) {
    return (
      <InternalPageRenderer pagePathname="/live">
        <div className="flex items-center justify-center min-h-[400px]" style={{ color: themeSettings.colors.text }}>
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2" style={{ color: themeSettings.colors.text }}>
              Error Loading Broadcasts
            </h3>
            <p style={{ color: themeSettings.colors.text }}>Unable to load live broadcasts at this time.</p>
          </div>
        </div>
      </InternalPageRenderer>
    );
  }

  if (!liveScheduledStream && (!broadcasts || broadcasts.length === 0)) {
    return (
      <InternalPageRenderer pagePathname="/live">
        <div className="flex items-center justify-center min-h-[400px]" style={{ color: themeSettings.colors.text }}>
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2" style={{ color: themeSettings.colors.text }}>
              No Live Broadcasts
            </h3>
            <p style={{ color: themeSettings.colors.text }}>There are currently no live broadcasts available.</p>
          </div>
        </div>
      </InternalPageRenderer>
    );
  }

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
        <div className="max-w-7xl mx-auto">

          {/* Scheduled simulive stream — shown when a video is live */}
          {liveScheduledStream && (
            <div className="mb-10">
              <div className="flex items-center gap-3 mb-4">
                <span className="px-2 py-1 rounded-full bg-red-500 text-white text-xs font-bold animate-pulse">● LIVE</span>
                <h2 className="text-xl font-bold" style={{ color: themeSettings.colors.text }}>
                  {liveScheduledStream.title}
                </h2>
              </div>
              <div
                className="overflow-hidden"
                style={{
                  borderRadius: `${themeSettings.cornerRadius}px`,
                  border: `1px solid ${themeSettings.colors.primary}40`,
                  background: "#000",
                }}
              >
                <video
                  src={liveScheduledStream.videoUrl}
                  controls
                  autoPlay
                  playsInline
                  style={{ width: "100%", maxHeight: "70vh", display: "block" }}
                />
              </div>
            </div>
          )}

          {broadcasts && broadcasts.length > 0 && (
            <>
              <div className="mb-8">
                <h1
                  className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2"
                  style={{ color: themeSettings.colors.text }}
                >
                  Live Broadcasts
                </h1>
                <p style={{ color: themeSettings.colors.text }}>Watch live streams and events</p>
              </div>
                  <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {broadcasts.map((broadcast) => {
              const status = getBroadcastStatus(broadcast);

              return (
                <div
                  key={broadcast.id}
                  onClick={() => handleBroadcastClick(broadcast.id)}
                  className="group cursor-pointer overflow-hidden transition-all duration-200 hover:scale-102"
                  style={{
                    backgroundColor: themeSettings.colors.background,
                    borderRadius: `${themeSettings.cornerRadius}px`,
                    boxShadow: `0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)`,
                    border: `1px solid ${themeSettings.colors.primary}30`,
                  }}
                >
                  <div className="relative">
                    <div
                      className="aspect-video flex items-center justify-center relative"
                      style={{
                        background: `linear-gradient(135deg, ${themeSettings.colors.primary}20, ${themeSettings.colors.primary}10)`,
                      }}
                    >
                      {(broadcast.thumbnailUrl || broadcast.generatedThumbnailUrl) && (
                        <img
                          src={broadcast.thumbnailUrl || broadcast.generatedThumbnailUrl}
                          alt={broadcast.title}
                          className="w-full h-full object-cover absolute top-0 left-0"
                        />
                      )}
                      <Play
                        className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 transition-colors group-hover:scale-110 z-10"
                        style={{ color: themeSettings.colors.primary }}
                      />
                    </div>
                    <div
                      className={`absolute top-2 left-2 px-2 py-1 rounded-full text-xs font-semibold ${status.className}`}
                    >
                      {status.text}
                    </div>
                  </div>

                  <div className="p-3 sm:p-4">
                    <h3
                      className="font-semibold mb-2 line-clamp-2 transition-colors group-hover:opacity-80"
                      style={{ color: themeSettings.colors.text }}
                    >
                      {broadcast.title}
                    </h3>

                    <div className="flex items-center text-sm space-x-2">
                      {broadcast.startDate && (
                        <div className="flex items-center" style={{ color: themeSettings.colors.text }}>
                          <Calendar className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                          <span className="text-xs sm:text-sm">{formatDateTime(broadcast.startDate)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
              </div>
            </>
          )}

        </div>
      </div>
    </InternalPageRenderer>
  );
}
