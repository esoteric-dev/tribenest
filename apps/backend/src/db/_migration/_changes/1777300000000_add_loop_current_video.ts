import { Kysely } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable("stream_playlists")
    .addColumn("loop_current_video", "boolean", (col) => col.notNull().defaultTo(false))
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable("stream_playlists")
    .dropColumn("loop_current_video")
    .execute();
}
