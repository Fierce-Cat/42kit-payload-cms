import { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'
import { sql } from 'drizzle-orm'

export async function up({ payload }: MigrateUpArgs): Promise<void> {
await payload.db.drizzle.execute(sql`

DO $$ BEGIN
 CREATE TYPE "enum_content_votes_type" AS ENUM('upvote', 'star');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 CREATE TYPE "enum_content_stats_type" AS ENUM('upvote', 'star');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS "content_votes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" "enum_content_votes_type" NOT NULL,
	"value" numeric NOT NULL,
	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "content_votes_rels" (
	"id" serial PRIMARY KEY NOT NULL,
	"order" integer,
	"parent_id" uuid NOT NULL,
	"path" varchar NOT NULL,
	"users_id" varchar,
	"events_id" uuid
);

CREATE TABLE IF NOT EXISTS "content_stats" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" "enum_content_stats_type" NOT NULL,
	"total_count" numeric NOT NULL,
	"votes_sum" numeric NOT NULL,
	"stars_average" numeric NOT NULL,
	"stars_data" jsonb NOT NULL,
	"stars_weight" jsonb NOT NULL,
	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "content_stats_rels" (
	"id" serial PRIMARY KEY NOT NULL,
	"order" integer,
	"parent_id" uuid NOT NULL,
	"path" varchar NOT NULL,
	"events_id" uuid
);

ALTER TABLE "events_rels" ADD COLUMN "content_stats_id" uuid;
ALTER TABLE "_events_v_rels" ADD COLUMN "content_stats_id" uuid;
CREATE INDEX IF NOT EXISTS "content_votes_created_at_idx" ON "content_votes" ("created_at");
CREATE INDEX IF NOT EXISTS "content_votes_rels_order_idx" ON "content_votes_rels" ("order");
CREATE INDEX IF NOT EXISTS "content_votes_rels_parent_idx" ON "content_votes_rels" ("parent_id");
CREATE INDEX IF NOT EXISTS "content_votes_rels_path_idx" ON "content_votes_rels" ("path");
CREATE INDEX IF NOT EXISTS "content_stats_created_at_idx" ON "content_stats" ("created_at");
CREATE INDEX IF NOT EXISTS "content_stats_rels_order_idx" ON "content_stats_rels" ("order");
CREATE INDEX IF NOT EXISTS "content_stats_rels_parent_idx" ON "content_stats_rels" ("parent_id");
CREATE INDEX IF NOT EXISTS "content_stats_rels_path_idx" ON "content_stats_rels" ("path");
DO $$ BEGIN
 ALTER TABLE "events_rels" ADD CONSTRAINT "events_rels_content_stats_fk" FOREIGN KEY ("content_stats_id") REFERENCES "content_stats"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "_events_v_rels" ADD CONSTRAINT "_events_v_rels_content_stats_fk" FOREIGN KEY ("content_stats_id") REFERENCES "content_stats"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "content_votes_rels" ADD CONSTRAINT "content_votes_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "content_votes"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "content_votes_rels" ADD CONSTRAINT "content_votes_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "content_votes_rels" ADD CONSTRAINT "content_votes_rels_events_fk" FOREIGN KEY ("events_id") REFERENCES "events"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "content_stats_rels" ADD CONSTRAINT "content_stats_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "content_stats"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "content_stats_rels" ADD CONSTRAINT "content_stats_rels_events_fk" FOREIGN KEY ("events_id") REFERENCES "events"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
`);

};

export async function down({ payload }: MigrateDownArgs): Promise<void> {
await payload.db.drizzle.execute(sql`

DROP TABLE "content_votes";
DROP TABLE "content_votes_rels";
DROP TABLE "content_stats";
DROP TABLE "content_stats_rels";
ALTER TABLE "events_rels" DROP CONSTRAINT "events_rels_content_stats_fk";

ALTER TABLE "_events_v_rels" DROP CONSTRAINT "_events_v_rels_content_stats_fk";

ALTER TABLE "events_rels" DROP COLUMN IF EXISTS "content_stats_id";
ALTER TABLE "_events_v_rels" DROP COLUMN IF EXISTS "content_stats_id";`);

};
