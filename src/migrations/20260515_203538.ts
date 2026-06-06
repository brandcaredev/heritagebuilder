import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "payload"."buildings_media" ADD COLUMN "sizes_gallery_url" varchar;
  ALTER TABLE "payload"."buildings_media" ADD COLUMN "sizes_gallery_width" numeric;
  ALTER TABLE "payload"."buildings_media" ADD COLUMN "sizes_gallery_height" numeric;
  ALTER TABLE "payload"."buildings_media" ADD COLUMN "sizes_gallery_mime_type" varchar;
  ALTER TABLE "payload"."buildings_media" ADD COLUMN "sizes_gallery_filesize" numeric;
  ALTER TABLE "payload"."buildings_media" ADD COLUMN "sizes_gallery_filename" varchar;
  CREATE INDEX "buildings_media_sizes_gallery_sizes_gallery_filename_idx" ON "payload"."buildings_media" USING btree ("sizes_gallery_filename");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP INDEX "payload"."buildings_media_sizes_gallery_sizes_gallery_filename_idx";
  ALTER TABLE "payload"."buildings_media" DROP COLUMN "sizes_gallery_url";
  ALTER TABLE "payload"."buildings_media" DROP COLUMN "sizes_gallery_width";
  ALTER TABLE "payload"."buildings_media" DROP COLUMN "sizes_gallery_height";
  ALTER TABLE "payload"."buildings_media" DROP COLUMN "sizes_gallery_mime_type";
  ALTER TABLE "payload"."buildings_media" DROP COLUMN "sizes_gallery_filesize";
  ALTER TABLE "payload"."buildings_media" DROP COLUMN "sizes_gallery_filename";`)
}
