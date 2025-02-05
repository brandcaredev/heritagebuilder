import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   DROP INDEX IF EXISTS "_buildings_v_autosave_idx";
  DROP INDEX IF EXISTS "_building_types_v_autosave_idx";
  DROP INDEX IF EXISTS "_countries_v_autosave_idx";
  DROP INDEX IF EXISTS "_regions_v_autosave_idx";
  DROP INDEX IF EXISTS "_counties_v_autosave_idx";
  DROP INDEX IF EXISTS "_cities_v_autosave_idx";
  ALTER TABLE "payload"."search_locales" ADD COLUMN "summary" varchar;
  CREATE INDEX IF NOT EXISTS "buildings_name_idx" ON "payload"."buildings_locales" USING btree ("name","_locale");
  CREATE INDEX IF NOT EXISTS "buildings_slug_idx" ON "payload"."buildings_locales" USING btree ("slug","_locale");
  CREATE INDEX IF NOT EXISTS "_buildings_v_version_version_name_idx" ON "payload"."_buildings_v_locales" USING btree ("version_name","_locale");
  CREATE INDEX IF NOT EXISTS "_buildings_v_version_version_slug_idx" ON "payload"."_buildings_v_locales" USING btree ("version_slug","_locale");
  CREATE INDEX IF NOT EXISTS "building_types_name_idx" ON "payload"."building_types_locales" USING btree ("name","_locale");
  CREATE INDEX IF NOT EXISTS "building_types_slug_idx" ON "payload"."building_types_locales" USING btree ("slug","_locale");
  CREATE INDEX IF NOT EXISTS "_building_types_v_version_version_name_idx" ON "payload"."_building_types_v_locales" USING btree ("version_name","_locale");
  CREATE INDEX IF NOT EXISTS "_building_types_v_version_version_slug_idx" ON "payload"."_building_types_v_locales" USING btree ("version_slug","_locale");
  CREATE INDEX IF NOT EXISTS "countries_name_idx" ON "payload"."countries_locales" USING btree ("name","_locale");
  CREATE INDEX IF NOT EXISTS "countries_slug_idx" ON "payload"."countries_locales" USING btree ("slug","_locale");
  CREATE INDEX IF NOT EXISTS "_countries_v_version_version_name_idx" ON "payload"."_countries_v_locales" USING btree ("version_name","_locale");
  CREATE INDEX IF NOT EXISTS "_countries_v_version_version_slug_idx" ON "payload"."_countries_v_locales" USING btree ("version_slug","_locale");
  CREATE INDEX IF NOT EXISTS "regions_name_idx" ON "payload"."regions_locales" USING btree ("name","_locale");
  CREATE INDEX IF NOT EXISTS "regions_slug_idx" ON "payload"."regions_locales" USING btree ("slug","_locale");
  CREATE INDEX IF NOT EXISTS "_regions_v_version_version_name_idx" ON "payload"."_regions_v_locales" USING btree ("version_name","_locale");
  CREATE INDEX IF NOT EXISTS "_regions_v_version_version_slug_idx" ON "payload"."_regions_v_locales" USING btree ("version_slug","_locale");
  CREATE INDEX IF NOT EXISTS "counties_name_idx" ON "payload"."counties_locales" USING btree ("name","_locale");
  CREATE INDEX IF NOT EXISTS "counties_slug_idx" ON "payload"."counties_locales" USING btree ("slug","_locale");
  CREATE INDEX IF NOT EXISTS "_counties_v_version_version_name_idx" ON "payload"."_counties_v_locales" USING btree ("version_name","_locale");
  CREATE INDEX IF NOT EXISTS "_counties_v_version_version_slug_idx" ON "payload"."_counties_v_locales" USING btree ("version_slug","_locale");
  CREATE INDEX IF NOT EXISTS "cities_name_idx" ON "payload"."cities_locales" USING btree ("name","_locale");
  CREATE INDEX IF NOT EXISTS "cities_slug_idx" ON "payload"."cities_locales" USING btree ("slug","_locale");
  CREATE INDEX IF NOT EXISTS "_cities_v_version_version_name_idx" ON "payload"."_cities_v_locales" USING btree ("version_name","_locale");
  CREATE INDEX IF NOT EXISTS "_cities_v_version_version_slug_idx" ON "payload"."_cities_v_locales" USING btree ("version_slug","_locale");
  CREATE INDEX IF NOT EXISTS "search_summary_idx" ON "payload"."search_locales" USING btree ("summary","_locale");
  ALTER TABLE "payload"."_buildings_v" DROP COLUMN IF EXISTS "autosave";
  ALTER TABLE "payload"."_building_types_v" DROP COLUMN IF EXISTS "autosave";
  ALTER TABLE "payload"."_countries_v" DROP COLUMN IF EXISTS "autosave";
  ALTER TABLE "payload"."_regions_v" DROP COLUMN IF EXISTS "autosave";
  ALTER TABLE "payload"."_counties_v" DROP COLUMN IF EXISTS "autosave";
  ALTER TABLE "payload"."_cities_v" DROP COLUMN IF EXISTS "autosave";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP INDEX IF EXISTS "buildings_name_idx";
  DROP INDEX IF EXISTS "buildings_slug_idx";
  DROP INDEX IF EXISTS "_buildings_v_version_version_name_idx";
  DROP INDEX IF EXISTS "_buildings_v_version_version_slug_idx";
  DROP INDEX IF EXISTS "building_types_name_idx";
  DROP INDEX IF EXISTS "building_types_slug_idx";
  DROP INDEX IF EXISTS "_building_types_v_version_version_name_idx";
  DROP INDEX IF EXISTS "_building_types_v_version_version_slug_idx";
  DROP INDEX IF EXISTS "countries_name_idx";
  DROP INDEX IF EXISTS "countries_slug_idx";
  DROP INDEX IF EXISTS "_countries_v_version_version_name_idx";
  DROP INDEX IF EXISTS "_countries_v_version_version_slug_idx";
  DROP INDEX IF EXISTS "regions_name_idx";
  DROP INDEX IF EXISTS "regions_slug_idx";
  DROP INDEX IF EXISTS "_regions_v_version_version_name_idx";
  DROP INDEX IF EXISTS "_regions_v_version_version_slug_idx";
  DROP INDEX IF EXISTS "counties_name_idx";
  DROP INDEX IF EXISTS "counties_slug_idx";
  DROP INDEX IF EXISTS "_counties_v_version_version_name_idx";
  DROP INDEX IF EXISTS "_counties_v_version_version_slug_idx";
  DROP INDEX IF EXISTS "cities_name_idx";
  DROP INDEX IF EXISTS "cities_slug_idx";
  DROP INDEX IF EXISTS "_cities_v_version_version_name_idx";
  DROP INDEX IF EXISTS "_cities_v_version_version_slug_idx";
  DROP INDEX IF EXISTS "search_summary_idx";
  ALTER TABLE "payload"."_buildings_v" ADD COLUMN "autosave" boolean;
  ALTER TABLE "payload"."_building_types_v" ADD COLUMN "autosave" boolean;
  ALTER TABLE "payload"."_countries_v" ADD COLUMN "autosave" boolean;
  ALTER TABLE "payload"."_regions_v" ADD COLUMN "autosave" boolean;
  ALTER TABLE "payload"."_counties_v" ADD COLUMN "autosave" boolean;
  ALTER TABLE "payload"."_cities_v" ADD COLUMN "autosave" boolean;
  CREATE INDEX IF NOT EXISTS "_buildings_v_autosave_idx" ON "payload"."_buildings_v" USING btree ("autosave");
  CREATE INDEX IF NOT EXISTS "_building_types_v_autosave_idx" ON "payload"."_building_types_v" USING btree ("autosave");
  CREATE INDEX IF NOT EXISTS "_countries_v_autosave_idx" ON "payload"."_countries_v" USING btree ("autosave");
  CREATE INDEX IF NOT EXISTS "_regions_v_autosave_idx" ON "payload"."_regions_v" USING btree ("autosave");
  CREATE INDEX IF NOT EXISTS "_counties_v_autosave_idx" ON "payload"."_counties_v" USING btree ("autosave");
  CREATE INDEX IF NOT EXISTS "_cities_v_autosave_idx" ON "payload"."_cities_v" USING btree ("autosave");
  ALTER TABLE "payload"."search_locales" DROP COLUMN IF EXISTS "summary";`)
}
