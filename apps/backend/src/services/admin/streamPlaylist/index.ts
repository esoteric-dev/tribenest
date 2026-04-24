import { BaseService, BaseServiceArgs } from "@src/services/baseService";
import { NotFoundError, UnauthorizedError } from "@src/utils/app_error";
import { logger } from "@src/utils/logger";
import { spawn, ChildProcess } from "child_process";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import { google } from "googleapis";
import { StreamChannelProvider } from "@src/db/types/stream";
import { GoogleOAuthCredentials, TwitchOAuthCredentials } from "@src/types";
import { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI } from "@src/configuration/secrets";

/* ── Module-level process tracking ──────────────────── */

const activeFfmpegProcs = new Map<string, ChildProcess[]>();

function killPlaylistProcs(playlistId: string) {
  const procs = activeFfmpegProcs.get(playlistId) ?? [];
  procs.forEach((p) => { try { p.kill("SIGTERM"); } catch { /* already dead */ } });
  activeFfmpegProcs.delete(playlistId);
}

/* ── Broadcast metadata for live description updates ── */

interface BroadcastMeta {
  provider: string;
  channelId: string;
  externalId: string;          // Twitch broadcasterId
  broadcastId?: string;        // YouTube broadcast ID
  scheduledStartTime?: string; // needed for YouTube snippet update
  channelData: any;            // raw DB channel row (for re-auth)
  profileId: string;
}

// playlistId → metadata for every connected channel
const activeBroadcasts = new Map<string, BroadcastMeta[]>();

/* ── Service ─────────────────────────────────────────── */

export class StreamPlaylistService extends BaseService {
  constructor(args: BaseServiceArgs) {
    super(args);
  }

  public async getPresignedUploadUrl(profileId: string, filename: string) {
    const s3Client = await this.apis.getS3Client(profileId);
    const key = `stream-playlists/${profileId}/${Date.now()}-${filename}`;
    return s3Client.getPresignedUrl(key);
  }

  public async initiateMultipartUpload(profileId: string, filename: string) {
    const s3Client = await this.apis.getS3Client(profileId);
    const key = `stream-playlists/${profileId}/${Date.now()}-${filename}`;
    const uploadId = await s3Client.initiateMultipartUpload(key);
    return { uploadId, key };
  }

  public async getPresignedPartUrl(profileId: string, key: string, uploadId: string, partNumber: number) {
    const s3Client = await this.apis.getS3Client(profileId);
    const presignedUrl = await s3Client.getPresignedPartUrl(key, uploadId, partNumber);
    return { presignedUrl };
  }

  public async completeMultipartUpload(profileId: string, key: string, uploadId: string) {
    const s3Client = await this.apis.getS3Client(profileId);
    const remoteUrl = await s3Client.completeMultipartUpload(key, uploadId);
    return { remoteUrl };
  }

  public async abortMultipartUpload(profileId: string, key: string, uploadId: string) {
    const s3Client = await this.apis.getS3Client(profileId);
    await s3Client.abortMultipartUpload(key, uploadId);
  }

  public async create(data: {
    profileId: string;
    title: string;
    repeatCount?: number | null;
    scheduledStartAt?: string | null;
    scheduledEndAt?: string | null;
  }) {
    return this.models.StreamPlaylist.create({
      profileId: data.profileId,
      title: data.title,
      repeatCount: data.repeatCount ?? null,
      scheduledStartAt: data.scheduledStartAt ? new Date(data.scheduledStartAt) : null,
      scheduledEndAt: data.scheduledEndAt ? new Date(data.scheduledEndAt) : null,
    });
  }

  public async list(profileId: string) {
    const playlists = await this.models.StreamPlaylist.listByProfile(profileId);
    return Promise.all(
      playlists.map(async (p: any) => {
        const items = await this.models.StreamPlaylistItem.listByPlaylist(p.id);
        return { ...p, items };
      }),
    );
  }

  public async getWithItems(id: string, profileId: string) {
    const playlist = await this.models.StreamPlaylist.findById(id);
    if (!playlist) throw new NotFoundError("Playlist not found");
    if ((playlist as any).profileId !== profileId) throw new UnauthorizedError("Not authorized");
    const items = await this.models.StreamPlaylistItem.listByPlaylist(id);
    return { ...playlist, items };
  }

  public async update(id: string, profileId: string, data: {
    title?: string;
    repeatCount?: number | null;
    scheduledStartAt?: string | null;
    scheduledEndAt?: string | null;
  }) {
    const playlist = await this.models.StreamPlaylist.findById(id);
    if (!playlist) throw new NotFoundError("Playlist not found");
    if ((playlist as any).profileId !== profileId) throw new UnauthorizedError("Not authorized");
    return this.models.StreamPlaylist.update(id, {
      title: data.title,
      repeatCount: data.repeatCount,
      scheduledStartAt: data.scheduledStartAt !== undefined
        ? (data.scheduledStartAt ? new Date(data.scheduledStartAt) : null)
        : undefined,
      scheduledEndAt: data.scheduledEndAt !== undefined
        ? (data.scheduledEndAt ? new Date(data.scheduledEndAt) : null)
        : undefined,
    });
  }

  public async delete(id: string, profileId: string) {
    const playlist = await this.models.StreamPlaylist.findById(id);
    if (!playlist) throw new NotFoundError("Playlist not found");
    if ((playlist as any).profileId !== profileId) throw new UnauthorizedError("Not authorized");
    return this.models.StreamPlaylist.delete(id);
  }

  public async addVideo(playlistId: string, profileId: string, data: {
    title: string;
    videoUrl: string;
    videoFilename: string;
    description?: string | null;
  }) {
    const playlist = await this.models.StreamPlaylist.findById(playlistId);
    if (!playlist) throw new NotFoundError("Playlist not found");
    if ((playlist as any).profileId !== profileId) throw new UnauthorizedError("Not authorized");
    const count = await this.models.StreamPlaylistItem.countByPlaylist(playlistId);
    return this.models.StreamPlaylistItem.create({
      playlistId,
      title: data.title,
      videoUrl: data.videoUrl,
      videoFilename: data.videoFilename,
      position: count,
      description: data.description ?? null,
    });
  }

  public async removeVideo(itemId: string, playlistId: string, profileId: string) {
    const playlist = await this.models.StreamPlaylist.findById(playlistId);
    if (!playlist) throw new NotFoundError("Playlist not found");
    if ((playlist as any).profileId !== profileId) throw new UnauthorizedError("Not authorized");
    return this.models.StreamPlaylistItem.delete(itemId);
  }

  public async start(id: string, profileId: string) {
    const playlist = await this.models.StreamPlaylist.findById(id);
    if (!playlist) throw new NotFoundError("Playlist not found");
    if ((playlist as any).profileId !== profileId) throw new UnauthorizedError("Not authorized");
    killPlaylistProcs(id);
    activeBroadcasts.delete(id);
    const result = await this.models.StreamPlaylist.start(id);
    this.pushPlaylistToChannels(id, profileId).catch((err) =>
      logger.error("Failed to push playlist to channels", err),
    );
    return result;
  }

  private async pushPlaylistToChannels(playlistId: string, profileId: string) {
    const channels = await this.models.StreamChannel.find({ profileId } as any);
    if (!channels || channels.length === 0) return;

    const playlist = await this.models.StreamPlaylist.findById(playlistId);
    if (!playlist) return;
    const items = await this.models.StreamPlaylistItem.listByPlaylist(playlistId);
    if (!items.length) return;

    const title = (playlist as any).title;
    const repeatCount: number | null = (playlist as any).repeatCount;
    const videoUrls = items.map((item: any) => item.videoUrl);
    const firstDescription: string = (items[0] as any).description ?? "";

    const procs: ChildProcess[] = [];
    const broadcastMetas: BroadcastMeta[] = [];

    for (const channel of channels) {
      const provider = (channel as any).channelProvider as string;
      try {
        let endpoint: string | null = null;
        let broadcastId: string | undefined;
        let scheduledStartTime: string | undefined;

        if (provider === StreamChannelProvider.CustomRTMP) {
          endpoint = (channel as any).currentEndpoint as string | null;
        } else if (provider === StreamChannelProvider.Youtube) {
          const result = await this.createYoutubeBroadcast(channel as any, title, firstDescription);
          endpoint = result?.endpoint ?? null;
          broadcastId = result?.broadcastId;
          scheduledStartTime = result?.scheduledStartTime;
        } else if (provider === StreamChannelProvider.Twitch) {
          endpoint = await this.getTwitchRtmpEndpoint(channel as any);
        }

        if (!endpoint) {
          logger.warn(`No RTMP endpoint for channel ${(channel as any).id} (${provider}), skipping`);
          continue;
        }

        logger.info(`Pushing playlist "${title}" to ${provider}`);
        const proc = this.spawnFfmpegPlaylist(videoUrls, endpoint, repeatCount);
        procs.push(proc);

        broadcastMetas.push({
          provider,
          channelId: (channel as any).id,
          externalId: (channel as any).externalId ?? "",
          broadcastId,
          scheduledStartTime,
          channelData: channel,
          profileId,
        });
      } catch (err) {
        logger.error(`Failed to push playlist to channel ${(channel as any).id}`, err);
      }
    }

    activeFfmpegProcs.set(playlistId, procs);
    activeBroadcasts.set(playlistId, broadcastMetas);
  }

  /* Creates a YouTube broadcast and returns endpoint + broadcast ID */
  private async createYoutubeBroadcast(channel: any, title: string, description: string): Promise<{ endpoint: string; broadcastId: string; scheduledStartTime: string } | null> {
    const credentials = channel.credentials as GoogleOAuthCredentials;
    const decrypted = this.apis.encryption.decryptObject(credentials, ["access_token", "refresh_token"]);

    const oauth2Client = new google.auth.OAuth2(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI);
    oauth2Client.setCredentials(decrypted);

    const youtube = google.youtube({ version: "v3", auth: oauth2Client });
    const scheduledStartTime = new Date().toISOString();

    const broadcast = await youtube.liveBroadcasts.insert({
      part: ["snippet", "contentDetails", "status"],
      requestBody: {
        snippet: { title, description, scheduledStartTime },
        status: { privacyStatus: "public", selfDeclaredMadeForKids: false },
        contentDetails: { enableAutoStart: true, enableAutoStop: true },
      },
    });

    const stream = await youtube.liveStreams.insert({
      part: ["snippet", "cdn", "contentDetails", "status"],
      requestBody: {
        snippet: { title },
        cdn: { ingestionType: "rtmp", frameRate: "30fps", resolution: "1080p" },
      },
    });

    if (!broadcast.data.id || !stream.data.id || !stream.data.cdn?.ingestionInfo) return null;

    await youtube.liveBroadcasts.bind({
      part: ["id", "contentDetails"],
      id: broadcast.data.id,
      streamId: stream.data.id,
    });

    const info = stream.data.cdn.ingestionInfo;
    return {
      endpoint: `${info.ingestionAddress}/${info.streamName}`,
      broadcastId: broadcast.data.id,
      scheduledStartTime,
    };
  }

  /* Updates description on all connected platforms for the currently playing video */
  private async updatePlatformDescriptions(playlistId: string, videoTitle: string, description: string) {
    const metas = activeBroadcasts.get(playlistId);
    if (!metas || metas.length === 0) return;

    for (const meta of metas) {
      try {
        if (meta.provider === StreamChannelProvider.Youtube && meta.broadcastId) {
          const credentials = (meta.channelData as any).credentials as GoogleOAuthCredentials;
          const decrypted = this.apis.encryption.decryptObject(credentials, ["access_token", "refresh_token"]);
          const oauth2Client = new google.auth.OAuth2(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI);
          oauth2Client.setCredentials(decrypted);
          const youtube = google.youtube({ version: "v3", auth: oauth2Client });
          await youtube.liveBroadcasts.update({
            part: ["snippet"],
            requestBody: {
              id: meta.broadcastId,
              snippet: {
                title: videoTitle,
                description,
                scheduledStartTime: meta.scheduledStartTime ?? new Date().toISOString(),
              },
            },
          });
          logger.info(`Updated YouTube broadcast ${meta.broadcastId} description for "${videoTitle}"`);
        } else if (meta.provider === StreamChannelProvider.Twitch && meta.externalId) {
          const credentials = (meta.channelData as any).credentials as TwitchOAuthCredentials;
          const decrypted = this.apis.encryption.decryptObject(credentials, ["access_token", "refresh_token"]);
          const validated = await this.apis.twitch.validateAndRefreshToken(decrypted as TwitchOAuthCredentials);
          if (validated.credentials) {
            // Twitch has no broadcast description — update stream title with the video title
            await this.apis.twitch.updateChannelInfo({
              credentials: validated.credentials as TwitchOAuthCredentials,
              broadcasterId: meta.externalId,
              title: videoTitle,
            });
            logger.info(`Updated Twitch channel title for broadcaster ${meta.externalId}: "${videoTitle}"`);
          }
        }
      } catch (err) {
        logger.error(`Failed to update description for ${meta.provider} channel ${meta.channelId}`, err);
      }
    }
  }

  private async getTwitchRtmpEndpoint(channel: any): Promise<string | null> {
    const credentials = channel.credentials as TwitchOAuthCredentials;
    const decrypted = this.apis.encryption.decryptObject(credentials, ["access_token", "refresh_token"]);
    const validated = await this.apis.twitch.validateAndRefreshToken(decrypted as TwitchOAuthCredentials);
    if (!validated.credentials) return null;

    if (validated.isRefreshed) {
      await this.models.StreamChannel.updateOne(
        { id: channel.id },
        {
          credentials: JSON.stringify(
            this.apis.encryption.encryptObject(validated.credentials as TwitchOAuthCredentials, [
              "access_token",
              "refresh_token",
            ]),
          ),
        },
      );
    }

    return this.apis.twitch.getIngestUrl({
      credentials: validated.credentials as TwitchOAuthCredentials,
      broadcasterId: channel.externalId,
    });
  }

  private spawnFfmpegPlaylist(videoUrls: string[], endpoint: string, repeatCount: number | null): ChildProcess {
    const concatContent = videoUrls.map((url) => `file '${url}'`).join("\n");
    const tmpFile = path.join(os.tmpdir(), `playlist-${Date.now()}.txt`);
    fs.writeFileSync(tmpFile, concatContent);

    // -stream_loop -1 = infinite, N-1 = play N times total
    const streamLoop = repeatCount === null ? "-1" : String(Math.max(0, repeatCount - 1));

    const proc = spawn(
      "ffmpeg",
      [
        "-re",
        "-stream_loop", streamLoop,
        "-f", "concat",
        "-safe", "0",
        "-protocol_whitelist", "file,http,https,tcp,tls",
        "-i", tmpFile,
        "-c:v", "libx264",
        "-preset", "veryfast",
        "-b:v", "6000k",
        "-maxrate", "6800k",
        "-bufsize", "13600k",
        "-pix_fmt", "yuv420p",
        "-g", "50",
        "-c:a", "aac",
        "-b:a", "160k",
        "-ar", "44100",
        "-f", "flv",
        endpoint,
      ],
      { detached: true, stdio: "ignore" },
    );
    proc.unref();
    setTimeout(() => {
      try { fs.unlinkSync(tmpFile); } catch { /* ignore */ }
    }, 30000);
    return proc;
  }

  public async stop(id: string, profileId: string) {
    const playlist = await this.models.StreamPlaylist.findById(id);
    if (!playlist) throw new NotFoundError("Playlist not found");
    if ((playlist as any).profileId !== profileId) throw new UnauthorizedError("Not authorized");
    killPlaylistProcs(id);
    activeBroadcasts.delete(id);
    return this.models.StreamPlaylist.stop(id);
  }

  public async pause(id: string, profileId: string) {
    const playlist = await this.models.StreamPlaylist.findById(id);
    if (!playlist) throw new NotFoundError("Playlist not found");
    if ((playlist as any).profileId !== profileId) throw new UnauthorizedError("Not authorized");
    killPlaylistProcs(id);
    return this.models.StreamPlaylist.pause(id);
  }

  public async resume(id: string, profileId: string) {
    const playlist = await this.models.StreamPlaylist.findById(id);
    if (!playlist) throw new NotFoundError("Playlist not found");
    if ((playlist as any).profileId !== profileId) throw new UnauthorizedError("Not authorized");
    activeBroadcasts.delete(id);
    const result = await this.models.StreamPlaylist.resume(id);
    this.pushPlaylistToChannels(id, profileId).catch((err) =>
      logger.error("Failed to restart playlist FFmpeg on resume", err),
    );
    return result;
  }

  public async advance(id: string, profileId: string) {
    const playlist = await this.models.StreamPlaylist.findById(id);
    if (!playlist) throw new NotFoundError("Playlist not found");
    if ((playlist as any).profileId !== profileId) throw new UnauthorizedError("Not authorized");
    const p = playlist as any;
    if (p.status !== "live") return playlist;

    const items = await this.models.StreamPlaylistItem.listByPlaylist(id);
    const total = items.length;
    if (total === 0) return this.models.StreamPlaylist.stop(id);

    const nextIndex = p.currentVideoIndex + 1;

    if (nextIndex >= total) {
      const nextRepeat = p.currentRepeat + 1;
      const maxRepeats = p.repeatCount;
      if (maxRepeats !== null && nextRepeat >= maxRepeats) {
        return this.models.StreamPlaylist.stop(id);
      } else {
        return this.models.StreamPlaylist.advance(id, 0, nextRepeat, "live");
      }
    } else {
      return this.models.StreamPlaylist.advance(id, nextIndex, p.currentRepeat, "live");
    }
  }

  public async advancePublic(playlistId: string, expectedIndex?: number) {
    const playlist = await this.models.StreamPlaylist.findById(playlistId);
    if (!playlist) return null;
    const p = playlist as any;
    if (p.status !== "live") return playlist;

    if (expectedIndex !== undefined && p.currentVideoIndex !== expectedIndex) {
      return playlist;
    }

    const items = await this.models.StreamPlaylistItem.listByPlaylist(playlistId);
    const total = items.length;
    if (total === 0) return this.models.StreamPlaylist.stop(playlistId);

    const nextIndex = p.currentVideoIndex + 1;
    let result: any;

    if (nextIndex >= total) {
      const nextRepeat = p.currentRepeat + 1;
      const maxRepeats = p.repeatCount;
      if (maxRepeats !== null && nextRepeat >= maxRepeats) {
        result = await this.models.StreamPlaylist.stop(playlistId);
      } else {
        result = await this.models.StreamPlaylist.advance(playlistId, 0, nextRepeat, "live");
        // Push description for the first video (we wrapped around)
        const nextItem = items[0] as any;
        if (nextItem) {
          this.updatePlatformDescriptions(playlistId, nextItem.title, nextItem.description ?? "").catch(() => {});
        }
      }
    } else {
      result = await this.models.StreamPlaylist.advance(playlistId, nextIndex, p.currentRepeat, "live");
      // Push description for the upcoming video
      const nextItem = items[nextIndex] as any;
      if (nextItem) {
        this.updatePlatformDescriptions(playlistId, nextItem.title, nextItem.description ?? "").catch(() => {});
      }
    }

    return result;
  }

  public async getLiveForProfile(profileId: string) {
    const playlist = await this.models.StreamPlaylist.findLiveByProfile(profileId);
    if (!playlist) return null;
    const p = playlist as any;
    const items = await this.models.StreamPlaylistItem.listByPlaylist(p.id);
    const currentItem = items[p.currentVideoIndex] ?? items[0] ?? null;
    return {
      id: p.id,
      title: p.title,
      status: p.status,
      repeatCount: p.repeatCount,
      currentRepeat: p.currentRepeat,
      currentVideoIndex: p.currentVideoIndex,
      currentVideoStartedAt: p.currentVideoStartedAt,
      items,
      currentItem,
      totalVideos: items.length,
    };
  }

  public async activateDuePlaylists() {
    const due = await this.models.StreamPlaylist.findScheduledDue();
    for (const p of due) {
      await this.models.StreamPlaylist.start((p as any).id);
      logger.info(`Auto-started stream playlist ${(p as any).id}`);
    }
    return due.length;
  }

  public async stopExpiredPlaylists() {
    const expired = await this.models.StreamPlaylist.findExpiredLive();
    for (const p of expired) {
      await this.models.StreamPlaylist.stop((p as any).id);
      logger.info(`Auto-stopped expired stream playlist ${(p as any).id}`);
    }
    return expired.length;
  }
}
