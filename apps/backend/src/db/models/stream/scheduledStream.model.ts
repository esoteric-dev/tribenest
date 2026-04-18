import { Kysely } from "kysely";
import BaseModel from "../baseModel";
import { DB } from "../../types";

export type IScheduledStream = DB["scheduledStreams"];
export type ScheduledStreamStatus = "pending" | "live" | "ended";

export class ScheduledStreamModel extends BaseModel<"scheduledStreams", "id"> {
  constructor(client: Kysely<DB>) {
    super(client, "scheduledStreams", "id");
  }

  public async listByProfile(profileId: string) {
    return this.client
      .selectFrom("scheduledStreams")
      .where("profileId", "=", profileId)
      .orderBy("scheduledAt", "asc")
      .selectAll()
      .execute();
  }

  public async findPendingDue() {
    return this.client
      .selectFrom("scheduledStreams")
      .where("status", "=", "pending")
      .where("scheduledAt", "<=", new Date())
      .selectAll()
      .execute();
  }

  public async findLiveByProfile(profileId: string) {
    return this.client
      .selectFrom("scheduledStreams")
      .where("profileId", "=", profileId)
      .where("status", "=", "live")
      .orderBy("scheduledAt", "desc")
      .selectAll()
      .executeTakeFirst();
  }

  public async updateStatus(id: string, status: ScheduledStreamStatus) {
    return this.client
      .updateTable("scheduledStreams")
      .set({ status, updatedAt: new Date() })
      .where("id", "=", id)
      .execute();
  }

  public async create(data: {
    profileId: string;
    title: string;
    videoUrl: string;
    videoFilename: string;
    scheduledAt: Date;
    status: string;
  }) {
    return this.insertOne(data as any);
  }
}
