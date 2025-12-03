import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "payload"."payload_kv" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"data" jsonb NOT NULL
  );
  
  CREATE TABLE "payload"."community" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "payload"."community_locales" (
  	"content" jsonb NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "payload"."_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  DROP INDEX "payload"."building_types_media_sizes_thumbnail_sizes_thumbnail_filename_idx";
  ALTER TABLE "payload"."community_locales" ADD CONSTRAINT "community_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."community"("id") ON DELETE cascade ON UPDATE no action;
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "payload"."payload_kv" USING btree ("key");
  CREATE UNIQUE INDEX "community_locales_locale_parent_id_unique" ON "payload"."community_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "building_types_media_sizes_thumbnail_sizes_thumbnail_fil_idx" ON "payload"."building_types_media" USING btree ("sizes_thumbnail_filename");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "payload"."payload_kv" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "payload"."community" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "payload"."community_locales" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "payload"."payload_kv" CASCADE;
  DROP TABLE "payload"."community" CASCADE;
  DROP TABLE "payload"."community_locales" CASCADE;
  DROP INDEX "payload"."building_types_media_sizes_thumbnail_sizes_thumbnail_fil_idx";
  CREATE INDEX "building_types_media_sizes_thumbnail_sizes_thumbnail_filename_idx" ON "payload"."building_types_media" USING btree ("sizes_thumbnail_filename");`)
}
