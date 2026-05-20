import { tables } from "@src/db/constants/tables";
import { Kysely, sql } from "kysely";
import { addDefaultColumns, addUpdateUpdatedAtTrigger } from "../utils";

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable(tables.scheduled_streams)
    .addColumn("id", "uuid", (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn("profile_id", "uuid", (col) => col.notNull().references(`${tables.profiles}.id`).onDelete("cascade"))
    .addColumn("title", "text", (col) => col.notNull())
    .addColumn("video_url", "text", (col) => col.notNull())
    .addColumn("video_filename", "text", (col) => col.notNull())
    .addColumn("scheduled_at", "timestamptz", (col) => col.notNull())
    .addColumn("status", "text", (col) => col.notNull().defaultTo("pending"))
    .$call(addDefaultColumns)
    .execute();

  await addUpdateUpdatedAtTrigger(db, tables.scheduled_streams);
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable(tables.scheduled_streams).execute();
}
