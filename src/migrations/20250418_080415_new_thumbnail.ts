import { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'
import { sql } from 'drizzle-orm'

export async function up({ payload }: MigrateUpArgs): Promise<void> {
await payload.db.drizzle.execute(sql`

ALTER TABLE "media" ADD COLUMN "sizes_preload_url" varchar;
ALTER TABLE "media" ADD COLUMN "sizes_preload_width" numeric;
ALTER TABLE "media" ADD COLUMN "sizes_preload_height" numeric;
ALTER TABLE "media" ADD COLUMN "sizes_preload_mime_type" varchar;
ALTER TABLE "media" ADD COLUMN "sizes_preload_filesize" numeric;
ALTER TABLE "media" ADD COLUMN "sizes_preload_filename" varchar;
CREATE INDEX IF NOT EXISTS "media_sizes_preload_sizes_preload_filename_idx" ON "media" ("sizes_preload_filename");`);

};

export async function down({ payload }: MigrateDownArgs): Promise<void> {
await payload.db.drizzle.execute(sql`

DROP INDEX IF EXISTS "media_sizes_preload_sizes_preload_filename_idx";
ALTER TABLE "media" DROP COLUMN IF EXISTS "sizes_preload_url";
ALTER TABLE "media" DROP COLUMN IF EXISTS "sizes_preload_width";
ALTER TABLE "media" DROP COLUMN IF EXISTS "sizes_preload_height";
ALTER TABLE "media" DROP COLUMN IF EXISTS "sizes_preload_mime_type";
ALTER TABLE "media" DROP COLUMN IF EXISTS "sizes_preload_filesize";
ALTER TABLE "media" DROP COLUMN IF EXISTS "sizes_preload_filename";`);

};
