import { Kysely } from "kysely";

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
      .insertInto("streamPlaylists" as any)
      .values({
        profileId: data.profileId,
        title: data.title,
        repeatCount: data.repeatCount ?? null,
        scheduledStartAt: data.scheduledStartAt ?? null,
        scheduledEndAt: data.scheduledEndAt ?? null,
        status: "idle",
        currentRepeat: 0,
        currentVideoIndex: 0,
      })
      .returningAll()
      .executeTakeFirst();
  }

  async findById(id: string) {
    return this.client
      .selectFrom("streamPlaylists" as any)
      .where("id", "=", id)
      .selectAll()
      .executeTakeFirst();
  }

  async listByProfile(profileId: string) {
    return this.client
      .selectFrom("streamPlaylists" as any)
      .where("profileId", "=", profileId)
      .orderBy("createdAt", "desc")
      .selectAll()
      .execute();
  }

  async findLiveByProfile(profileId: string) {
    return this.client
      .selectFrom("streamPlaylists" as any)
      .where("profileId", "=", profileId)
      .where("status", "=", "live")
      .selectAll()
      .executeTakeFirst();
  }

  async findScheduledDue() {
    return this.client
      .selectFrom("streamPlaylists" as any)
      .where("status", "=", "idle")
      .where("scheduledStartAt", "<=", new Date())
      .selectAll()
      .execute();
  }

  async findExpiredLive() {
    return this.client
      .selectFrom("streamPlaylists" as any)
      .where("status", "=", "live")
      .where("scheduledEndAt", "is not", null)
      .where("scheduledEndAt", "<=", new Date())
      .selectAll()
      .execute();
  }

  async start(id: string) {
    return this.client
      .updateTable("streamPlaylists" as any)
      .set({
        status: "live",
        currentRepeat: 0,
        currentVideoIndex: 0,
        currentVideoStartedAt: new Date(),
      })
      .where("id", "=", id)
      .returningAll()
      .executeTakeFirst();
  }

  async stop(id: string) {
    return this.client
      .updateTable("streamPlaylists" as any)
      .set({ status: "ended" })
      .where("id", "=", id)
      .returningAll()
      .executeTakeFirst();
  }

  async pause(id: string) {
    return this.client
      .updateTable("streamPlaylists" as any)
      .set({ status: "paused" })
      .where("id", "=", id)
      .returningAll()
      .executeTakeFirst();
  }

  async resume(id: string) {
    return this.client
      .updateTable("streamPlaylists" as any)
      .set({ status: "live", currentVideoStartedAt: new Date() })
      .where("id", "=", id)
      .returningAll()
      .executeTakeFirst();
  }

  async advance(id: string, nextIndex: number, nextRepeat: number, status: string) {
    return this.client
      .updateTable("streamPlaylists" as any)
      .set({
        currentVideoIndex: nextIndex,
        currentRepeat: nextRepeat,
        currentVideoStartedAt: new Date(),
        status,
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
      .updateTable("streamPlaylists" as any)
      .set({
        ...(data.title !== undefined ? { title: data.title } : {}),
        ...(data.repeatCount !== undefined ? { repeatCount: data.repeatCount } : {}),
        ...(data.scheduledStartAt !== undefined ? { scheduledStartAt: data.scheduledStartAt } : {}),
        ...(data.scheduledEndAt !== undefined ? { scheduledEndAt: data.scheduledEndAt } : {}),
      })
      .where("id", "=", id)
      .returningAll()
      .executeTakeFirst();
  }

  async delete(id: string) {
    return this.client
      .deleteFrom("streamPlaylists" as any)
      .where("id", "=", id)
      .execute();
  }
}
