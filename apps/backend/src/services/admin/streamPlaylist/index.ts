import { BaseService, BaseServiceArgs } from "@src/services/baseService";
import { NotFoundError, UnauthorizedError } from "@src/utils/app_error";
import { logger } from "@src/utils/logger";

export class StreamPlaylistService extends BaseService {
  constructor(args: BaseServiceArgs) {
    super(args);
  }

  public async getPresignedUploadUrl(profileId: string, filename: string) {
    const s3Client = await this.apis.getS3Client(profileId);
    const key = `stream-playlists/${profileId}/${Date.now()}-${filename}`;
    return s3Client.getPresignedUrl(key);
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
    return this.models.StreamPlaylist.start(id);
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
