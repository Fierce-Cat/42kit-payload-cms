import { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'
import { sql } from 'drizzle-orm'

export async function up({ payload }: MigrateUpArgs): Promise<void> {
await payload.db.drizzle.execute(sql`

DO $$ BEGIN
 CREATE TYPE "enum_pages_status" AS ENUM('draft', 'published');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 CREATE TYPE "enum__pages_v_version_status" AS ENUM('draft', 'published');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS "pages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" varchar,
	"status" "enum_pages_status",
	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"_status" "enum_pages_status"
);

CREATE TABLE IF NOT EXISTS "pages_locales" (
	"title" varchar,
	"abstract" varchar,
	"content" jsonb,
	"rich_content" jsonb,
	"id" serial PRIMARY KEY NOT NULL,
	"_locale" "_locales" NOT NULL,
	"_parent_id" uuid NOT NULL,
	CONSTRAINT "pages_locales_locale_parent_id_unique" UNIQUE("_locale","_parent_id")
);

CREATE TABLE IF NOT EXISTS "pages_rels" (
	"id" serial PRIMARY KEY NOT NULL,
	"order" integer,
	"parent_id" uuid NOT NULL,
	"path" varchar NOT NULL,
	"users_id" varchar,
	"page_categories_id" uuid,
	"media_id" uuid,
	"content_stats_id" uuid
);

CREATE TABLE IF NOT EXISTS "_pages_v" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"version_slug" varchar,
	"version_status" "enum__pages_v_version_status",
	"version_updated_at" timestamp(3) with time zone,
	"version_created_at" timestamp(3) with time zone,
	"version__status" "enum__pages_v_version_status",
	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"latest" boolean
);

CREATE TABLE IF NOT EXISTS "_pages_v_locales" (
	"version_title" varchar,
	"version_abstract" varchar,
	"version_content" jsonb,
	"version_rich_content" jsonb,
	"id" serial PRIMARY KEY NOT NULL,
	"_locale" "_locales" NOT NULL,
	"_parent_id" uuid NOT NULL,
	CONSTRAINT "_pages_v_locales_locale_parent_id_unique" UNIQUE("_locale","_parent_id")
);

CREATE TABLE IF NOT EXISTS "_pages_v_rels" (
	"id" serial PRIMARY KEY NOT NULL,
	"order" integer,
	"parent_id" uuid NOT NULL,
	"path" varchar NOT NULL,
	"pages_id" uuid,
	"users_id" varchar,
	"page_categories_id" uuid,
	"media_id" uuid,
	"content_stats_id" uuid
);

CREATE TABLE IF NOT EXISTS "page_categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" varchar NOT NULL,
	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "page_categories_locales" (
	"name" varchar NOT NULL,
	"id" serial PRIMARY KEY NOT NULL,
	"_locale" "_locales" NOT NULL,
	"_parent_id" uuid NOT NULL,
	CONSTRAINT "page_categories_locales_locale_parent_id_unique" UNIQUE("_locale","_parent_id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "pages_slug_idx" ON "pages" ("slug");
CREATE INDEX IF NOT EXISTS "pages_created_at_idx" ON "pages" ("created_at");
CREATE INDEX IF NOT EXISTS "pages_rels_order_idx" ON "pages_rels" ("order");
CREATE INDEX IF NOT EXISTS "pages_rels_parent_idx" ON "pages_rels" ("parent_id");
CREATE INDEX IF NOT EXISTS "pages_rels_path_idx" ON "pages_rels" ("path");
CREATE INDEX IF NOT EXISTS "_pages_v_version_version_slug_idx" ON "_pages_v" ("version_slug");
CREATE INDEX IF NOT EXISTS "_pages_v_version_version_created_at_idx" ON "_pages_v" ("version_created_at");
CREATE INDEX IF NOT EXISTS "_pages_v_created_at_idx" ON "_pages_v" ("created_at");
CREATE INDEX IF NOT EXISTS "_pages_v_updated_at_idx" ON "_pages_v" ("updated_at");
CREATE INDEX IF NOT EXISTS "_pages_v_latest_idx" ON "_pages_v" ("latest");
CREATE INDEX IF NOT EXISTS "_pages_v_rels_order_idx" ON "_pages_v_rels" ("order");
CREATE INDEX IF NOT EXISTS "_pages_v_rels_parent_idx" ON "_pages_v_rels" ("parent_id");
CREATE INDEX IF NOT EXISTS "_pages_v_rels_path_idx" ON "_pages_v_rels" ("path");
CREATE UNIQUE INDEX IF NOT EXISTS "page_categories_slug_idx" ON "page_categories" ("slug");
CREATE INDEX IF NOT EXISTS "page_categories_created_at_idx" ON "page_categories" ("created_at");
DO $$ BEGIN
 ALTER TABLE "pages_locales" ADD CONSTRAINT "pages_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "pages"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "pages"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_page_categories_fk" FOREIGN KEY ("page_categories_id") REFERENCES "page_categories"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "media"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_content_stats_fk" FOREIGN KEY ("content_stats_id") REFERENCES "content_stats"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "_pages_v_locales" ADD CONSTRAINT "_pages_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "_pages_v"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "_pages_v"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "pages"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_page_categories_fk" FOREIGN KEY ("page_categories_id") REFERENCES "page_categories"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "media"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_content_stats_fk" FOREIGN KEY ("content_stats_id") REFERENCES "content_stats"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "page_categories_locales" ADD CONSTRAINT "page_categories_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "page_categories"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
`);

};

export async function down({ payload }: MigrateDownArgs): Promise<void> {
await payload.db.drizzle.execute(sql`

DROP TABLE "pages";
DROP TABLE "pages_locales";
DROP TABLE "pages_rels";
DROP TABLE "_pages_v";
DROP TABLE "_pages_v_locales";
DROP TABLE "_pages_v_rels";
DROP TABLE "page_categories";
DROP TABLE "page_categories_locales";`);

};
