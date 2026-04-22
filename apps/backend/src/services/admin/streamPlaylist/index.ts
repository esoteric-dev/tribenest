import { BaseService, BaseServiceArgs } from "@src/services/baseService";
import { NotFoundError, UnauthorizedError } from "@src/utils/app_error";
import { logger } from "@src/utils/logger";
import { spawn } from "child_process";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import { google } from "googleapis";
import { StreamChannelProvider } from "@src/db/types/stream";
import { GoogleOAuthCredentials, TwitchOAuthCredentials } from "@src/types";
import { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI } from "@src/configuration/secrets";

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
    const videoUrls = items.map((item: any) => item.videoUrl);

    for (const channel of channels) {
      const provider = (channel as any).channelProvider as string;
      try {
        let endpoint: string | null = null;
        if (provider === StreamChannelProvider.CustomRTMP) {
          endpoint = (channel as any).currentEndpoint as string | null;
        } else if (provider === StreamChannelProvider.Youtube) {
          endpoint = await this.getYoutubeRtmpEndpoint(channel as any, title);
        } else if (provider === StreamChannelProvider.Twitch) {
          endpoint = await this.getTwitchRtmpEndpoint(channel as any);
        }
        if (!endpoint) continue;
        logger.info(`Pushing playlist "${title}" to ${provider}`);
        this.spawnFfmpegPlaylist(videoUrls, endpoint);
      } catch (err) {
        logger.error(`Failed to push playlist to channel ${(channel as any).id}`, err);
      }
    }
  }

  private async getYoutubeRtmpEndpoint(channel: any, title: string): Promise<string | null> {
    const credentials = channel.credentials as GoogleOAuthCredentials;
    const decrypted = this.apis.encryption.decryptObject(credentials, ["access_token", "refresh_token"]);

    const oauth2Client = new google.auth.OAuth2(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI);
    oauth2Client.setCredentials(decrypted);

    const youtube = google.youtube({ version: "v3", auth: oauth2Client });

    const broadcast = await youtube.liveBroadcasts.insert({
      part: ["snippet", "contentDetails", "status"],
      requestBody: {
        snippet: { title, scheduledStartTime: new Date().toISOString() },
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
    return `${info.ingestionAddress}/${info.streamName}`;
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

  private spawnFfmpegPlaylist(videoUrls: string[], endpoint: string) {
    const concatContent = videoUrls.map((url) => `file '${url}'`).join("\n");
    const tmpFile = path.join(os.tmpdir(), `playlist-${Date.now()}.txt`);
    fs.writeFileSync(tmpFile, concatContent);

    const proc = spawn(
      "ffmpeg",
      [
        "-re",
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
    }, 10000);
  }

  public async stop(id: string, profileId: string) {
    const playlist = await this.models.StreamPlaylist.findById(id);
    if (!playlist) throw new NotFoundError("Playlist not found");
    if ((playlist as any).profileId !== profileId) throw new UnauthorizedError("Not authorized");
    return this.models.StreamPlaylist.stop(id);
  }

  public async pause(id: string, profileId: string) {
    const playlist = await this.models.StreamPlaylist.findById(id);
    if (!playlist) throw new NotFoundError("Playlist not found");
    if ((playlist as any).profileId !== profileId) throw new UnauthorizedError("Not authorized");
    return this.models.StreamPlaylist.pause(id);
  }

  public async resume(id: string, profileId: string) {
    const playlist = await this.models.StreamPlaylist.findById(id);
    if (!playlist) throw new NotFoundError("Playlist not found");
    if ((playlist as any).profileId !== profileId) throw new UnauthorizedError("Not authorized");
    return this.models.StreamPlaylist.resume(id);
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

    if (nextIndex >= total) {
      const nextRepeat = p.currentRepeat + 1;
      const maxRepeats = p.repeatCount;
      if (maxRepeats !== null && nextRepeat >= maxRepeats) {
        return this.models.StreamPlaylist.stop(playlistId);
      } else {
        return this.models.StreamPlaylist.advance(playlistId, 0, nextRepeat, "live");
      }
    } else {
      return this.models.StreamPlaylist.advance(playlistId, nextIndex, p.currentRepeat, "live");
    }
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
