import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE IF NOT EXISTS "payload"."users_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  ALTER TABLE "payload"."buildings_locales" ADD COLUMN "meta_title" varchar;
  ALTER TABLE "payload"."buildings_locales" ADD COLUMN "meta_description" varchar;
  ALTER TABLE "payload"."buildings_locales" ADD COLUMN "meta_image_id" integer;
  ALTER TABLE "payload"."_buildings_v_locales" ADD COLUMN "version_meta_title" varchar;
  ALTER TABLE "payload"."_buildings_v_locales" ADD COLUMN "version_meta_description" varchar;
  ALTER TABLE "payload"."_buildings_v_locales" ADD COLUMN "version_meta_image_id" integer;
  ALTER TABLE "payload"."building_types_locales" ADD COLUMN "meta_title" varchar;
  ALTER TABLE "payload"."building_types_locales" ADD COLUMN "meta_description" varchar;
  ALTER TABLE "payload"."building_types_locales" ADD COLUMN "meta_image_id" integer;
  ALTER TABLE "payload"."_building_types_v_locales" ADD COLUMN "version_meta_title" varchar;
  ALTER TABLE "payload"."_building_types_v_locales" ADD COLUMN "version_meta_description" varchar;
  ALTER TABLE "payload"."_building_types_v_locales" ADD COLUMN "version_meta_image_id" integer;
  ALTER TABLE "payload"."countries_locales" ADD COLUMN "meta_title" varchar;
  ALTER TABLE "payload"."countries_locales" ADD COLUMN "meta_description" varchar;
  ALTER TABLE "payload"."countries_locales" ADD COLUMN "meta_image_id" integer;
  ALTER TABLE "payload"."_countries_v_locales" ADD COLUMN "version_meta_title" varchar;
  ALTER TABLE "payload"."_countries_v_locales" ADD COLUMN "version_meta_description" varchar;
  ALTER TABLE "payload"."_countries_v_locales" ADD COLUMN "version_meta_image_id" integer;
  ALTER TABLE "payload"."cities_locales" ADD COLUMN "meta_title" varchar;
  ALTER TABLE "payload"."cities_locales" ADD COLUMN "meta_description" varchar;
  ALTER TABLE "payload"."cities_locales" ADD COLUMN "meta_image_id" integer;
  ALTER TABLE "payload"."_cities_v_locales" ADD COLUMN "version_meta_title" varchar;
  ALTER TABLE "payload"."_cities_v_locales" ADD COLUMN "version_meta_description" varchar;
  ALTER TABLE "payload"."_cities_v_locales" ADD COLUMN "version_meta_image_id" integer;
  ALTER TABLE "payload"."about_us_locales" ADD COLUMN "meta_title" varchar;
  ALTER TABLE "payload"."about_us_locales" ADD COLUMN "meta_description" varchar;
  ALTER TABLE "payload"."about_us_locales" ADD COLUMN "meta_image_id" integer;
  DO $$ BEGIN
   ALTER TABLE "payload"."users_sessions" ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."users"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  CREATE INDEX IF NOT EXISTS "users_sessions_order_idx" ON "payload"."users_sessions" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "users_sessions_parent_id_idx" ON "payload"."users_sessions" USING btree ("_parent_id");
  DO $$ BEGIN
   ALTER TABLE "payload"."buildings_locales" ADD CONSTRAINT "buildings_locales_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "payload"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload"."_buildings_v_locales" ADD CONSTRAINT "_buildings_v_locales_version_meta_image_id_media_id_fk" FOREIGN KEY ("version_meta_image_id") REFERENCES "payload"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload"."building_types_locales" ADD CONSTRAINT "building_types_locales_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "payload"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload"."_building_types_v_locales" ADD CONSTRAINT "_building_types_v_locales_version_meta_image_id_media_id_fk" FOREIGN KEY ("version_meta_image_id") REFERENCES "payload"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload"."countries_locales" ADD CONSTRAINT "countries_locales_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "payload"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload"."_countries_v_locales" ADD CONSTRAINT "_countries_v_locales_version_meta_image_id_media_id_fk" FOREIGN KEY ("version_meta_image_id") REFERENCES "payload"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload"."cities_locales" ADD CONSTRAINT "cities_locales_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "payload"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload"."_cities_v_locales" ADD CONSTRAINT "_cities_v_locales_version_meta_image_id_media_id_fk" FOREIGN KEY ("version_meta_image_id") REFERENCES "payload"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload"."about_us_locales" ADD CONSTRAINT "about_us_locales_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "payload"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  CREATE INDEX IF NOT EXISTS "buildings_meta_meta_image_idx" ON "payload"."buildings_locales" USING btree ("meta_image_id","_locale");
  CREATE INDEX IF NOT EXISTS "_buildings_v_version_meta_version_meta_image_idx" ON "payload"."_buildings_v_locales" USING btree ("version_meta_image_id","_locale");
  CREATE INDEX IF NOT EXISTS "building_types_meta_meta_image_idx" ON "payload"."building_types_locales" USING btree ("meta_image_id","_locale");
  CREATE INDEX IF NOT EXISTS "_building_types_v_version_meta_version_meta_image_idx" ON "payload"."_building_types_v_locales" USING btree ("version_meta_image_id","_locale");
  CREATE INDEX IF NOT EXISTS "countries_meta_meta_image_idx" ON "payload"."countries_locales" USING btree ("meta_image_id","_locale");
  CREATE INDEX IF NOT EXISTS "_countries_v_version_meta_version_meta_image_idx" ON "payload"."_countries_v_locales" USING btree ("version_meta_image_id","_locale");
  CREATE INDEX IF NOT EXISTS "cities_meta_meta_image_idx" ON "payload"."cities_locales" USING btree ("meta_image_id","_locale");
  CREATE INDEX IF NOT EXISTS "_cities_v_version_meta_version_meta_image_idx" ON "payload"."_cities_v_locales" USING btree ("version_meta_image_id","_locale");
  CREATE INDEX IF NOT EXISTS "about_us_meta_meta_image_idx" ON "payload"."about_us_locales" USING btree ("meta_image_id","_locale");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "payload"."users_sessions";
  ALTER TABLE "payload"."buildings_locales" DROP CONSTRAINT "buildings_locales_meta_image_id_media_id_fk";
  
  ALTER TABLE "payload"."_buildings_v_locales" DROP CONSTRAINT "_buildings_v_locales_version_meta_image_id_media_id_fk";
  
  ALTER TABLE "payload"."building_types_locales" DROP CONSTRAINT "building_types_locales_meta_image_id_media_id_fk";
  
  ALTER TABLE "payload"."_building_types_v_locales" DROP CONSTRAINT "_building_types_v_locales_version_meta_image_id_media_id_fk";
  
  ALTER TABLE "payload"."countries_locales" DROP CONSTRAINT "countries_locales_meta_image_id_media_id_fk";
  
  ALTER TABLE "payload"."_countries_v_locales" DROP CONSTRAINT "_countries_v_locales_version_meta_image_id_media_id_fk";
  
  ALTER TABLE "payload"."cities_locales" DROP CONSTRAINT "cities_locales_meta_image_id_media_id_fk";
  
  ALTER TABLE "payload"."_cities_v_locales" DROP CONSTRAINT "_cities_v_locales_version_meta_image_id_media_id_fk";
  
  ALTER TABLE "payload"."about_us_locales" DROP CONSTRAINT "about_us_locales_meta_image_id_media_id_fk";
  
  DROP INDEX IF EXISTS "buildings_meta_meta_image_idx";
  DROP INDEX IF EXISTS "_buildings_v_version_meta_version_meta_image_idx";
  DROP INDEX IF EXISTS "building_types_meta_meta_image_idx";
  DROP INDEX IF EXISTS "_building_types_v_version_meta_version_meta_image_idx";
  DROP INDEX IF EXISTS "countries_meta_meta_image_idx";
  DROP INDEX IF EXISTS "_countries_v_version_meta_version_meta_image_idx";
  DROP INDEX IF EXISTS "cities_meta_meta_image_idx";
  DROP INDEX IF EXISTS "_cities_v_version_meta_version_meta_image_idx";
  DROP INDEX IF EXISTS "about_us_meta_meta_image_idx";
  ALTER TABLE "payload"."buildings_locales" DROP COLUMN IF EXISTS "meta_title";
  ALTER TABLE "payload"."buildings_locales" DROP COLUMN IF EXISTS "meta_description";
  ALTER TABLE "payload"."buildings_locales" DROP COLUMN IF EXISTS "meta_image_id";
  ALTER TABLE "payload"."_buildings_v_locales" DROP COLUMN IF EXISTS "version_meta_title";
  ALTER TABLE "payload"."_buildings_v_locales" DROP COLUMN IF EXISTS "version_meta_description";
  ALTER TABLE "payload"."_buildings_v_locales" DROP COLUMN IF EXISTS "version_meta_image_id";
  ALTER TABLE "payload"."building_types_locales" DROP COLUMN IF EXISTS "meta_title";
  ALTER TABLE "payload"."building_types_locales" DROP COLUMN IF EXISTS "meta_description";
  ALTER TABLE "payload"."building_types_locales" DROP COLUMN IF EXISTS "meta_image_id";
  ALTER TABLE "payload"."_building_types_v_locales" DROP COLUMN IF EXISTS "version_meta_title";
  ALTER TABLE "payload"."_building_types_v_locales" DROP COLUMN IF EXISTS "version_meta_description";
  ALTER TABLE "payload"."_building_types_v_locales" DROP COLUMN IF EXISTS "version_meta_image_id";
  ALTER TABLE "payload"."countries_locales" DROP COLUMN IF EXISTS "meta_title";
  ALTER TABLE "payload"."countries_locales" DROP COLUMN IF EXISTS "meta_description";
  ALTER TABLE "payload"."countries_locales" DROP COLUMN IF EXISTS "meta_image_id";
  ALTER TABLE "payload"."_countries_v_locales" DROP COLUMN IF EXISTS "version_meta_title";
  ALTER TABLE "payload"."_countries_v_locales" DROP COLUMN IF EXISTS "version_meta_description";
  ALTER TABLE "payload"."_countries_v_locales" DROP COLUMN IF EXISTS "version_meta_image_id";
  ALTER TABLE "payload"."cities_locales" DROP COLUMN IF EXISTS "meta_title";
  ALTER TABLE "payload"."cities_locales" DROP COLUMN IF EXISTS "meta_description";
  ALTER TABLE "payload"."cities_locales" DROP COLUMN IF EXISTS "meta_image_id";
  ALTER TABLE "payload"."_cities_v_locales" DROP COLUMN IF EXISTS "version_meta_title";
  ALTER TABLE "payload"."_cities_v_locales" DROP COLUMN IF EXISTS "version_meta_description";
  ALTER TABLE "payload"."_cities_v_locales" DROP COLUMN IF EXISTS "version_meta_image_id";
  ALTER TABLE "payload"."about_us_locales" DROP COLUMN IF EXISTS "meta_title";
  ALTER TABLE "payload"."about_us_locales" DROP COLUMN IF EXISTS "meta_description";
  ALTER TABLE "payload"."about_us_locales" DROP COLUMN IF EXISTS "meta_image_id";`)
}
