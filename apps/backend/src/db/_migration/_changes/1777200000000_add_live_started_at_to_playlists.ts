import { Kysely } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable("stream_playlists")
    .addColumn("live_started_at", "timestamptz")
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable("stream_playlists")
    .dropColumn("live_started_at")
    .execute();
}
