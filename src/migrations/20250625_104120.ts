import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TYPE "payload"."enum_counties_code" ADD VALUE 'chernihiv';
  ALTER TYPE "payload"."enum_counties_code" ADD VALUE 'volyn';
  ALTER TYPE "payload"."enum_counties_code" ADD VALUE 'rivne';
  ALTER TYPE "payload"."enum_counties_code" ADD VALUE 'zhytomyr';
  ALTER TYPE "payload"."enum_counties_code" ADD VALUE 'kiev';
  ALTER TYPE "payload"."enum_counties_code" ADD VALUE 'kiev_city';
  ALTER TYPE "payload"."enum_counties_code" ADD VALUE 'zakarpattia';
  ALTER TYPE "payload"."enum_counties_code" ADD VALUE 'chernivtsi';
  ALTER TYPE "payload"."enum_counties_code" ADD VALUE 'ivano-frankivsk';
  ALTER TYPE "payload"."enum_counties_code" ADD VALUE 'odessa';
  ALTER TYPE "payload"."enum_counties_code" ADD VALUE 'vinnytsia';
  ALTER TYPE "payload"."enum_counties_code" ADD VALUE 'lviv';
  ALTER TYPE "payload"."enum_counties_code" ADD VALUE 'sumy';
  ALTER TYPE "payload"."enum_counties_code" ADD VALUE 'kharkiv';
  ALTER TYPE "payload"."enum_counties_code" ADD VALUE 'luhansk';
  ALTER TYPE "payload"."enum_counties_code" ADD VALUE 'donetsk';
  ALTER TYPE "payload"."enum_counties_code" ADD VALUE 'kherson';
  ALTER TYPE "payload"."enum_counties_code" ADD VALUE 'zaporizhzhya';
  ALTER TYPE "payload"."enum_counties_code" ADD VALUE 'mykolayiv';
  ALTER TYPE "payload"."enum_counties_code" ADD VALUE 'poltava';
  ALTER TYPE "payload"."enum_counties_code" ADD VALUE 'khmelnytsky';
  ALTER TYPE "payload"."enum_counties_code" ADD VALUE 'ternopil';
  ALTER TYPE "payload"."enum_counties_code" ADD VALUE 'dnipropetrovsk';
  ALTER TYPE "payload"."enum_counties_code" ADD VALUE 'cherkasy';
  ALTER TYPE "payload"."enum_counties_code" ADD VALUE 'kirovohrad';
  ALTER TYPE "payload"."enum__counties_v_version_code" ADD VALUE 'chernihiv';
  ALTER TYPE "payload"."enum__counties_v_version_code" ADD VALUE 'volyn';
  ALTER TYPE "payload"."enum__counties_v_version_code" ADD VALUE 'rivne';
  ALTER TYPE "payload"."enum__counties_v_version_code" ADD VALUE 'zhytomyr';
  ALTER TYPE "payload"."enum__counties_v_version_code" ADD VALUE 'kiev';
  ALTER TYPE "payload"."enum__counties_v_version_code" ADD VALUE 'kiev_city';
  ALTER TYPE "payload"."enum__counties_v_version_code" ADD VALUE 'zakarpattia';
  ALTER TYPE "payload"."enum__counties_v_version_code" ADD VALUE 'chernivtsi';
  ALTER TYPE "payload"."enum__counties_v_version_code" ADD VALUE 'ivano-frankivsk';
  ALTER TYPE "payload"."enum__counties_v_version_code" ADD VALUE 'odessa';
  ALTER TYPE "payload"."enum__counties_v_version_code" ADD VALUE 'vinnytsia';
  ALTER TYPE "payload"."enum__counties_v_version_code" ADD VALUE 'lviv';
  ALTER TYPE "payload"."enum__counties_v_version_code" ADD VALUE 'sumy';
  ALTER TYPE "payload"."enum__counties_v_version_code" ADD VALUE 'kharkiv';
  ALTER TYPE "payload"."enum__counties_v_version_code" ADD VALUE 'luhansk';
  ALTER TYPE "payload"."enum__counties_v_version_code" ADD VALUE 'donetsk';
  ALTER TYPE "payload"."enum__counties_v_version_code" ADD VALUE 'kherson';
  ALTER TYPE "payload"."enum__counties_v_version_code" ADD VALUE 'zaporizhzhya';
  ALTER TYPE "payload"."enum__counties_v_version_code" ADD VALUE 'mykolayiv';
  ALTER TYPE "payload"."enum__counties_v_version_code" ADD VALUE 'poltava';
  ALTER TYPE "payload"."enum__counties_v_version_code" ADD VALUE 'khmelnytsky';
  ALTER TYPE "payload"."enum__counties_v_version_code" ADD VALUE 'ternopil';
  ALTER TYPE "payload"."enum__counties_v_version_code" ADD VALUE 'dnipropetrovsk';
  ALTER TYPE "payload"."enum__counties_v_version_code" ADD VALUE 'cherkasy';
  ALTER TYPE "payload"."enum__counties_v_version_code" ADD VALUE 'kirovohrad';`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
    // Migration code
}
