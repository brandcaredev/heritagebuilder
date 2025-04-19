import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   DO $$ BEGIN
   CREATE TYPE "payload"."enum_buildings_source_source_type" AS ENUM('book', 'website', 'other');
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   CREATE TYPE "payload"."enum__buildings_v_version_source_source_type" AS ENUM('book', 'website', 'other');
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  CREATE TABLE IF NOT EXISTS "payload"."buildings_source" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"source_type" "payload"."enum_buildings_source_source_type" DEFAULT 'book',
  	"book_author" varchar,
  	"book_title" varchar,
  	"book_year" numeric,
  	"book_publisher" varchar,
  	"website_url" varchar,
  	"other_source" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "payload"."_buildings_v_version_source" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"source_type" "payload"."enum__buildings_v_version_source_source_type" DEFAULT 'book',
  	"book_author" varchar,
  	"book_title" varchar,
  	"book_year" numeric,
  	"book_publisher" varchar,
  	"website_url" varchar,
  	"other_source" varchar,
  	"_uuid" varchar
  );
  
  DO $$ BEGIN
   ALTER TABLE "payload"."buildings_source" ADD CONSTRAINT "buildings_source_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."buildings"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload"."_buildings_v_version_source" ADD CONSTRAINT "_buildings_v_version_source_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."_buildings_v"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  CREATE INDEX IF NOT EXISTS "buildings_source_order_idx" ON "payload"."buildings_source" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "buildings_source_parent_id_idx" ON "payload"."buildings_source" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "_buildings_v_version_source_order_idx" ON "payload"."_buildings_v_version_source" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "_buildings_v_version_source_parent_id_idx" ON "payload"."_buildings_v_version_source" USING btree ("_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "payload"."buildings_source";
  DROP TABLE "payload"."_buildings_v_version_source";`)
}
