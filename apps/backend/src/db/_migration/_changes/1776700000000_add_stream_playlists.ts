import { Kysely, sql } from "kysely";
import { addDefaultColumns, addUpdateUpdatedAtTrigger } from "../utils";

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable("stream_playlists")
    .addColumn("id", "uuid", (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn("profile_id", "uuid", (col) => col.notNull().references("profiles.id").onDelete("cascade"))
    .addColumn("title", "text", (col) => col.notNull())
    .addColumn("status", "text", (col) => col.notNull().defaultTo("idle"))
    .addColumn("repeat_count", "integer")
    .addColumn("current_repeat", "integer", (col) => col.notNull().defaultTo(0))
    .addColumn("current_video_index", "integer", (col) => col.notNull().defaultTo(0))
    .addColumn("current_video_started_at", "timestamptz")
    .addColumn("scheduled_start_at", "timestamptz")
    .addColumn("scheduled_end_at", "timestamptz")
    .$call(addDefaultColumns)
    .execute();

  await addUpdateUpdatedAtTrigger(db as any, "stream_playlists");

  await db.schema
    .createTable("stream_playlist_items")
    .addColumn("id", "uuid", (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn("playlist_id", "uuid", (col) => col.notNull().references("stream_playlists.id").onDelete("cascade"))
    .addColumn("title", "text", (col) => col.notNull())
    .addColumn("video_url", "text", (col) => col.notNull())
    .addColumn("video_filename", "text", (col) => col.notNull())
    .addColumn("position", "integer", (col) => col.notNull().defaultTo(0))
    .addColumn("created_at", "timestamptz", (col) => col.notNull().defaultTo(sql`now()`))
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable("stream_playlist_items").execute();
  await db.schema.dropTable("stream_playlists").execute();
}
