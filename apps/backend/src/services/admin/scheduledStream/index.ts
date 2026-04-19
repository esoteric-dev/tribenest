import { BaseService, BaseServiceArgs } from "@src/services/baseService";
import { NotFoundError, UnauthorizedError } from "@src/utils/app_error";
import { spawn } from "child_process";
import { logger } from "@src/utils/logger";
import { StreamChannelProvider } from "@src/db/types/stream";
import { GoogleOAuthCredentials, TwitchOAuthCredentials } from "@src/types";
import { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI } from "@src/configuration/secrets";
import { google } from "googleapis";

export class ScheduledStreamService extends BaseService {
  constructor(args: BaseServiceArgs) {
    super(args);
  }

  public async getPresignedUploadUrl(profileId: string, filename: string) {
    const s3Client = await this.apis.getS3Client(profileId);
    const key = `scheduled-streams/${profileId}/${Date.now()}-${filename}`;
    return s3Client.getPresignedUrl(key);
  }

  public async createWithUrl(input: {
    profileId: string;
    title: string;
    videoFilename: string;
    videoUrl: string;
    scheduledAt: string;
  }) {
    return this.models.ScheduledStream.create({
      profileId: input.profileId,
      title: input.title,
      videoUrl: input.videoUrl,
      videoFilename: input.videoFilename,
      scheduledAt: new Date(input.scheduledAt),
      status: "pending",
    });
  }

  public async list(profileId: string) {
    return this.models.ScheduledStream.listByProfile(profileId);
  }

  public async delete(id: string, profileId: string) {
    const stream = await this.models.ScheduledStream.findById(id);
    if (!stream) throw new NotFoundError("Scheduled stream not found");
    if (stream.profileId !== profileId) throw new UnauthorizedError("Not authorized");
    if (stream.status === "live") throw new UnauthorizedError("Cannot delete a live stream");
    return this.models.ScheduledStream.findByIdAndDelete(id);
  }

  public async activateDueStreams() {
    const due = await this.models.ScheduledStream.findPendingDue();
    for (const stream of due) {
      await this.models.ScheduledStream.updateStatus(stream.id, "live");
      this.pushToChannels(stream.profileId, stream.videoUrl, stream.title).catch((err) =>
        logger.error("Failed to push scheduled stream to channels", err),
      );
    }
    return due.length;
  }

  public async getLiveStream(profileId: string) {
    return this.models.ScheduledStream.findLiveByProfile(profileId);
  }

  private async pushToChannels(profileId: string, videoUrl: string, title: string) {
    const channels = await this.models.StreamChannel.findMany({ profileId } as any);
    if (!channels || channels.length === 0) return;

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

        if (!endpoint) {
          logger.warn(`No RTMP endpoint for channel ${(channel as any).id} (${provider}), skipping`);
          continue;
        }

        logger.info(`Pushing scheduled stream "${title}" to ${provider}: ${endpoint}`);
        this.spawnFfmpeg(videoUrl, endpoint);
      } catch (err) {
        logger.error(`Failed to push to channel ${(channel as any).id} (${provider})`, err);
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

  private spawnFfmpeg(videoUrl: string, endpoint: string) {
    const proc = spawn(
      "ffmpeg",
      [
        "-re",
        "-i", videoUrl,
        "-c:v", "libx264",
        "-preset", "veryfast",
        "-maxrate", "3000k",
        "-bufsize", "6000k",
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
  }
}
