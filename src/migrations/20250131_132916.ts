import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   DO $$ BEGIN
   CREATE TYPE "payload"."_locales" AS ENUM('en', 'hu');
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   CREATE TYPE "payload"."enum_buildings_status" AS ENUM('draft', 'published');
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   CREATE TYPE "payload"."enum__buildings_v_version_status" AS ENUM('draft', 'published');
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   CREATE TYPE "payload"."enum__buildings_v_published_locale" AS ENUM('en', 'hu');
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   CREATE TYPE "payload"."enum_building_types_status" AS ENUM('draft', 'published');
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   CREATE TYPE "payload"."enum__building_types_v_version_status" AS ENUM('draft', 'published');
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   CREATE TYPE "payload"."enum__building_types_v_published_locale" AS ENUM('en', 'hu');
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   CREATE TYPE "payload"."enum_countries_status" AS ENUM('draft', 'published');
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   CREATE TYPE "payload"."enum__countries_v_version_status" AS ENUM('draft', 'published');
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   CREATE TYPE "payload"."enum__countries_v_published_locale" AS ENUM('en', 'hu');
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   CREATE TYPE "payload"."enum_regions_status" AS ENUM('draft', 'published');
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   CREATE TYPE "payload"."enum__regions_v_version_status" AS ENUM('draft', 'published');
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   CREATE TYPE "payload"."enum__regions_v_published_locale" AS ENUM('en', 'hu');
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   CREATE TYPE "payload"."enum_counties_status" AS ENUM('draft', 'published');
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   CREATE TYPE "payload"."enum__counties_v_version_status" AS ENUM('draft', 'published');
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   CREATE TYPE "payload"."enum__counties_v_published_locale" AS ENUM('en', 'hu');
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   CREATE TYPE "payload"."enum_cities_status" AS ENUM('draft', 'published');
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   CREATE TYPE "payload"."enum__cities_v_version_status" AS ENUM('draft', 'published');
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   CREATE TYPE "payload"."enum__cities_v_published_locale" AS ENUM('en', 'hu');
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   CREATE TYPE "payload"."enum_youtube_links_language" AS ENUM('en', 'hu');
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   CREATE TYPE "payload"."enum_youtube_links_status" AS ENUM('draft', 'published');
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   CREATE TYPE "payload"."enum__youtube_links_v_version_language" AS ENUM('en', 'hu');
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   CREATE TYPE "payload"."enum__youtube_links_v_version_status" AS ENUM('draft', 'published');
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   CREATE TYPE "payload"."enum__youtube_links_v_published_locale" AS ENUM('en', 'hu');
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   CREATE TYPE "payload"."enum_users_role" AS ENUM('admin', 'moderator');
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   CREATE TYPE "payload"."enum_building_suggestions_field" AS ENUM('name', 'summary', 'history', 'style', 'presentDay', 'famousResidents', 'renovation');
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  CREATE TABLE IF NOT EXISTS "payload"."buildings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"building_type_id" integer,
  	"featured_image_id" integer,
  	"position" geometry(Point),
  	"country_id" varchar,
  	"county_id" integer,
  	"city_id" integer,
  	"creator_name" varchar,
  	"creator_email" varchar,
  	"suggestions_count" numeric DEFAULT 0,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "payload"."enum_buildings_status" DEFAULT 'draft'
  );
  
  CREATE TABLE IF NOT EXISTS "payload"."buildings_locales" (
  	"name" varchar,
  	"slug" varchar,
  	"summary" varchar,
  	"history" varchar,
  	"style" varchar,
  	"present_day" varchar,
  	"famous_residents" varchar,
  	"renovation" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "payload"."_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "payload"."buildings_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"buildings_media_id" integer
  );
  
  CREATE TABLE IF NOT EXISTS "payload"."_buildings_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_building_type_id" integer,
  	"version_featured_image_id" integer,
  	"version_position" geometry(Point),
  	"version_country_id" varchar,
  	"version_county_id" integer,
  	"version_city_id" integer,
  	"version_creator_name" varchar,
  	"version_creator_email" varchar,
  	"version_suggestions_count" numeric DEFAULT 0,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "payload"."enum__buildings_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "payload"."enum__buildings_v_published_locale",
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE IF NOT EXISTS "payload"."_buildings_v_locales" (
  	"version_name" varchar,
  	"version_slug" varchar,
  	"version_summary" varchar,
  	"version_history" varchar,
  	"version_style" varchar,
  	"version_present_day" varchar,
  	"version_famous_residents" varchar,
  	"version_renovation" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "payload"."_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "payload"."_buildings_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"buildings_media_id" integer
  );
  
  CREATE TABLE IF NOT EXISTS "payload"."buildings_media" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"alt" varchar,
  	"prefix" varchar DEFAULT 'building',
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric,
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
  	"sizes_card_filename" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "payload"."building_types" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "payload"."enum_building_types_status" DEFAULT 'draft'
  );
  
  CREATE TABLE IF NOT EXISTS "payload"."building_types_locales" (
  	"name" varchar,
  	"slug" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "payload"."_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "payload"."_building_types_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_image_id" integer,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "payload"."enum__building_types_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "payload"."enum__building_types_v_published_locale",
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE IF NOT EXISTS "payload"."_building_types_v_locales" (
  	"version_name" varchar,
  	"version_slug" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "payload"."_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "payload"."building_types_media" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"alt" varchar,
  	"prefix" varchar DEFAULT 'building-type',
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric,
  	"sizes_thumbnail_url" varchar,
  	"sizes_thumbnail_width" numeric,
  	"sizes_thumbnail_height" numeric,
  	"sizes_thumbnail_mime_type" varchar,
  	"sizes_thumbnail_filesize" numeric,
  	"sizes_thumbnail_filename" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "payload"."countries" (
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "payload"."enum_countries_status" DEFAULT 'draft'
  );
  
  CREATE TABLE IF NOT EXISTS "payload"."countries_locales" (
  	"name" varchar,
  	"slug" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "payload"."_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "payload"."_countries_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" varchar,
  	"version_image_id" integer,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "payload"."enum__countries_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "payload"."enum__countries_v_published_locale",
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE IF NOT EXISTS "payload"."_countries_v_locales" (
  	"version_name" varchar,
  	"version_slug" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "payload"."_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "payload"."countries_media" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"alt" varchar,
  	"prefix" varchar DEFAULT 'country',
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric,
  	"sizes_thumbnail_url" varchar,
  	"sizes_thumbnail_width" numeric,
  	"sizes_thumbnail_height" numeric,
  	"sizes_thumbnail_mime_type" varchar,
  	"sizes_thumbnail_filesize" numeric,
  	"sizes_thumbnail_filename" varchar,
  	"sizes_main_url" varchar,
  	"sizes_main_width" numeric,
  	"sizes_main_height" numeric,
  	"sizes_main_mime_type" varchar,
  	"sizes_main_filesize" numeric,
  	"sizes_main_filename" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "payload"."regions" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"country_id" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "payload"."enum_regions_status" DEFAULT 'draft'
  );
  
  CREATE TABLE IF NOT EXISTS "payload"."regions_locales" (
  	"name" varchar,
  	"slug" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "payload"."_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "payload"."_regions_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_country_id" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "payload"."enum__regions_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "payload"."enum__regions_v_published_locale",
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE IF NOT EXISTS "payload"."_regions_v_locales" (
  	"version_name" varchar,
  	"version_slug" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "payload"."_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "payload"."counties" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"position" geometry(Point),
  	"country_id" varchar,
  	"region_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "payload"."enum_counties_status" DEFAULT 'draft'
  );
  
  CREATE TABLE IF NOT EXISTS "payload"."counties_locales" (
  	"name" varchar,
  	"slug" varchar,
  	"description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "payload"."_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "payload"."_counties_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_position" geometry(Point),
  	"version_country_id" varchar,
  	"version_region_id" integer,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "payload"."enum__counties_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "payload"."enum__counties_v_published_locale",
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE IF NOT EXISTS "payload"."_counties_v_locales" (
  	"version_name" varchar,
  	"version_slug" varchar,
  	"version_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "payload"."_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "payload"."cities" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"position" geometry(Point),
  	"country_id" varchar,
  	"county_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "payload"."enum_cities_status" DEFAULT 'draft'
  );
  
  CREATE TABLE IF NOT EXISTS "payload"."cities_locales" (
  	"name" varchar,
  	"slug" varchar,
  	"description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "payload"."_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "payload"."_cities_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_position" geometry(Point),
  	"version_country_id" varchar,
  	"version_county_id" integer,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "payload"."enum__cities_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "payload"."enum__cities_v_published_locale",
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE IF NOT EXISTS "payload"."_cities_v_locales" (
  	"version_name" varchar,
  	"version_slug" varchar,
  	"version_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "payload"."_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "payload"."youtube_links" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"url" varchar,
  	"sort" numeric,
  	"language" "payload"."enum_youtube_links_language",
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "payload"."enum_youtube_links_status" DEFAULT 'draft'
  );
  
  CREATE TABLE IF NOT EXISTS "payload"."_youtube_links_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_url" varchar,
  	"version_sort" numeric,
  	"version_language" "payload"."enum__youtube_links_v_version_language",
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "payload"."enum__youtube_links_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "payload"."enum__youtube_links_v_published_locale",
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE IF NOT EXISTS "payload"."media" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"alt" varchar,
  	"prefix" varchar DEFAULT 'media',
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric,
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
  	"sizes_card_filename" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "payload"."users" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"role" "payload"."enum_users_role" DEFAULT 'moderator' NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE IF NOT EXISTS "payload"."building_suggestions" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"building_id" integer NOT NULL,
  	"field" "payload"."enum_building_suggestions_field" NOT NULL,
  	"suggested_content" varchar NOT NULL,
  	"submitter_name" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "payload"."search" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"priority" numeric,
  	"building_type_id" integer NOT NULL,
  	"featured_image_id" integer NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "payload"."search_locales" (
  	"title" varchar,
  	"name" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"city" varchar,
  	"country" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "payload"."_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "payload"."search_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"buildings_id" integer
  );
  
  CREATE TABLE IF NOT EXISTS "payload"."payload_locked_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"global_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "payload"."payload_locked_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"buildings_id" integer,
  	"buildings_media_id" integer,
  	"building_types_id" integer,
  	"building_types_media_id" integer,
  	"countries_id" varchar,
  	"countries_media_id" integer,
  	"regions_id" integer,
  	"counties_id" integer,
  	"cities_id" integer,
  	"youtube_links_id" integer,
  	"media_id" integer,
  	"users_id" integer,
  	"building_suggestions_id" integer,
  	"search_id" integer
  );
  
  CREATE TABLE IF NOT EXISTS "payload"."payload_preferences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "payload"."payload_preferences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  CREATE TABLE IF NOT EXISTS "payload"."payload_migrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  DO $$ BEGIN
   ALTER TABLE "payload"."buildings" ADD CONSTRAINT "buildings_building_type_id_building_types_id_fk" FOREIGN KEY ("building_type_id") REFERENCES "payload"."building_types"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload"."buildings" ADD CONSTRAINT "buildings_featured_image_id_buildings_media_id_fk" FOREIGN KEY ("featured_image_id") REFERENCES "payload"."buildings_media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload"."buildings" ADD CONSTRAINT "buildings_country_id_countries_id_fk" FOREIGN KEY ("country_id") REFERENCES "payload"."countries"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload"."buildings" ADD CONSTRAINT "buildings_county_id_counties_id_fk" FOREIGN KEY ("county_id") REFERENCES "payload"."counties"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload"."buildings" ADD CONSTRAINT "buildings_city_id_cities_id_fk" FOREIGN KEY ("city_id") REFERENCES "payload"."cities"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload"."buildings_locales" ADD CONSTRAINT "buildings_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."buildings"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload"."buildings_rels" ADD CONSTRAINT "buildings_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "payload"."buildings"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload"."buildings_rels" ADD CONSTRAINT "buildings_rels_buildings_media_fk" FOREIGN KEY ("buildings_media_id") REFERENCES "payload"."buildings_media"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload"."_buildings_v" ADD CONSTRAINT "_buildings_v_parent_id_buildings_id_fk" FOREIGN KEY ("parent_id") REFERENCES "payload"."buildings"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload"."_buildings_v" ADD CONSTRAINT "_buildings_v_version_building_type_id_building_types_id_fk" FOREIGN KEY ("version_building_type_id") REFERENCES "payload"."building_types"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload"."_buildings_v" ADD CONSTRAINT "_buildings_v_version_featured_image_id_buildings_media_id_fk" FOREIGN KEY ("version_featured_image_id") REFERENCES "payload"."buildings_media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload"."_buildings_v" ADD CONSTRAINT "_buildings_v_version_country_id_countries_id_fk" FOREIGN KEY ("version_country_id") REFERENCES "payload"."countries"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload"."_buildings_v" ADD CONSTRAINT "_buildings_v_version_county_id_counties_id_fk" FOREIGN KEY ("version_county_id") REFERENCES "payload"."counties"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload"."_buildings_v" ADD CONSTRAINT "_buildings_v_version_city_id_cities_id_fk" FOREIGN KEY ("version_city_id") REFERENCES "payload"."cities"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload"."_buildings_v_locales" ADD CONSTRAINT "_buildings_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."_buildings_v"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload"."_buildings_v_rels" ADD CONSTRAINT "_buildings_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "payload"."_buildings_v"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload"."_buildings_v_rels" ADD CONSTRAINT "_buildings_v_rels_buildings_media_fk" FOREIGN KEY ("buildings_media_id") REFERENCES "payload"."buildings_media"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload"."building_types" ADD CONSTRAINT "building_types_image_id_building_types_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "payload"."building_types_media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload"."building_types_locales" ADD CONSTRAINT "building_types_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."building_types"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload"."_building_types_v" ADD CONSTRAINT "_building_types_v_parent_id_building_types_id_fk" FOREIGN KEY ("parent_id") REFERENCES "payload"."building_types"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload"."_building_types_v" ADD CONSTRAINT "_building_types_v_version_image_id_building_types_media_id_fk" FOREIGN KEY ("version_image_id") REFERENCES "payload"."building_types_media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload"."_building_types_v_locales" ADD CONSTRAINT "_building_types_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."_building_types_v"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload"."countries" ADD CONSTRAINT "countries_image_id_countries_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "payload"."countries_media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload"."countries_locales" ADD CONSTRAINT "countries_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."countries"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload"."_countries_v" ADD CONSTRAINT "_countries_v_parent_id_countries_id_fk" FOREIGN KEY ("parent_id") REFERENCES "payload"."countries"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload"."_countries_v" ADD CONSTRAINT "_countries_v_version_image_id_countries_media_id_fk" FOREIGN KEY ("version_image_id") REFERENCES "payload"."countries_media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload"."_countries_v_locales" ADD CONSTRAINT "_countries_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."_countries_v"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload"."regions" ADD CONSTRAINT "regions_country_id_countries_id_fk" FOREIGN KEY ("country_id") REFERENCES "payload"."countries"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload"."regions_locales" ADD CONSTRAINT "regions_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."regions"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload"."_regions_v" ADD CONSTRAINT "_regions_v_parent_id_regions_id_fk" FOREIGN KEY ("parent_id") REFERENCES "payload"."regions"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload"."_regions_v" ADD CONSTRAINT "_regions_v_version_country_id_countries_id_fk" FOREIGN KEY ("version_country_id") REFERENCES "payload"."countries"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload"."_regions_v_locales" ADD CONSTRAINT "_regions_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."_regions_v"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload"."counties" ADD CONSTRAINT "counties_country_id_countries_id_fk" FOREIGN KEY ("country_id") REFERENCES "payload"."countries"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload"."counties" ADD CONSTRAINT "counties_region_id_regions_id_fk" FOREIGN KEY ("region_id") REFERENCES "payload"."regions"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload"."counties_locales" ADD CONSTRAINT "counties_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."counties"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload"."_counties_v" ADD CONSTRAINT "_counties_v_parent_id_counties_id_fk" FOREIGN KEY ("parent_id") REFERENCES "payload"."counties"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload"."_counties_v" ADD CONSTRAINT "_counties_v_version_country_id_countries_id_fk" FOREIGN KEY ("version_country_id") REFERENCES "payload"."countries"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload"."_counties_v" ADD CONSTRAINT "_counties_v_version_region_id_regions_id_fk" FOREIGN KEY ("version_region_id") REFERENCES "payload"."regions"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload"."_counties_v_locales" ADD CONSTRAINT "_counties_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."_counties_v"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload"."cities" ADD CONSTRAINT "cities_country_id_countries_id_fk" FOREIGN KEY ("country_id") REFERENCES "payload"."countries"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload"."cities" ADD CONSTRAINT "cities_county_id_counties_id_fk" FOREIGN KEY ("county_id") REFERENCES "payload"."counties"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload"."cities_locales" ADD CONSTRAINT "cities_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."cities"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload"."_cities_v" ADD CONSTRAINT "_cities_v_parent_id_cities_id_fk" FOREIGN KEY ("parent_id") REFERENCES "payload"."cities"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload"."_cities_v" ADD CONSTRAINT "_cities_v_version_country_id_countries_id_fk" FOREIGN KEY ("version_country_id") REFERENCES "payload"."countries"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload"."_cities_v" ADD CONSTRAINT "_cities_v_version_county_id_counties_id_fk" FOREIGN KEY ("version_county_id") REFERENCES "payload"."counties"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload"."_cities_v_locales" ADD CONSTRAINT "_cities_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."_cities_v"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload"."_youtube_links_v" ADD CONSTRAINT "_youtube_links_v_parent_id_youtube_links_id_fk" FOREIGN KEY ("parent_id") REFERENCES "payload"."youtube_links"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload"."building_suggestions" ADD CONSTRAINT "building_suggestions_building_id_buildings_id_fk" FOREIGN KEY ("building_id") REFERENCES "payload"."buildings"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload"."search" ADD CONSTRAINT "search_building_type_id_building_types_id_fk" FOREIGN KEY ("building_type_id") REFERENCES "payload"."building_types"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload"."search" ADD CONSTRAINT "search_featured_image_id_buildings_media_id_fk" FOREIGN KEY ("featured_image_id") REFERENCES "payload"."buildings_media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload"."search_locales" ADD CONSTRAINT "search_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."search"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload"."search_rels" ADD CONSTRAINT "search_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "payload"."search"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload"."search_rels" ADD CONSTRAINT "search_rels_buildings_fk" FOREIGN KEY ("buildings_id") REFERENCES "payload"."buildings"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "payload"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_buildings_fk" FOREIGN KEY ("buildings_id") REFERENCES "payload"."buildings"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_buildings_media_fk" FOREIGN KEY ("buildings_media_id") REFERENCES "payload"."buildings_media"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_building_types_fk" FOREIGN KEY ("building_types_id") REFERENCES "payload"."building_types"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_building_types_media_fk" FOREIGN KEY ("building_types_media_id") REFERENCES "payload"."building_types_media"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_countries_fk" FOREIGN KEY ("countries_id") REFERENCES "payload"."countries"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_countries_media_fk" FOREIGN KEY ("countries_media_id") REFERENCES "payload"."countries_media"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_regions_fk" FOREIGN KEY ("regions_id") REFERENCES "payload"."regions"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_counties_fk" FOREIGN KEY ("counties_id") REFERENCES "payload"."counties"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_cities_fk" FOREIGN KEY ("cities_id") REFERENCES "payload"."cities"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_youtube_links_fk" FOREIGN KEY ("youtube_links_id") REFERENCES "payload"."youtube_links"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "payload"."media"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "payload"."users"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_building_suggestions_fk" FOREIGN KEY ("building_suggestions_id") REFERENCES "payload"."building_suggestions"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_search_fk" FOREIGN KEY ("search_id") REFERENCES "payload"."search"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload"."payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "payload"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload"."payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "payload"."users"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  CREATE INDEX IF NOT EXISTS "buildings_building_type_idx" ON "payload"."buildings" USING btree ("building_type_id");
  CREATE INDEX IF NOT EXISTS "buildings_featured_image_idx" ON "payload"."buildings" USING btree ("featured_image_id");
  CREATE INDEX IF NOT EXISTS "buildings_country_idx" ON "payload"."buildings" USING btree ("country_id");
  CREATE INDEX IF NOT EXISTS "buildings_county_idx" ON "payload"."buildings" USING btree ("county_id");
  CREATE INDEX IF NOT EXISTS "buildings_city_idx" ON "payload"."buildings" USING btree ("city_id");
  CREATE INDEX IF NOT EXISTS "buildings_updated_at_idx" ON "payload"."buildings" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "buildings_created_at_idx" ON "payload"."buildings" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "buildings__status_idx" ON "payload"."buildings" USING btree ("_status");
  CREATE UNIQUE INDEX IF NOT EXISTS "buildings_locales_locale_parent_id_unique" ON "payload"."buildings_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX IF NOT EXISTS "buildings_rels_order_idx" ON "payload"."buildings_rels" USING btree ("order");
  CREATE INDEX IF NOT EXISTS "buildings_rels_parent_idx" ON "payload"."buildings_rels" USING btree ("parent_id");
  CREATE INDEX IF NOT EXISTS "buildings_rels_path_idx" ON "payload"."buildings_rels" USING btree ("path");
  CREATE INDEX IF NOT EXISTS "buildings_rels_buildings_media_id_idx" ON "payload"."buildings_rels" USING btree ("buildings_media_id");
  CREATE INDEX IF NOT EXISTS "_buildings_v_parent_idx" ON "payload"."_buildings_v" USING btree ("parent_id");
  CREATE INDEX IF NOT EXISTS "_buildings_v_version_version_building_type_idx" ON "payload"."_buildings_v" USING btree ("version_building_type_id");
  CREATE INDEX IF NOT EXISTS "_buildings_v_version_version_featured_image_idx" ON "payload"."_buildings_v" USING btree ("version_featured_image_id");
  CREATE INDEX IF NOT EXISTS "_buildings_v_version_version_country_idx" ON "payload"."_buildings_v" USING btree ("version_country_id");
  CREATE INDEX IF NOT EXISTS "_buildings_v_version_version_county_idx" ON "payload"."_buildings_v" USING btree ("version_county_id");
  CREATE INDEX IF NOT EXISTS "_buildings_v_version_version_city_idx" ON "payload"."_buildings_v" USING btree ("version_city_id");
  CREATE INDEX IF NOT EXISTS "_buildings_v_version_version_updated_at_idx" ON "payload"."_buildings_v" USING btree ("version_updated_at");
  CREATE INDEX IF NOT EXISTS "_buildings_v_version_version_created_at_idx" ON "payload"."_buildings_v" USING btree ("version_created_at");
  CREATE INDEX IF NOT EXISTS "_buildings_v_version_version__status_idx" ON "payload"."_buildings_v" USING btree ("version__status");
  CREATE INDEX IF NOT EXISTS "_buildings_v_created_at_idx" ON "payload"."_buildings_v" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "_buildings_v_updated_at_idx" ON "payload"."_buildings_v" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "_buildings_v_snapshot_idx" ON "payload"."_buildings_v" USING btree ("snapshot");
  CREATE INDEX IF NOT EXISTS "_buildings_v_published_locale_idx" ON "payload"."_buildings_v" USING btree ("published_locale");
  CREATE INDEX IF NOT EXISTS "_buildings_v_latest_idx" ON "payload"."_buildings_v" USING btree ("latest");
  CREATE INDEX IF NOT EXISTS "_buildings_v_autosave_idx" ON "payload"."_buildings_v" USING btree ("autosave");
  CREATE UNIQUE INDEX IF NOT EXISTS "_buildings_v_locales_locale_parent_id_unique" ON "payload"."_buildings_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX IF NOT EXISTS "_buildings_v_rels_order_idx" ON "payload"."_buildings_v_rels" USING btree ("order");
  CREATE INDEX IF NOT EXISTS "_buildings_v_rels_parent_idx" ON "payload"."_buildings_v_rels" USING btree ("parent_id");
  CREATE INDEX IF NOT EXISTS "_buildings_v_rels_path_idx" ON "payload"."_buildings_v_rels" USING btree ("path");
  CREATE INDEX IF NOT EXISTS "_buildings_v_rels_buildings_media_id_idx" ON "payload"."_buildings_v_rels" USING btree ("buildings_media_id");
  CREATE INDEX IF NOT EXISTS "buildings_media_updated_at_idx" ON "payload"."buildings_media" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "buildings_media_created_at_idx" ON "payload"."buildings_media" USING btree ("created_at");
  CREATE UNIQUE INDEX IF NOT EXISTS "buildings_media_filename_idx" ON "payload"."buildings_media" USING btree ("filename");
  CREATE INDEX IF NOT EXISTS "buildings_media_sizes_thumbnail_sizes_thumbnail_filename_idx" ON "payload"."buildings_media" USING btree ("sizes_thumbnail_filename");
  CREATE INDEX IF NOT EXISTS "buildings_media_sizes_card_sizes_card_filename_idx" ON "payload"."buildings_media" USING btree ("sizes_card_filename");
  CREATE INDEX IF NOT EXISTS "building_types_image_idx" ON "payload"."building_types" USING btree ("image_id");
  CREATE INDEX IF NOT EXISTS "building_types_updated_at_idx" ON "payload"."building_types" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "building_types_created_at_idx" ON "payload"."building_types" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "building_types__status_idx" ON "payload"."building_types" USING btree ("_status");
  CREATE UNIQUE INDEX IF NOT EXISTS "building_types_locales_locale_parent_id_unique" ON "payload"."building_types_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX IF NOT EXISTS "_building_types_v_parent_idx" ON "payload"."_building_types_v" USING btree ("parent_id");
  CREATE INDEX IF NOT EXISTS "_building_types_v_version_version_image_idx" ON "payload"."_building_types_v" USING btree ("version_image_id");
  CREATE INDEX IF NOT EXISTS "_building_types_v_version_version_updated_at_idx" ON "payload"."_building_types_v" USING btree ("version_updated_at");
  CREATE INDEX IF NOT EXISTS "_building_types_v_version_version_created_at_idx" ON "payload"."_building_types_v" USING btree ("version_created_at");
  CREATE INDEX IF NOT EXISTS "_building_types_v_version_version__status_idx" ON "payload"."_building_types_v" USING btree ("version__status");
  CREATE INDEX IF NOT EXISTS "_building_types_v_created_at_idx" ON "payload"."_building_types_v" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "_building_types_v_updated_at_idx" ON "payload"."_building_types_v" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "_building_types_v_snapshot_idx" ON "payload"."_building_types_v" USING btree ("snapshot");
  CREATE INDEX IF NOT EXISTS "_building_types_v_published_locale_idx" ON "payload"."_building_types_v" USING btree ("published_locale");
  CREATE INDEX IF NOT EXISTS "_building_types_v_latest_idx" ON "payload"."_building_types_v" USING btree ("latest");
  CREATE INDEX IF NOT EXISTS "_building_types_v_autosave_idx" ON "payload"."_building_types_v" USING btree ("autosave");
  CREATE UNIQUE INDEX IF NOT EXISTS "_building_types_v_locales_locale_parent_id_unique" ON "payload"."_building_types_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX IF NOT EXISTS "building_types_media_updated_at_idx" ON "payload"."building_types_media" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "building_types_media_created_at_idx" ON "payload"."building_types_media" USING btree ("created_at");
  CREATE UNIQUE INDEX IF NOT EXISTS "building_types_media_filename_idx" ON "payload"."building_types_media" USING btree ("filename");
  CREATE INDEX IF NOT EXISTS "building_types_media_sizes_thumbnail_sizes_thumbnail_filename_idx" ON "payload"."building_types_media" USING btree ("sizes_thumbnail_filename");
  CREATE INDEX IF NOT EXISTS "countries_image_idx" ON "payload"."countries" USING btree ("image_id");
  CREATE INDEX IF NOT EXISTS "countries_updated_at_idx" ON "payload"."countries" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "countries_created_at_idx" ON "payload"."countries" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "countries__status_idx" ON "payload"."countries" USING btree ("_status");
  CREATE UNIQUE INDEX IF NOT EXISTS "countries_locales_locale_parent_id_unique" ON "payload"."countries_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX IF NOT EXISTS "_countries_v_parent_idx" ON "payload"."_countries_v" USING btree ("parent_id");
  CREATE INDEX IF NOT EXISTS "_countries_v_version_version_image_idx" ON "payload"."_countries_v" USING btree ("version_image_id");
  CREATE INDEX IF NOT EXISTS "_countries_v_version_version_updated_at_idx" ON "payload"."_countries_v" USING btree ("version_updated_at");
  CREATE INDEX IF NOT EXISTS "_countries_v_version_version_created_at_idx" ON "payload"."_countries_v" USING btree ("version_created_at");
  CREATE INDEX IF NOT EXISTS "_countries_v_version_version__status_idx" ON "payload"."_countries_v" USING btree ("version__status");
  CREATE INDEX IF NOT EXISTS "_countries_v_created_at_idx" ON "payload"."_countries_v" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "_countries_v_updated_at_idx" ON "payload"."_countries_v" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "_countries_v_snapshot_idx" ON "payload"."_countries_v" USING btree ("snapshot");
  CREATE INDEX IF NOT EXISTS "_countries_v_published_locale_idx" ON "payload"."_countries_v" USING btree ("published_locale");
  CREATE INDEX IF NOT EXISTS "_countries_v_latest_idx" ON "payload"."_countries_v" USING btree ("latest");
  CREATE INDEX IF NOT EXISTS "_countries_v_autosave_idx" ON "payload"."_countries_v" USING btree ("autosave");
  CREATE UNIQUE INDEX IF NOT EXISTS "_countries_v_locales_locale_parent_id_unique" ON "payload"."_countries_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX IF NOT EXISTS "countries_media_updated_at_idx" ON "payload"."countries_media" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "countries_media_created_at_idx" ON "payload"."countries_media" USING btree ("created_at");
  CREATE UNIQUE INDEX IF NOT EXISTS "countries_media_filename_idx" ON "payload"."countries_media" USING btree ("filename");
  CREATE INDEX IF NOT EXISTS "countries_media_sizes_thumbnail_sizes_thumbnail_filename_idx" ON "payload"."countries_media" USING btree ("sizes_thumbnail_filename");
  CREATE INDEX IF NOT EXISTS "countries_media_sizes_main_sizes_main_filename_idx" ON "payload"."countries_media" USING btree ("sizes_main_filename");
  CREATE INDEX IF NOT EXISTS "regions_country_idx" ON "payload"."regions" USING btree ("country_id");
  CREATE INDEX IF NOT EXISTS "regions_updated_at_idx" ON "payload"."regions" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "regions_created_at_idx" ON "payload"."regions" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "regions__status_idx" ON "payload"."regions" USING btree ("_status");
  CREATE UNIQUE INDEX IF NOT EXISTS "regions_locales_locale_parent_id_unique" ON "payload"."regions_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX IF NOT EXISTS "_regions_v_parent_idx" ON "payload"."_regions_v" USING btree ("parent_id");
  CREATE INDEX IF NOT EXISTS "_regions_v_version_version_country_idx" ON "payload"."_regions_v" USING btree ("version_country_id");
  CREATE INDEX IF NOT EXISTS "_regions_v_version_version_updated_at_idx" ON "payload"."_regions_v" USING btree ("version_updated_at");
  CREATE INDEX IF NOT EXISTS "_regions_v_version_version_created_at_idx" ON "payload"."_regions_v" USING btree ("version_created_at");
  CREATE INDEX IF NOT EXISTS "_regions_v_version_version__status_idx" ON "payload"."_regions_v" USING btree ("version__status");
  CREATE INDEX IF NOT EXISTS "_regions_v_created_at_idx" ON "payload"."_regions_v" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "_regions_v_updated_at_idx" ON "payload"."_regions_v" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "_regions_v_snapshot_idx" ON "payload"."_regions_v" USING btree ("snapshot");
  CREATE INDEX IF NOT EXISTS "_regions_v_published_locale_idx" ON "payload"."_regions_v" USING btree ("published_locale");
  CREATE INDEX IF NOT EXISTS "_regions_v_latest_idx" ON "payload"."_regions_v" USING btree ("latest");
  CREATE INDEX IF NOT EXISTS "_regions_v_autosave_idx" ON "payload"."_regions_v" USING btree ("autosave");
  CREATE UNIQUE INDEX IF NOT EXISTS "_regions_v_locales_locale_parent_id_unique" ON "payload"."_regions_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX IF NOT EXISTS "counties_country_idx" ON "payload"."counties" USING btree ("country_id");
  CREATE INDEX IF NOT EXISTS "counties_region_idx" ON "payload"."counties" USING btree ("region_id");
  CREATE INDEX IF NOT EXISTS "counties_updated_at_idx" ON "payload"."counties" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "counties_created_at_idx" ON "payload"."counties" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "counties__status_idx" ON "payload"."counties" USING btree ("_status");
  CREATE UNIQUE INDEX IF NOT EXISTS "counties_locales_locale_parent_id_unique" ON "payload"."counties_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX IF NOT EXISTS "_counties_v_parent_idx" ON "payload"."_counties_v" USING btree ("parent_id");
  CREATE INDEX IF NOT EXISTS "_counties_v_version_version_country_idx" ON "payload"."_counties_v" USING btree ("version_country_id");
  CREATE INDEX IF NOT EXISTS "_counties_v_version_version_region_idx" ON "payload"."_counties_v" USING btree ("version_region_id");
  CREATE INDEX IF NOT EXISTS "_counties_v_version_version_updated_at_idx" ON "payload"."_counties_v" USING btree ("version_updated_at");
  CREATE INDEX IF NOT EXISTS "_counties_v_version_version_created_at_idx" ON "payload"."_counties_v" USING btree ("version_created_at");
  CREATE INDEX IF NOT EXISTS "_counties_v_version_version__status_idx" ON "payload"."_counties_v" USING btree ("version__status");
  CREATE INDEX IF NOT EXISTS "_counties_v_created_at_idx" ON "payload"."_counties_v" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "_counties_v_updated_at_idx" ON "payload"."_counties_v" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "_counties_v_snapshot_idx" ON "payload"."_counties_v" USING btree ("snapshot");
  CREATE INDEX IF NOT EXISTS "_counties_v_published_locale_idx" ON "payload"."_counties_v" USING btree ("published_locale");
  CREATE INDEX IF NOT EXISTS "_counties_v_latest_idx" ON "payload"."_counties_v" USING btree ("latest");
  CREATE INDEX IF NOT EXISTS "_counties_v_autosave_idx" ON "payload"."_counties_v" USING btree ("autosave");
  CREATE UNIQUE INDEX IF NOT EXISTS "_counties_v_locales_locale_parent_id_unique" ON "payload"."_counties_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX IF NOT EXISTS "cities_country_idx" ON "payload"."cities" USING btree ("country_id");
  CREATE INDEX IF NOT EXISTS "cities_county_idx" ON "payload"."cities" USING btree ("county_id");
  CREATE INDEX IF NOT EXISTS "cities_updated_at_idx" ON "payload"."cities" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "cities_created_at_idx" ON "payload"."cities" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "cities__status_idx" ON "payload"."cities" USING btree ("_status");
  CREATE UNIQUE INDEX IF NOT EXISTS "cities_locales_locale_parent_id_unique" ON "payload"."cities_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX IF NOT EXISTS "_cities_v_parent_idx" ON "payload"."_cities_v" USING btree ("parent_id");
  CREATE INDEX IF NOT EXISTS "_cities_v_version_version_country_idx" ON "payload"."_cities_v" USING btree ("version_country_id");
  CREATE INDEX IF NOT EXISTS "_cities_v_version_version_county_idx" ON "payload"."_cities_v" USING btree ("version_county_id");
  CREATE INDEX IF NOT EXISTS "_cities_v_version_version_updated_at_idx" ON "payload"."_cities_v" USING btree ("version_updated_at");
  CREATE INDEX IF NOT EXISTS "_cities_v_version_version_created_at_idx" ON "payload"."_cities_v" USING btree ("version_created_at");
  CREATE INDEX IF NOT EXISTS "_cities_v_version_version__status_idx" ON "payload"."_cities_v" USING btree ("version__status");
  CREATE INDEX IF NOT EXISTS "_cities_v_created_at_idx" ON "payload"."_cities_v" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "_cities_v_updated_at_idx" ON "payload"."_cities_v" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "_cities_v_snapshot_idx" ON "payload"."_cities_v" USING btree ("snapshot");
  CREATE INDEX IF NOT EXISTS "_cities_v_published_locale_idx" ON "payload"."_cities_v" USING btree ("published_locale");
  CREATE INDEX IF NOT EXISTS "_cities_v_latest_idx" ON "payload"."_cities_v" USING btree ("latest");
  CREATE INDEX IF NOT EXISTS "_cities_v_autosave_idx" ON "payload"."_cities_v" USING btree ("autosave");
  CREATE UNIQUE INDEX IF NOT EXISTS "_cities_v_locales_locale_parent_id_unique" ON "payload"."_cities_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX IF NOT EXISTS "youtube_links_updated_at_idx" ON "payload"."youtube_links" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "youtube_links_created_at_idx" ON "payload"."youtube_links" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "youtube_links__status_idx" ON "payload"."youtube_links" USING btree ("_status");
  CREATE INDEX IF NOT EXISTS "_youtube_links_v_parent_idx" ON "payload"."_youtube_links_v" USING btree ("parent_id");
  CREATE INDEX IF NOT EXISTS "_youtube_links_v_version_version_updated_at_idx" ON "payload"."_youtube_links_v" USING btree ("version_updated_at");
  CREATE INDEX IF NOT EXISTS "_youtube_links_v_version_version_created_at_idx" ON "payload"."_youtube_links_v" USING btree ("version_created_at");
  CREATE INDEX IF NOT EXISTS "_youtube_links_v_version_version__status_idx" ON "payload"."_youtube_links_v" USING btree ("version__status");
  CREATE INDEX IF NOT EXISTS "_youtube_links_v_created_at_idx" ON "payload"."_youtube_links_v" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "_youtube_links_v_updated_at_idx" ON "payload"."_youtube_links_v" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "_youtube_links_v_snapshot_idx" ON "payload"."_youtube_links_v" USING btree ("snapshot");
  CREATE INDEX IF NOT EXISTS "_youtube_links_v_published_locale_idx" ON "payload"."_youtube_links_v" USING btree ("published_locale");
  CREATE INDEX IF NOT EXISTS "_youtube_links_v_latest_idx" ON "payload"."_youtube_links_v" USING btree ("latest");
  CREATE INDEX IF NOT EXISTS "_youtube_links_v_autosave_idx" ON "payload"."_youtube_links_v" USING btree ("autosave");
  CREATE INDEX IF NOT EXISTS "media_updated_at_idx" ON "payload"."media" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "media_created_at_idx" ON "payload"."media" USING btree ("created_at");
  CREATE UNIQUE INDEX IF NOT EXISTS "media_filename_idx" ON "payload"."media" USING btree ("filename");
  CREATE INDEX IF NOT EXISTS "media_sizes_thumbnail_sizes_thumbnail_filename_idx" ON "payload"."media" USING btree ("sizes_thumbnail_filename");
  CREATE INDEX IF NOT EXISTS "media_sizes_card_sizes_card_filename_idx" ON "payload"."media" USING btree ("sizes_card_filename");
  CREATE INDEX IF NOT EXISTS "users_updated_at_idx" ON "payload"."users" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "users_created_at_idx" ON "payload"."users" USING btree ("created_at");
  CREATE UNIQUE INDEX IF NOT EXISTS "users_email_idx" ON "payload"."users" USING btree ("email");
  CREATE INDEX IF NOT EXISTS "building_suggestions_building_idx" ON "payload"."building_suggestions" USING btree ("building_id");
  CREATE INDEX IF NOT EXISTS "building_suggestions_updated_at_idx" ON "payload"."building_suggestions" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "building_suggestions_created_at_idx" ON "payload"."building_suggestions" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "search_building_type_idx" ON "payload"."search" USING btree ("building_type_id");
  CREATE INDEX IF NOT EXISTS "search_featured_image_idx" ON "payload"."search" USING btree ("featured_image_id");
  CREATE INDEX IF NOT EXISTS "search_updated_at_idx" ON "payload"."search" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "search_created_at_idx" ON "payload"."search" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "search_name_idx" ON "payload"."search_locales" USING btree ("name","_locale");
  CREATE INDEX IF NOT EXISTS "search_city_idx" ON "payload"."search_locales" USING btree ("city","_locale");
  CREATE INDEX IF NOT EXISTS "search_country_idx" ON "payload"."search_locales" USING btree ("country","_locale");
  CREATE UNIQUE INDEX IF NOT EXISTS "search_locales_locale_parent_id_unique" ON "payload"."search_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX IF NOT EXISTS "search_rels_order_idx" ON "payload"."search_rels" USING btree ("order");
  CREATE INDEX IF NOT EXISTS "search_rels_parent_idx" ON "payload"."search_rels" USING btree ("parent_id");
  CREATE INDEX IF NOT EXISTS "search_rels_path_idx" ON "payload"."search_rels" USING btree ("path");
  CREATE INDEX IF NOT EXISTS "search_rels_buildings_id_idx" ON "payload"."search_rels" USING btree ("buildings_id");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_global_slug_idx" ON "payload"."payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_updated_at_idx" ON "payload"."payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_created_at_idx" ON "payload"."payload_locked_documents" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_order_idx" ON "payload"."payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_parent_idx" ON "payload"."payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_path_idx" ON "payload"."payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_buildings_id_idx" ON "payload"."payload_locked_documents_rels" USING btree ("buildings_id");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_buildings_media_id_idx" ON "payload"."payload_locked_documents_rels" USING btree ("buildings_media_id");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_building_types_id_idx" ON "payload"."payload_locked_documents_rels" USING btree ("building_types_id");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_building_types_media_id_idx" ON "payload"."payload_locked_documents_rels" USING btree ("building_types_media_id");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_countries_id_idx" ON "payload"."payload_locked_documents_rels" USING btree ("countries_id");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_countries_media_id_idx" ON "payload"."payload_locked_documents_rels" USING btree ("countries_media_id");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_regions_id_idx" ON "payload"."payload_locked_documents_rels" USING btree ("regions_id");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_counties_id_idx" ON "payload"."payload_locked_documents_rels" USING btree ("counties_id");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_cities_id_idx" ON "payload"."payload_locked_documents_rels" USING btree ("cities_id");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_youtube_links_id_idx" ON "payload"."payload_locked_documents_rels" USING btree ("youtube_links_id");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_media_id_idx" ON "payload"."payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_users_id_idx" ON "payload"."payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_building_suggestions_id_idx" ON "payload"."payload_locked_documents_rels" USING btree ("building_suggestions_id");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_search_id_idx" ON "payload"."payload_locked_documents_rels" USING btree ("search_id");
  CREATE INDEX IF NOT EXISTS "payload_preferences_key_idx" ON "payload"."payload_preferences" USING btree ("key");
  CREATE INDEX IF NOT EXISTS "payload_preferences_updated_at_idx" ON "payload"."payload_preferences" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "payload_preferences_created_at_idx" ON "payload"."payload_preferences" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "payload_preferences_rels_order_idx" ON "payload"."payload_preferences_rels" USING btree ("order");
  CREATE INDEX IF NOT EXISTS "payload_preferences_rels_parent_idx" ON "payload"."payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX IF NOT EXISTS "payload_preferences_rels_path_idx" ON "payload"."payload_preferences_rels" USING btree ("path");
  CREATE INDEX IF NOT EXISTS "payload_preferences_rels_users_id_idx" ON "payload"."payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX IF NOT EXISTS "payload_migrations_updated_at_idx" ON "payload"."payload_migrations" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "payload_migrations_created_at_idx" ON "payload"."payload_migrations" USING btree ("created_at");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "payload"."buildings";
  DROP TABLE "payload"."buildings_locales";
  DROP TABLE "payload"."buildings_rels";
  DROP TABLE "payload"."_buildings_v";
  DROP TABLE "payload"."_buildings_v_locales";
  DROP TABLE "payload"."_buildings_v_rels";
  DROP TABLE "payload"."buildings_media";
  DROP TABLE "payload"."building_types";
  DROP TABLE "payload"."building_types_locales";
  DROP TABLE "payload"."_building_types_v";
  DROP TABLE "payload"."_building_types_v_locales";
  DROP TABLE "payload"."building_types_media";
  DROP TABLE "payload"."countries";
  DROP TABLE "payload"."countries_locales";
  DROP TABLE "payload"."_countries_v";
  DROP TABLE "payload"."_countries_v_locales";
  DROP TABLE "payload"."countries_media";
  DROP TABLE "payload"."regions";
  DROP TABLE "payload"."regions_locales";
  DROP TABLE "payload"."_regions_v";
  DROP TABLE "payload"."_regions_v_locales";
  DROP TABLE "payload"."counties";
  DROP TABLE "payload"."counties_locales";
  DROP TABLE "payload"."_counties_v";
  DROP TABLE "payload"."_counties_v_locales";
  DROP TABLE "payload"."cities";
  DROP TABLE "payload"."cities_locales";
  DROP TABLE "payload"."_cities_v";
  DROP TABLE "payload"."_cities_v_locales";
  DROP TABLE "payload"."youtube_links";
  DROP TABLE "payload"."_youtube_links_v";
  DROP TABLE "payload"."media";
  DROP TABLE "payload"."users";
  DROP TABLE "payload"."building_suggestions";
  DROP TABLE "payload"."search";
  DROP TABLE "payload"."search_locales";
  DROP TABLE "payload"."search_rels";
  DROP TABLE "payload"."payload_locked_documents";
  DROP TABLE "payload"."payload_locked_documents_rels";
  DROP TABLE "payload"."payload_preferences";
  DROP TABLE "payload"."payload_preferences_rels";
  DROP TABLE "payload"."payload_migrations";`)
}
