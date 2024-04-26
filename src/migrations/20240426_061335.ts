import { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'
import { sql } from 'drizzle-orm'

export async function up({ payload }: MigrateUpArgs): Promise<void> {
await payload.db.drizzle.execute(sql`

DO $$ BEGIN
 CREATE TYPE "_locales" AS ENUM('en', 'zh');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 CREATE TYPE "enum_users_roles" AS ENUM('admin', 'editor', 'user');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 CREATE TYPE "enum_events_status" AS ENUM('draft', 'published', 'archived', 'deleted');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 CREATE TYPE "enum_events_register_questions_type" AS ENUM('text', 'radio', 'checkbox');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 CREATE TYPE "enum_events_contest_type" AS ENUM('photographyContest', 'racing', 'other');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 CREATE TYPE "enum__events_v_version_status" AS ENUM('draft', 'published', 'archived', 'deleted');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 CREATE TYPE "enum__events_v_version_register_questions_type" AS ENUM('text', 'radio', 'checkbox');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 CREATE TYPE "enum__events_v_version_contest_type" AS ENUM('photographyContest', 'racing', 'other');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 CREATE TYPE "enum_event_participants_register_questions_type" AS ENUM('text', 'radio', 'checkbox');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 CREATE TYPE "enum_event_participants_status" AS ENUM('registered', 'checked-in', 'cancelled');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 CREATE TYPE "enum_event_organizers_role" AS ENUM('host', 'special_guest');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 CREATE TYPE "enum_event_contest_records_status" AS ENUM('submitted', 'published', 'rejected');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 CREATE TYPE "enum_media_license" AS ENUM('RSI', 'CC-BY', 'CC-BY-SA', 'CC-BY-NC', 'CC-BY-NC-SA', 'CC-BY-NC-ND', 'CC0', 'Public Domain', 'All Rights Reserved');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS "users_roles" (
	"order" integer NOT NULL,
	"parent_id" uuid NOT NULL,
	"value" "enum_users_roles",
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL
);

CREATE TABLE IF NOT EXISTS "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"sub" varchar,
	"external_provider" varchar,
	"username" varchar,
	"name" varchar,
	"avatar_url" varchar,
	"rsi_handle" varchar,
	"rsi_verified" boolean,
	"rsi_verified_at" timestamp(3) with time zone,
	"rsi_verification_code" varchar,
	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"email" varchar NOT NULL,
	"reset_password_token" varchar,
	"reset_password_expiration" timestamp(3) with time zone,
	"salt" varchar,
	"hash" varchar,
	"login_attempts" numeric,
	"lock_until" timestamp(3) with time zone
);

CREATE TABLE IF NOT EXISTS "users_rels" (
	"id" serial PRIMARY KEY NOT NULL,
	"order" integer,
	"parent_id" uuid NOT NULL,
	"path" varchar NOT NULL,
	"media_id" uuid
);

CREATE TABLE IF NOT EXISTS "events_register_questions" (
	"_order" integer NOT NULL,
	"_parent_id" uuid NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"question" varchar NOT NULL,
	"type" "enum_events_register_questions_type" NOT NULL,
	"required" boolean
);

CREATE TABLE IF NOT EXISTS "events_score_schema" (
	"_order" integer NOT NULL,
	"_parent_id" uuid NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"min" numeric,
	"max" numeric
);

CREATE TABLE IF NOT EXISTS "events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" varchar NOT NULL,
	"title" varchar NOT NULL,
	"status" "enum_events_status" NOT NULL,
	"summary" varchar NOT NULL,
	"theme_color" varchar,
	"date_started" timestamp(3) with time zone NOT NULL,
	"date_ended" timestamp(3) with time zone NOT NULL,
	"timezone" varchar NOT NULL,
	"content" jsonb,
	"geo_address" varchar,
	"online_url" varchar,
	"num_participants" numeric NOT NULL,
	"num_max_participants" numeric NOT NULL,
	"show_participants" boolean,
	"show_organizers" boolean,
	"is_featured" boolean,
	"is_online" boolean,
	"is_registration_open" boolean,
	"is_contest" boolean,
	"contest_type" "enum_events_contest_type",
	"is_all_records_public" boolean NOT NULL,
	"num_max_attempts" numeric NOT NULL,
	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "events_rels" (
	"id" serial PRIMARY KEY NOT NULL,
	"order" integer,
	"parent_id" uuid NOT NULL,
	"path" varchar NOT NULL,
	"users_id" uuid,
	"event_categories_id" uuid,
	"media_id" uuid,
	"event_organizers_id" uuid
);

CREATE TABLE IF NOT EXISTS "_events_v_version_register_questions" (
	"_order" integer NOT NULL,
	"_parent_id" uuid NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"_uuid" varchar,
	"question" varchar NOT NULL,
	"type" "enum__events_v_version_register_questions_type" NOT NULL,
	"required" boolean
);

CREATE TABLE IF NOT EXISTS "_events_v_version_score_schema" (
	"_order" integer NOT NULL,
	"_parent_id" uuid NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar NOT NULL,
	"min" numeric,
	"max" numeric,
	"_uuid" varchar
);

CREATE TABLE IF NOT EXISTS "_events_v" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"version_slug" varchar NOT NULL,
	"version_title" varchar NOT NULL,
	"version_status" "enum__events_v_version_status" NOT NULL,
	"version_summary" varchar NOT NULL,
	"version_theme_color" varchar,
	"version_date_started" timestamp(3) with time zone NOT NULL,
	"version_date_ended" timestamp(3) with time zone NOT NULL,
	"version_timezone" varchar NOT NULL,
	"version_content" jsonb,
	"version_geo_address" varchar,
	"version_online_url" varchar,
	"version_num_participants" numeric NOT NULL,
	"version_num_max_participants" numeric NOT NULL,
	"version_show_participants" boolean,
	"version_show_organizers" boolean,
	"version_is_featured" boolean,
	"version_is_online" boolean,
	"version_is_registration_open" boolean,
	"version_is_contest" boolean,
	"version_contest_type" "enum__events_v_version_contest_type",
	"version_is_all_records_public" boolean NOT NULL,
	"version_num_max_attempts" numeric NOT NULL,
	"version_updated_at" timestamp(3) with time zone,
	"version_created_at" timestamp(3) with time zone,
	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "_events_v_rels" (
	"id" serial PRIMARY KEY NOT NULL,
	"order" integer,
	"parent_id" uuid NOT NULL,
	"path" varchar NOT NULL,
	"events_id" uuid,
	"users_id" uuid,
	"event_categories_id" uuid,
	"media_id" uuid,
	"event_organizers_id" uuid
);

CREATE TABLE IF NOT EXISTS "event_categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar NOT NULL,
	"slug" varchar NOT NULL,
	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "event_participants_register_questions" (
	"_order" integer NOT NULL,
	"_parent_id" uuid NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"question" varchar NOT NULL,
	"answer" varchar,
	"type" "enum_event_participants_register_questions_type" NOT NULL,
	"required" boolean
);

CREATE TABLE IF NOT EXISTS "event_participants" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"status" "enum_event_participants_status" NOT NULL,
	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "event_participants_rels" (
	"id" serial PRIMARY KEY NOT NULL,
	"order" integer,
	"parent_id" uuid NOT NULL,
	"path" varchar NOT NULL,
	"users_id" uuid,
	"events_id" uuid
);

CREATE TABLE IF NOT EXISTS "event_organizers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"role" "enum_event_organizers_role" NOT NULL,
	"description" varchar,
	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "event_organizers_rels" (
	"id" serial PRIMARY KEY NOT NULL,
	"order" integer,
	"parent_id" uuid NOT NULL,
	"path" varchar NOT NULL,
	"events_id" uuid,
	"users_id" uuid
);

CREATE TABLE IF NOT EXISTS "event_contest_records" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"status" "enum_event_contest_records_status" NOT NULL,
	"is_validated" boolean NOT NULL,
	"is_auto_validated" boolean,
	"validated_at" timestamp(3) with time zone,
	"is_featured" boolean NOT NULL,
	"race_position" numeric NOT NULL,
	"race_time" varchar,
	"race_score" numeric NOT NULL,
	"race_is_scoreable" boolean NOT NULL,
	"race_is_winner" boolean NOT NULL,
	"race_video_bilibili_url" varchar,
	"race_note" varchar,
	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "event_contest_records_rels" (
	"id" serial PRIMARY KEY NOT NULL,
	"order" integer,
	"parent_id" uuid NOT NULL,
	"path" varchar NOT NULL,
	"users_id" uuid,
	"events_id" uuid,
	"media_id" uuid
);

CREATE TABLE IF NOT EXISTS "event_contest_scores_score_info_score_schema" (
	"_order" integer NOT NULL,
	"_parent_id" uuid NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"min" numeric,
	"max" numeric,
	"score" numeric NOT NULL
);

CREATE TABLE IF NOT EXISTS "event_contest_scores" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"score_info_total" numeric NOT NULL,
	"score_info_comment" varchar,
	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "event_contest_scores_rels" (
	"id" serial PRIMARY KEY NOT NULL,
	"order" integer,
	"parent_id" uuid NOT NULL,
	"path" varchar NOT NULL,
	"users_id" uuid,
	"events_id" uuid,
	"event_contest_records_id" uuid
);

CREATE TABLE IF NOT EXISTS "media" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar,
	"original" boolean,
	"credit" varchar,
	"source" varchar,
	"license" "enum_media_license",
	"caption" varchar,
	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"url" varchar,
	"filename" varchar,
	"mime_type" varchar,
	"filesize" numeric,
	"width" numeric,
	"height" numeric,
	"sizes_thumbnail_url" varchar,
	"sizes_thumbnail_width" numeric,
	"sizes_thumbnail_height" numeric,
	"sizes_thumbnail_mime_type" varchar,
	"sizes_thumbnail_filesize" numeric,
	"sizes_thumbnail_filename" varchar,
	"sizes_card_url" varchar,
	"sizes_card_width" numeric,
	"sizes_card_height" numeric,
	"sizes_card_mime_type" varchar,
	"sizes_card_filesize" numeric,
	"sizes_card_filename" varchar,
	"sizes_tablet_url" varchar,
	"sizes_tablet_width" numeric,
	"sizes_tablet_height" numeric,
	"sizes_tablet_mime_type" varchar,
	"sizes_tablet_filesize" numeric,
	"sizes_tablet_filename" varchar,
	"sizes_avatar_url" varchar,
	"sizes_avatar_width" numeric,
	"sizes_avatar_height" numeric,
	"sizes_avatar_mime_type" varchar,
	"sizes_avatar_filesize" numeric,
	"sizes_avatar_filename" varchar
);

CREATE TABLE IF NOT EXISTS "media_rels" (
	"id" serial PRIMARY KEY NOT NULL,
	"order" integer,
	"parent_id" uuid NOT NULL,
	"path" varchar NOT NULL,
	"users_id" uuid
);

CREATE TABLE IF NOT EXISTS "payload_preferences" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"key" varchar,
	"value" jsonb,
	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "payload_preferences_rels" (
	"id" serial PRIMARY KEY NOT NULL,
	"order" integer,
	"parent_id" uuid NOT NULL,
	"path" varchar NOT NULL,
	"users_id" uuid
);

CREATE TABLE IF NOT EXISTS "payload_migrations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar,
	"batch" numeric,
	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "users_roles_order_idx" ON "users_roles" ("order");
CREATE INDEX IF NOT EXISTS "users_roles_parent_idx" ON "users_roles" ("parent_id");
CREATE UNIQUE INDEX IF NOT EXISTS "users_username_idx" ON "users" ("username");
CREATE INDEX IF NOT EXISTS "users_created_at_idx" ON "users" ("created_at");
CREATE UNIQUE INDEX IF NOT EXISTS "users_email_idx" ON "users" ("email");
CREATE INDEX IF NOT EXISTS "users_rels_order_idx" ON "users_rels" ("order");
CREATE INDEX IF NOT EXISTS "users_rels_parent_idx" ON "users_rels" ("parent_id");
CREATE INDEX IF NOT EXISTS "users_rels_path_idx" ON "users_rels" ("path");
CREATE INDEX IF NOT EXISTS "events_register_questions_order_idx" ON "events_register_questions" ("_order");
CREATE INDEX IF NOT EXISTS "events_register_questions_parent_id_idx" ON "events_register_questions" ("_parent_id");
CREATE INDEX IF NOT EXISTS "events_score_schema_order_idx" ON "events_score_schema" ("_order");
CREATE INDEX IF NOT EXISTS "events_score_schema_parent_id_idx" ON "events_score_schema" ("_parent_id");
CREATE UNIQUE INDEX IF NOT EXISTS "events_slug_idx" ON "events" ("slug");
CREATE INDEX IF NOT EXISTS "events_created_at_idx" ON "events" ("created_at");
CREATE INDEX IF NOT EXISTS "events_rels_order_idx" ON "events_rels" ("order");
CREATE INDEX IF NOT EXISTS "events_rels_parent_idx" ON "events_rels" ("parent_id");
CREATE INDEX IF NOT EXISTS "events_rels_path_idx" ON "events_rels" ("path");
CREATE INDEX IF NOT EXISTS "_events_v_version_register_questions_order_idx" ON "_events_v_version_register_questions" ("_order");
CREATE INDEX IF NOT EXISTS "_events_v_version_register_questions_parent_id_idx" ON "_events_v_version_register_questions" ("_parent_id");
CREATE INDEX IF NOT EXISTS "_events_v_version_score_schema_order_idx" ON "_events_v_version_score_schema" ("_order");
CREATE INDEX IF NOT EXISTS "_events_v_version_score_schema_parent_id_idx" ON "_events_v_version_score_schema" ("_parent_id");
CREATE INDEX IF NOT EXISTS "_events_v_version_version_slug_idx" ON "_events_v" ("version_slug");
CREATE INDEX IF NOT EXISTS "_events_v_version_version_created_at_idx" ON "_events_v" ("version_created_at");
CREATE INDEX IF NOT EXISTS "_events_v_created_at_idx" ON "_events_v" ("created_at");
CREATE INDEX IF NOT EXISTS "_events_v_updated_at_idx" ON "_events_v" ("updated_at");
CREATE INDEX IF NOT EXISTS "_events_v_rels_order_idx" ON "_events_v_rels" ("order");
CREATE INDEX IF NOT EXISTS "_events_v_rels_parent_idx" ON "_events_v_rels" ("parent_id");
CREATE INDEX IF NOT EXISTS "_events_v_rels_path_idx" ON "_events_v_rels" ("path");
CREATE UNIQUE INDEX IF NOT EXISTS "event_categories_slug_idx" ON "event_categories" ("slug");
CREATE INDEX IF NOT EXISTS "event_categories_created_at_idx" ON "event_categories" ("created_at");
CREATE INDEX IF NOT EXISTS "event_participants_register_questions_order_idx" ON "event_participants_register_questions" ("_order");
CREATE INDEX IF NOT EXISTS "event_participants_register_questions_parent_id_idx" ON "event_participants_register_questions" ("_parent_id");
CREATE INDEX IF NOT EXISTS "event_participants_created_at_idx" ON "event_participants" ("created_at");
CREATE INDEX IF NOT EXISTS "event_participants_rels_order_idx" ON "event_participants_rels" ("order");
CREATE INDEX IF NOT EXISTS "event_participants_rels_parent_idx" ON "event_participants_rels" ("parent_id");
CREATE INDEX IF NOT EXISTS "event_participants_rels_path_idx" ON "event_participants_rels" ("path");
CREATE INDEX IF NOT EXISTS "event_organizers_created_at_idx" ON "event_organizers" ("created_at");
CREATE INDEX IF NOT EXISTS "event_organizers_rels_order_idx" ON "event_organizers_rels" ("order");
CREATE INDEX IF NOT EXISTS "event_organizers_rels_parent_idx" ON "event_organizers_rels" ("parent_id");
CREATE INDEX IF NOT EXISTS "event_organizers_rels_path_idx" ON "event_organizers_rels" ("path");
CREATE INDEX IF NOT EXISTS "event_contest_records_created_at_idx" ON "event_contest_records" ("created_at");
CREATE INDEX IF NOT EXISTS "event_contest_records_rels_order_idx" ON "event_contest_records_rels" ("order");
CREATE INDEX IF NOT EXISTS "event_contest_records_rels_parent_idx" ON "event_contest_records_rels" ("parent_id");
CREATE INDEX IF NOT EXISTS "event_contest_records_rels_path_idx" ON "event_contest_records_rels" ("path");
CREATE INDEX IF NOT EXISTS "event_contest_scores_score_info_score_schema_order_idx" ON "event_contest_scores_score_info_score_schema" ("_order");
CREATE INDEX IF NOT EXISTS "event_contest_scores_score_info_score_schema_parent_id_idx" ON "event_contest_scores_score_info_score_schema" ("_parent_id");
CREATE INDEX IF NOT EXISTS "event_contest_scores_created_at_idx" ON "event_contest_scores" ("created_at");
CREATE INDEX IF NOT EXISTS "event_contest_scores_rels_order_idx" ON "event_contest_scores_rels" ("order");
CREATE INDEX IF NOT EXISTS "event_contest_scores_rels_parent_idx" ON "event_contest_scores_rels" ("parent_id");
CREATE INDEX IF NOT EXISTS "event_contest_scores_rels_path_idx" ON "event_contest_scores_rels" ("path");
CREATE INDEX IF NOT EXISTS "media_created_at_idx" ON "media" ("created_at");
CREATE UNIQUE INDEX IF NOT EXISTS "media_filename_idx" ON "media" ("filename");
CREATE INDEX IF NOT EXISTS "media_sizes_thumbnail_sizes_thumbnail_filename_idx" ON "media" ("sizes_thumbnail_filename");
CREATE INDEX IF NOT EXISTS "media_sizes_card_sizes_card_filename_idx" ON "media" ("sizes_card_filename");
CREATE INDEX IF NOT EXISTS "media_sizes_tablet_sizes_tablet_filename_idx" ON "media" ("sizes_tablet_filename");
CREATE INDEX IF NOT EXISTS "media_sizes_avatar_sizes_avatar_filename_idx" ON "media" ("sizes_avatar_filename");
CREATE INDEX IF NOT EXISTS "media_rels_order_idx" ON "media_rels" ("order");
CREATE INDEX IF NOT EXISTS "media_rels_parent_idx" ON "media_rels" ("parent_id");
CREATE INDEX IF NOT EXISTS "media_rels_path_idx" ON "media_rels" ("path");
CREATE INDEX IF NOT EXISTS "payload_preferences_key_idx" ON "payload_preferences" ("key");
CREATE INDEX IF NOT EXISTS "payload_preferences_created_at_idx" ON "payload_preferences" ("created_at");
CREATE INDEX IF NOT EXISTS "payload_preferences_rels_order_idx" ON "payload_preferences_rels" ("order");
CREATE INDEX IF NOT EXISTS "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" ("parent_id");
CREATE INDEX IF NOT EXISTS "payload_preferences_rels_path_idx" ON "payload_preferences_rels" ("path");
CREATE INDEX IF NOT EXISTS "payload_migrations_created_at_idx" ON "payload_migrations" ("created_at");
DO $$ BEGIN
 ALTER TABLE "users_roles" ADD CONSTRAINT "users_roles_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "users_rels" ADD CONSTRAINT "users_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "users_rels" ADD CONSTRAINT "users_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "media"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "events_register_questions" ADD CONSTRAINT "events_register_questions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "events"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "events_score_schema" ADD CONSTRAINT "events_score_schema_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "events"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "events_rels" ADD CONSTRAINT "events_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "events"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "events_rels" ADD CONSTRAINT "events_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "events_rels" ADD CONSTRAINT "events_rels_event_categories_fk" FOREIGN KEY ("event_categories_id") REFERENCES "event_categories"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "events_rels" ADD CONSTRAINT "events_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "media"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "events_rels" ADD CONSTRAINT "events_rels_event_organizers_fk" FOREIGN KEY ("event_organizers_id") REFERENCES "event_organizers"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "_events_v_version_register_questions" ADD CONSTRAINT "_events_v_version_register_questions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "_events_v"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "_events_v_version_score_schema" ADD CONSTRAINT "_events_v_version_score_schema_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "_events_v"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "_events_v_rels" ADD CONSTRAINT "_events_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "_events_v"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "_events_v_rels" ADD CONSTRAINT "_events_v_rels_events_fk" FOREIGN KEY ("events_id") REFERENCES "events"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "_events_v_rels" ADD CONSTRAINT "_events_v_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "_events_v_rels" ADD CONSTRAINT "_events_v_rels_event_categories_fk" FOREIGN KEY ("event_categories_id") REFERENCES "event_categories"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "_events_v_rels" ADD CONSTRAINT "_events_v_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "media"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "_events_v_rels" ADD CONSTRAINT "_events_v_rels_event_organizers_fk" FOREIGN KEY ("event_organizers_id") REFERENCES "event_organizers"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "event_participants_register_questions" ADD CONSTRAINT "event_participants_register_questions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "event_participants"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "event_participants_rels" ADD CONSTRAINT "event_participants_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "event_participants"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "event_participants_rels" ADD CONSTRAINT "event_participants_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "event_participants_rels" ADD CONSTRAINT "event_participants_rels_events_fk" FOREIGN KEY ("events_id") REFERENCES "events"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "event_organizers_rels" ADD CONSTRAINT "event_organizers_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "event_organizers"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "event_organizers_rels" ADD CONSTRAINT "event_organizers_rels_events_fk" FOREIGN KEY ("events_id") REFERENCES "events"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "event_organizers_rels" ADD CONSTRAINT "event_organizers_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "event_contest_records_rels" ADD CONSTRAINT "event_contest_records_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "event_contest_records"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "event_contest_records_rels" ADD CONSTRAINT "event_contest_records_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "event_contest_records_rels" ADD CONSTRAINT "event_contest_records_rels_events_fk" FOREIGN KEY ("events_id") REFERENCES "events"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "event_contest_records_rels" ADD CONSTRAINT "event_contest_records_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "media"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "event_contest_scores_score_info_score_schema" ADD CONSTRAINT "event_contest_scores_score_info_score_schema_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "event_contest_scores"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "event_contest_scores_rels" ADD CONSTRAINT "event_contest_scores_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "event_contest_scores"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "event_contest_scores_rels" ADD CONSTRAINT "event_contest_scores_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "event_contest_scores_rels" ADD CONSTRAINT "event_contest_scores_rels_events_fk" FOREIGN KEY ("events_id") REFERENCES "events"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "event_contest_scores_rels" ADD CONSTRAINT "event_contest_scores_rels_event_contest_records_fk" FOREIGN KEY ("event_contest_records_id") REFERENCES "event_contest_records"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "media_rels" ADD CONSTRAINT "media_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "media"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "media_rels" ADD CONSTRAINT "media_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
`);

};

export async function down({ payload }: MigrateDownArgs): Promise<void> {
await payload.db.drizzle.execute(sql`

DROP TABLE "users_roles";
DROP TABLE "users";
DROP TABLE "users_rels";
DROP TABLE "events_register_questions";
DROP TABLE "events_score_schema";
DROP TABLE "events";
DROP TABLE "events_rels";
DROP TABLE "_events_v_version_register_questions";
DROP TABLE "_events_v_version_score_schema";
DROP TABLE "_events_v";
DROP TABLE "_events_v_rels";
DROP TABLE "event_categories";
DROP TABLE "event_participants_register_questions";
DROP TABLE "event_participants";
DROP TABLE "event_participants_rels";
DROP TABLE "event_organizers";
DROP TABLE "event_organizers_rels";
DROP TABLE "event_contest_records";
DROP TABLE "event_contest_records_rels";
DROP TABLE "event_contest_scores_score_info_score_schema";
DROP TABLE "event_contest_scores";
DROP TABLE "event_contest_scores_rels";
DROP TABLE "media";
DROP TABLE "media_rels";
DROP TABLE "payload_preferences";
DROP TABLE "payload_preferences_rels";
DROP TABLE "payload_migrations";`);

};
