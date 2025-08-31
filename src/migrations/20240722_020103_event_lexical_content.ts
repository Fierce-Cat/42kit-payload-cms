import { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'
import { sql } from 'drizzle-orm'

export async function up({ payload }: MigrateUpArgs): Promise<void> {
await payload.db.drizzle.execute(sql`

ALTER TABLE "events" ADD COLUMN "rich_content" jsonb;
ALTER TABLE "_events_v" ADD COLUMN "version_rich_content" jsonb;`);

};

export async function down({ payload }: MigrateDownArgs): Promise<void> {
await payload.db.drizzle.execute(sql`

ALTER TABLE "events" DROP COLUMN IF EXISTS "rich_content";
ALTER TABLE "_events_v" DROP COLUMN IF EXISTS "version_rich_content";`);

};
