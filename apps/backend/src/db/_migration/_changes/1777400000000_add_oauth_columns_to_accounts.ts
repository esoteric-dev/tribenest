import { tables } from "@src/db/constants/tables";
import { Kysely } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable(tables.accounts)
    .addColumn("firebase_uid", "varchar(255)", (col) => col.unique())
    .addColumn("twitch_id", "varchar(255)", (col) => col.unique())
    .addColumn("twitch_access_token", "text")
    .addColumn("twitch_refresh_token", "text")
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable(tables.accounts)
    .dropColumn("firebase_uid")
    .dropColumn("twitch_id")
    .dropColumn("twitch_access_token")
    .dropColumn("twitch_refresh_token")
    .execute();
}
