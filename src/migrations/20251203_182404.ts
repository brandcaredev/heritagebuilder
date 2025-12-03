import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "payload"."description" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "payload"."description_locales" (
  	"content" jsonb NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "payload"."_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  ALTER TABLE "payload"."description_locales" ADD CONSTRAINT "description_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."description"("id") ON DELETE cascade ON UPDATE no action;
  CREATE UNIQUE INDEX "description_locales_locale_parent_id_unique" ON "payload"."description_locales" USING btree ("_locale","_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "payload"."description" CASCADE;
  DROP TABLE "payload"."description_locales" CASCADE;`)
}
