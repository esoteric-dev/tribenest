import { Kysely } from "kysely";

export class StreamPlaylistItemModel {
  constructor(private client: Kysely<any>) {}

  async create(data: {
    playlistId: string;
    title: string;
    videoUrl: string;
    videoFilename: string;
    position: number;
  }) {
    return this.client
      .insertInto("stream_playlist_items" as any)
      .values({
        playlist_id: data.playlistId,
        title: data.title,
        video_url: data.videoUrl,
        video_filename: data.videoFilename,
        position: data.position,
      })
      .returningAll()
      .executeTakeFirst();
  }

  async listByPlaylist(playlistId: string) {
    return this.client
      .selectFrom("stream_playlist_items" as any)
      .where("playlist_id", "=", playlistId)
      .orderBy("position", "asc")
      .selectAll()
      .execute();
  }

  async countByPlaylist(playlistId: string): Promise<number> {
    const result = await this.client
      .selectFrom("stream_playlist_items" as any)
      .where("playlist_id", "=", playlistId)
      .select((eb: any) => eb.fn.countAll().as("count"))
      .executeTakeFirst();
    return Number((result as any)?.count ?? 0);
  }

  async delete(id: string) {
    return this.client
      .deleteFrom("stream_playlist_items" as any)
      .where("id", "=", id)
      .execute();
  }

  async reorder(id: string, position: number) {
    return this.client
      .updateTable("stream_playlist_items" as any)
      .set({ position })
      .where("id", "=", id)
      .execute();
  }
}
