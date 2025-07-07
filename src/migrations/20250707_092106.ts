import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TYPE "payload"."enum_counties_code" ADD VALUE 'SKZI';
  ALTER TYPE "payload"."enum_counties_code" ADD VALUE 'SKPV';
  ALTER TYPE "payload"."enum_counties_code" ADD VALUE 'SKKI';
  ALTER TYPE "payload"."enum_counties_code" ADD VALUE 'SKBL';
  ALTER TYPE "payload"."enum_counties_code" ADD VALUE 'SKTA';
  ALTER TYPE "payload"."enum_counties_code" ADD VALUE 'SKTC';
  ALTER TYPE "payload"."enum_counties_code" ADD VALUE 'SKBC';
  ALTER TYPE "payload"."enum_counties_code" ADD VALUE 'SKNI';
  ALTER TYPE "payload"."enum__counties_v_version_code" ADD VALUE 'SKZI';
  ALTER TYPE "payload"."enum__counties_v_version_code" ADD VALUE 'SKPV';
  ALTER TYPE "payload"."enum__counties_v_version_code" ADD VALUE 'SKKI';
  ALTER TYPE "payload"."enum__counties_v_version_code" ADD VALUE 'SKBL';
  ALTER TYPE "payload"."enum__counties_v_version_code" ADD VALUE 'SKTA';
  ALTER TYPE "payload"."enum__counties_v_version_code" ADD VALUE 'SKTC';
  ALTER TYPE "payload"."enum__counties_v_version_code" ADD VALUE 'SKBC';
  ALTER TYPE "payload"."enum__counties_v_version_code" ADD VALUE 'SKNI';`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
    // Migration code
}
