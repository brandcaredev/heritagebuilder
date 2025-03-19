import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE IF NOT EXISTS "payload"."about_us" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE IF NOT EXISTS "payload"."about_us_locales" (
  	"content" jsonb NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "payload"."_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  DO $$ BEGIN
   ALTER TABLE "payload"."about_us_locales" ADD CONSTRAINT "about_us_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."about_us"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  CREATE UNIQUE INDEX IF NOT EXISTS "about_us_locales_locale_parent_id_unique" ON "payload"."about_us_locales" USING btree ("_locale","_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "payload"."about_us";
  DROP TABLE "payload"."about_us_locales";`)
}
