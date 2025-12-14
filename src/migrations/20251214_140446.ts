import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "payload"."about_us" ADD COLUMN "featured_image_id" integer;
  ALTER TABLE "payload"."community" ADD COLUMN "featured_image_id" integer;
  ALTER TABLE "payload"."about_us" ADD CONSTRAINT "about_us_featured_image_id_media_id_fk" FOREIGN KEY ("featured_image_id") REFERENCES "payload"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."community" ADD CONSTRAINT "community_featured_image_id_media_id_fk" FOREIGN KEY ("featured_image_id") REFERENCES "payload"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "about_us_featured_image_idx" ON "payload"."about_us" USING btree ("featured_image_id");
  CREATE INDEX "community_featured_image_idx" ON "payload"."community" USING btree ("featured_image_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "payload"."about_us" DROP CONSTRAINT "about_us_featured_image_id_media_id_fk";
  
  ALTER TABLE "payload"."community" DROP CONSTRAINT "community_featured_image_id_media_id_fk";
  
  DROP INDEX "payload"."about_us_featured_image_idx";
  DROP INDEX "payload"."community_featured_image_idx";
  ALTER TABLE "payload"."about_us" DROP COLUMN "featured_image_id";
  ALTER TABLE "payload"."community" DROP COLUMN "featured_image_id";`)
}
