import { Kysely } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable("stream_playlist_items")
    .addColumn("description", "text")
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable("stream_playlist_items")
    .dropColumn("description")
    .execute();
}
