import { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'
import { sql } from 'drizzle-orm'

export async function up({ payload }: MigrateUpArgs): Promise<void> {
await payload.db.drizzle.execute(sql`

CREATE TABLE IF NOT EXISTS "events_locales" (
	"content" jsonb,
	"id" serial PRIMARY KEY NOT NULL,
	"_locale" "_locales" NOT NULL,
	"_parent_id" uuid NOT NULL,
	CONSTRAINT "events_locales_locale_parent_id_unique" UNIQUE("_locale","_parent_id")
);

CREATE TABLE IF NOT EXISTS "_events_v_locales" (
	"version_content" jsonb,
	"id" serial PRIMARY KEY NOT NULL,
	"_locale" "_locales" NOT NULL,
	"_parent_id" uuid NOT NULL,
	CONSTRAINT "_events_v_locales_locale_parent_id_unique" UNIQUE("_locale","_parent_id")
);

ALTER TABLE "events" RENAME COLUMN "content" TO "content_temp_zh";
ALTER TABLE "_events_v" RENAME COLUMN "version_content" TO "version_content_temp_zh";
DO $$ BEGIN
 ALTER TABLE "events_locales" ADD CONSTRAINT "events_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "events"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "_events_v_locales" ADD CONSTRAINT "_events_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "_events_v"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
`);

const copyContentToLocalizedTable = sql`
INSERT INTO "events_locales" ("content", "_locale", "_parent_id")
SELECT "content_temp_zh", 'zh', "id"
FROM "events"
WHERE "content_temp_zh" IS NOT NULL;
`;

await payload.db.drizzle.execute(copyContentToLocalizedTable);

};

export async function down({ payload }: MigrateDownArgs): Promise<void> {
await payload.db.drizzle.execute(sql`

DROP TABLE "events_locales";
DROP TABLE "_events_v_locales";
ALTER TABLE "events" ADD COLUMN "content" jsonb;
ALTER TABLE "_events_v" ADD COLUMN "version_content" jsonb;
ALTER TABLE "events" DROP COLUMN IF EXISTS "content_temp_zh";
ALTER TABLE "_events_v" DROP COLUMN IF EXISTS "version_content_temp_zh";`);

};
