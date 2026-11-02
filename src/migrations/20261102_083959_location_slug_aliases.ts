import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "payload"."enum_location_slug_aliases_locale" AS ENUM('en', 'hu');
  CREATE TYPE "payload"."enum_location_slug_aliases_entity_type" AS ENUM('city', 'county');
  CREATE TABLE "payload"."location_slug_aliases" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"slug" varchar NOT NULL,
  	"locale" "payload"."enum_location_slug_aliases_locale" NOT NULL,
  	"entity_type" "payload"."enum_location_slug_aliases_entity_type" NOT NULL,
  	"city_id" integer,
  	"county_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "payload"."payload_locked_documents_rels" ADD COLUMN "location_slug_aliases_id" integer;
  ALTER TABLE "payload"."location_slug_aliases" ADD CONSTRAINT "location_slug_aliases_city_id_cities_id_fk" FOREIGN KEY ("city_id") REFERENCES "payload"."cities"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."location_slug_aliases" ADD CONSTRAINT "location_slug_aliases_county_id_counties_id_fk" FOREIGN KEY ("county_id") REFERENCES "payload"."counties"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "location_slug_aliases_city_idx" ON "payload"."location_slug_aliases" USING btree ("city_id");
  CREATE INDEX "location_slug_aliases_county_idx" ON "payload"."location_slug_aliases" USING btree ("county_id");
  CREATE INDEX "location_slug_aliases_updated_at_idx" ON "payload"."location_slug_aliases" USING btree ("updated_at");
  CREATE INDEX "location_slug_aliases_created_at_idx" ON "payload"."location_slug_aliases" USING btree ("created_at");
  CREATE UNIQUE INDEX "slug_locale_entityType_idx" ON "payload"."location_slug_aliases" USING btree ("slug","locale","entity_type");
  ALTER TABLE "payload"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_location_slug_aliases_fk" FOREIGN KEY ("location_slug_aliases_id") REFERENCES "payload"."location_slug_aliases"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_location_slug_aliases_id_idx" ON "payload"."payload_locked_documents_rels" USING btree ("location_slug_aliases_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "payload"."location_slug_aliases" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "payload"."location_slug_aliases" CASCADE;
  ALTER TABLE "payload"."payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_location_slug_aliases_fk";
  
  DROP INDEX "payload"."payload_locked_documents_rels_location_slug_aliases_id_idx";
  ALTER TABLE "payload"."payload_locked_documents_rels" DROP COLUMN "location_slug_aliases_id";
  DROP TYPE "payload"."enum_location_slug_aliases_locale";
  DROP TYPE "payload"."enum_location_slug_aliases_entity_type";`)
}
