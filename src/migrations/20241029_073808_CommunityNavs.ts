import { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'
import { sql } from 'drizzle-orm'

export async function up({ payload }: MigrateUpArgs): Promise<void> {
await payload.db.drizzle.execute(sql`

CREATE TABLE IF NOT EXISTS "community_navs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar,
	"slug" varchar NOT NULL,
	"abstract" varchar,
	"description" varchar,
	"link" varchar,
	"is_sponsored" boolean,
	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "community_navs_rels" (
	"id" serial PRIMARY KEY NOT NULL,
	"order" integer,
	"parent_id" uuid NOT NULL,
	"path" varchar NOT NULL,
	"media_id" uuid,
	"community_nav_tags_id" uuid
);

CREATE TABLE IF NOT EXISTS "community_nav_tags" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar NOT NULL,
	"slug" varchar NOT NULL,
	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "community_navs_slug_idx" ON "community_navs" ("slug");
CREATE INDEX IF NOT EXISTS "community_navs_created_at_idx" ON "community_navs" ("created_at");
CREATE INDEX IF NOT EXISTS "community_navs_rels_order_idx" ON "community_navs_rels" ("order");
CREATE INDEX IF NOT EXISTS "community_navs_rels_parent_idx" ON "community_navs_rels" ("parent_id");
CREATE INDEX IF NOT EXISTS "community_navs_rels_path_idx" ON "community_navs_rels" ("path");
CREATE UNIQUE INDEX IF NOT EXISTS "community_nav_tags_slug_idx" ON "community_nav_tags" ("slug");
CREATE INDEX IF NOT EXISTS "community_nav_tags_created_at_idx" ON "community_nav_tags" ("created_at");
DO $$ BEGIN
 ALTER TABLE "community_navs_rels" ADD CONSTRAINT "community_navs_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "community_navs"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "community_navs_rels" ADD CONSTRAINT "community_navs_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "media"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "community_navs_rels" ADD CONSTRAINT "community_navs_rels_community_nav_tags_fk" FOREIGN KEY ("community_nav_tags_id") REFERENCES "community_nav_tags"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
`);

};

export async function down({ payload }: MigrateDownArgs): Promise<void> {
await payload.db.drizzle.execute(sql`

DROP TABLE "community_navs";
DROP TABLE "community_navs_rels";
DROP TABLE "community_nav_tags";`);

};
