import { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'
import { sql } from 'drizzle-orm'

export async function up({ payload }: MigrateUpArgs): Promise<void> {
await payload.db.drizzle.execute(sql`

ALTER TABLE "events" DROP COLUMN IF EXISTS "content_temp_zh";
ALTER TABLE "_events_v" DROP COLUMN IF EXISTS "version_content_temp_zh";`);

};

export async function down({ payload }: MigrateDownArgs): Promise<void> {
await payload.db.drizzle.execute(sql`

ALTER TABLE "events" ADD COLUMN "content_temp_zh" jsonb;
ALTER TABLE "_events_v" ADD COLUMN "version_content_temp_zh" jsonb;`);

};
