import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   DO $$ BEGIN
   CREATE TYPE "payload"."enum_counties_code" AS ENUM('RO-AB', 'RO-AG', 'RO-AR', 'RO-BC', 'RO-BH', 'RO-BN', 'RO-BR', 'RO-BT', 'RO-B', 'RO-BV', 'RO-BZ', 'RO-CJ', 'RO-CL', 'RO-CS', 'RO-CT', 'RO-CV', 'RO-DB', 'RO-DJ', 'RO-GJ', 'RO-GL', 'RO-GR', 'RO-HD', 'RO-HR', 'RO-IF', 'RO-IL', 'RO-IS', 'RO-MH', 'RO-MM', 'RO-MS', 'RO-NT', 'RO-OT', 'RO-PH', 'RO-SB', 'RO-SJ', 'RO-SM', 'RO-SV', 'RO-TL', 'RO-TM', 'RO-TR', 'RO-VL', 'RO-VN', 'RO-VS', 'RS-00', 'RS-01', 'RS-02', 'RS-03', 'RS-04', 'RS-05', 'RS-06', 'RS-07', 'RS-08', 'RS-09', 'RS-10', 'RS-11', 'RS-12', 'RS-13', 'RS-14', 'RS-15', 'RS-16', 'RS-17', 'RS-18', 'RS-19', 'RS-20', 'RS-21', 'RS-22', 'RS-23', 'RS-24');
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   CREATE TYPE "payload"."enum__counties_v_version_code" AS ENUM('RO-AB', 'RO-AG', 'RO-AR', 'RO-BC', 'RO-BH', 'RO-BN', 'RO-BR', 'RO-BT', 'RO-B', 'RO-BV', 'RO-BZ', 'RO-CJ', 'RO-CL', 'RO-CS', 'RO-CT', 'RO-CV', 'RO-DB', 'RO-DJ', 'RO-GJ', 'RO-GL', 'RO-GR', 'RO-HD', 'RO-HR', 'RO-IF', 'RO-IL', 'RO-IS', 'RO-MH', 'RO-MM', 'RO-MS', 'RO-NT', 'RO-OT', 'RO-PH', 'RO-SB', 'RO-SJ', 'RO-SM', 'RO-SV', 'RO-TL', 'RO-TM', 'RO-TR', 'RO-VL', 'RO-VN', 'RO-VS', 'RS-00', 'RS-01', 'RS-02', 'RS-03', 'RS-04', 'RS-05', 'RS-06', 'RS-07', 'RS-08', 'RS-09', 'RS-10', 'RS-11', 'RS-12', 'RS-13', 'RS-14', 'RS-15', 'RS-16', 'RS-17', 'RS-18', 'RS-19', 'RS-20', 'RS-21', 'RS-22', 'RS-23', 'RS-24');
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  ALTER TABLE "payload"."counties_locales" ALTER COLUMN "description" SET DATA TYPE jsonb;
  ALTER TABLE "payload"."_counties_v_locales" ALTER COLUMN "version_description" SET DATA TYPE jsonb;
  ALTER TABLE "payload"."cities_locales" ALTER COLUMN "description" SET DATA TYPE jsonb;
  ALTER TABLE "payload"."_cities_v_locales" ALTER COLUMN "version_description" SET DATA TYPE jsonb;
  ALTER TABLE "payload"."counties" ADD COLUMN "code" "payload"."enum_counties_code";
  ALTER TABLE "payload"."_counties_v" ADD COLUMN "version_code" "payload"."enum__counties_v_version_code";
  ALTER TABLE "payload"."users" ADD COLUMN "notify_on_new_building" boolean DEFAULT false;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "payload"."counties_locales" ALTER COLUMN "description" SET DATA TYPE varchar;
  ALTER TABLE "payload"."_counties_v_locales" ALTER COLUMN "version_description" SET DATA TYPE varchar;
  ALTER TABLE "payload"."cities_locales" ALTER COLUMN "description" SET DATA TYPE varchar;
  ALTER TABLE "payload"."_cities_v_locales" ALTER COLUMN "version_description" SET DATA TYPE varchar;
  ALTER TABLE "payload"."counties" DROP COLUMN IF EXISTS "code";
  ALTER TABLE "payload"."_counties_v" DROP COLUMN IF EXISTS "version_code";
  ALTER TABLE "payload"."users" DROP COLUMN IF EXISTS "notify_on_new_building";`)
}
