import { Kysely, sql } from "kysely";

export type StreamPlaylistStatus = "idle" | "live" | "paused" | "ended";

export class StreamPlaylistModel {
  constructor(private client: Kysely<any>) {}

  async create(data: {
    profileId: string;
    title: string;
    repeatCount?: number | null;
    scheduledStartAt?: Date | null;
    scheduledEndAt?: Date | null;
  }) {
    return this.client
      .insertInto("stream_playlists" as any)
      .values({
        profile_id: data.profileId,
        title: data.title,
        repeat_count: data.repeatCount ?? null,
        scheduled_start_at: data.scheduledStartAt ?? null,
        scheduled_end_at: data.scheduledEndAt ?? null,
        status: "idle",
        current_repeat: 0,
        current_video_index: 0,
      })
      .returningAll()
      .executeTakeFirst();
  }

  async findById(id: string) {
    return this.client
      .selectFrom("stream_playlists" as any)
      .where("id", "=", id)
      .selectAll()
      .executeTakeFirst();
  }

  async listByProfile(profileId: string) {
    return this.client
      .selectFrom("stream_playlists" as any)
      .where("profile_id", "=", profileId)
      .orderBy("created_at", "desc")
      .selectAll()
      .execute();
  }

  async findLiveByProfile(profileId: string) {
    return this.client
      .selectFrom("stream_playlists" as any)
      .where("profile_id", "=", profileId)
      .where("status", "=", "live")
      .selectAll()
      .executeTakeFirst();
  }

  async findScheduledDue() {
    return this.client
      .selectFrom("stream_playlists" as any)
      .where("status", "=", "idle")
      .where("scheduled_start_at", "<=", new Date())
      .selectAll()
      .execute();
  }

  async findExpiredLive() {
    return this.client
      .selectFrom("stream_playlists" as any)
      .where("status", "=", "live")
      .where("scheduled_end_at", "<=", new Date())
      .whereRef("scheduled_end_at", "is not", sql`null`)
      .selectAll()
      .execute();
  }

  async start(id: string) {
    return this.client
      .updateTable("stream_playlists" as any)
      .set({
        status: "live",
        current_repeat: 0,
        current_video_index: 0,
        current_video_started_at: new Date(),
        updated_at: new Date(),
      })
      .where("id", "=", id)
      .returningAll()
      .executeTakeFirst();
  }

  async stop(id: string) {
    return this.client
      .updateTable("stream_playlists" as any)
      .set({ status: "ended", updated_at: new Date() })
      .where("id", "=", id)
      .returningAll()
      .executeTakeFirst();
  }

  async pause(id: string) {
    return this.client
      .updateTable("stream_playlists" as any)
      .set({ status: "paused", updated_at: new Date() })
      .where("id", "=", id)
      .returningAll()
      .executeTakeFirst();
  }

  async resume(id: string) {
    return this.client
      .updateTable("stream_playlists" as any)
      .set({ status: "live", current_video_started_at: new Date(), updated_at: new Date() })
      .where("id", "=", id)
      .returningAll()
      .executeTakeFirst();
  }

  async advance(id: string, nextIndex: number, nextRepeat: number, status: string) {
    return this.client
      .updateTable("stream_playlists" as any)
      .set({
        current_video_index: nextIndex,
        current_repeat: nextRepeat,
        current_video_started_at: new Date(),
        status,
        updated_at: new Date(),
      })
      .where("id", "=", id)
      .returningAll()
      .executeTakeFirst();
  }

  async update(id: string, data: {
    title?: string;
    repeatCount?: number | null;
    scheduledStartAt?: Date | null;
    scheduledEndAt?: Date | null;
  }) {
    return this.client
      .updateTable("stream_playlists" as any)
      .set({
        ...(data.title !== undefined ? { title: data.title } : {}),
        ...(data.repeatCount !== undefined ? { repeat_count: data.repeatCount } : {}),
        ...(data.scheduledStartAt !== undefined ? { scheduled_start_at: data.scheduledStartAt } : {}),
        ...(data.scheduledEndAt !== undefined ? { scheduled_end_at: data.scheduledEndAt } : {}),
        updated_at: new Date(),
      })
      .where("id", "=", id)
      .returningAll()
      .executeTakeFirst();
  }

  async delete(id: string) {
    return this.client
      .deleteFrom("stream_playlists" as any)
      .where("id", "=", id)
      .execute();
  }
}
