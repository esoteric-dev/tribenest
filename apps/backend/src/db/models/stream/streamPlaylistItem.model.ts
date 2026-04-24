import { Kysely } from "kysely";

export class StreamPlaylistItemModel {
  constructor(private client: Kysely<any>) {}

  async create(data: {
    playlistId: string;
    title: string;
    videoUrl: string;
    videoFilename: string;
    position: number;
    description?: string | null;
  }) {
    return this.client
      .insertInto("streamPlaylistItems" as any)
      .values({
        playlistId: data.playlistId,
        title: data.title,
        videoUrl: data.videoUrl,
        videoFilename: data.videoFilename,
        position: data.position,
        description: data.description ?? null,
      })
      .returningAll()
      .executeTakeFirst();
  }

  async listByPlaylist(playlistId: string) {
    return this.client
      .selectFrom("streamPlaylistItems" as any)
      .where("playlistId", "=", playlistId)
      .orderBy("position", "asc")
      .selectAll()
      .execute();
  }

  async countByPlaylist(playlistId: string): Promise<number> {
    const result = await this.client
      .selectFrom("streamPlaylistItems" as any)
      .where("playlistId", "=", playlistId)
      .select((eb: any) => eb.fn.countAll().as("count"))
      .executeTakeFirst();
    return Number((result as any)?.count ?? 0);
  }

  async delete(id: string) {
    return this.client
      .deleteFrom("streamPlaylistItems" as any)
      .where("id", "=", id)
      .execute();
  }

  async reorder(id: string, position: number) {
    return this.client
      .updateTable("streamPlaylistItems" as any)
      .set({ position })
      .where("id", "=", id)
      .execute();
  }
}
