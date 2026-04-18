import { BaseService, BaseServiceArgs } from "@src/services/baseService";
import { NotFoundError, UnauthorizedError } from "@src/utils/app_error";

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
    }
    return due.length;
  }

  public async getLiveStream(profileId: string) {
    return this.models.ScheduledStream.findLiveByProfile(profileId);
  }
}
