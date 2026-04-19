import { BaseService, BaseServiceArgs } from "@src/services/baseService";
import { NotFoundError, UnauthorizedError } from "@src/utils/app_error";
import { spawn } from "child_process";
import { logger } from "@src/utils/logger";

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
      // Push to all connected RTMP channels (fire-and-forget)
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
      const endpoint = (channel as any).currentEndpoint as string | null;
      if (!endpoint) continue;

      logger.info(`Pushing scheduled stream "${title}" to ${(channel as any).channelProvider}: ${endpoint}`);

      // Stream via FFmpeg: read video at real-time speed (-re) and push to RTMP
      const proc = spawn("ffmpeg", [
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
      ], { detached: true, stdio: "ignore" });
      proc.unref();
    }
  }
}
