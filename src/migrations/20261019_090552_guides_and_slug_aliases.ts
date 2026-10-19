import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "payload"."enum_building_slug_aliases_locale" AS ENUM('en', 'hu');
  CREATE TYPE "payload"."enum_guides_status" AS ENUM('draft', 'published');
  CREATE TYPE "payload"."enum__guides_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "payload"."enum__guides_v_published_locale" AS ENUM('en', 'hu');
  ALTER TYPE "payload"."enum_counties_code" ADD VALUE 'HU-BK';
  ALTER TYPE "payload"."enum_counties_code" ADD VALUE 'HU-BA';
  ALTER TYPE "payload"."enum_counties_code" ADD VALUE 'HU-BE';
  ALTER TYPE "payload"."enum_counties_code" ADD VALUE 'HU-BC';
  ALTER TYPE "payload"."enum_counties_code" ADD VALUE 'HU-BZ';
  ALTER TYPE "payload"."enum_counties_code" ADD VALUE 'HU-BU';
  ALTER TYPE "payload"."enum_counties_code" ADD VALUE 'HU-CS';
  ALTER TYPE "payload"."enum_counties_code" ADD VALUE 'HU-DE';
  ALTER TYPE "payload"."enum_counties_code" ADD VALUE 'HU-DU';
  ALTER TYPE "payload"."enum_counties_code" ADD VALUE 'HU-EG';
  ALTER TYPE "payload"."enum_counties_code" ADD VALUE 'HU-FE';
  ALTER TYPE "payload"."enum_counties_code" ADD VALUE 'HU-GY';
  ALTER TYPE "payload"."enum_counties_code" ADD VALUE 'HU-GS';
  ALTER TYPE "payload"."enum_counties_code" ADD VALUE 'HU-HB';
  ALTER TYPE "payload"."enum_counties_code" ADD VALUE 'HU-HE';
  ALTER TYPE "payload"."enum_counties_code" ADD VALUE 'HU-HV';
  ALTER TYPE "payload"."enum_counties_code" ADD VALUE 'HU-JN';
  ALTER TYPE "payload"."enum_counties_code" ADD VALUE 'HU-KV';
  ALTER TYPE "payload"."enum_counties_code" ADD VALUE 'HU-KM';
  ALTER TYPE "payload"."enum_counties_code" ADD VALUE 'HU-KE';
  ALTER TYPE "payload"."enum_counties_code" ADD VALUE 'HU-MI';
  ALTER TYPE "payload"."enum_counties_code" ADD VALUE 'HU-NK';
  ALTER TYPE "payload"."enum_counties_code" ADD VALUE 'HU-NO';
  ALTER TYPE "payload"."enum_counties_code" ADD VALUE 'HU-NY';
  ALTER TYPE "payload"."enum_counties_code" ADD VALUE 'HU-PS';
  ALTER TYPE "payload"."enum_counties_code" ADD VALUE 'HU-PE';
  ALTER TYPE "payload"."enum_counties_code" ADD VALUE 'HU-SO';
  ALTER TYPE "payload"."enum_counties_code" ADD VALUE 'HU-SN';
  ALTER TYPE "payload"."enum_counties_code" ADD VALUE 'HU-SZ';
  ALTER TYPE "payload"."enum_counties_code" ADD VALUE 'HU-SD';
  ALTER TYPE "payload"."enum_counties_code" ADD VALUE 'HU-SF';
  ALTER TYPE "payload"."enum_counties_code" ADD VALUE 'HU-SK';
  ALTER TYPE "payload"."enum_counties_code" ADD VALUE 'HU-SH';
  ALTER TYPE "payload"."enum_counties_code" ADD VALUE 'HU-TB';
  ALTER TYPE "payload"."enum_counties_code" ADD VALUE 'HU-TO';
  ALTER TYPE "payload"."enum_counties_code" ADD VALUE 'HU-VA';
  ALTER TYPE "payload"."enum_counties_code" ADD VALUE 'HU-VE';
  ALTER TYPE "payload"."enum_counties_code" ADD VALUE 'HU-VM';
  ALTER TYPE "payload"."enum_counties_code" ADD VALUE 'HU-ZA';
  ALTER TYPE "payload"."enum_counties_code" ADD VALUE 'HU-ZE';
  ALTER TYPE "payload"."enum__counties_v_version_code" ADD VALUE 'HU-BK';
  ALTER TYPE "payload"."enum__counties_v_version_code" ADD VALUE 'HU-BA';
  ALTER TYPE "payload"."enum__counties_v_version_code" ADD VALUE 'HU-BE';
  ALTER TYPE "payload"."enum__counties_v_version_code" ADD VALUE 'HU-BC';
  ALTER TYPE "payload"."enum__counties_v_version_code" ADD VALUE 'HU-BZ';
  ALTER TYPE "payload"."enum__counties_v_version_code" ADD VALUE 'HU-BU';
  ALTER TYPE "payload"."enum__counties_v_version_code" ADD VALUE 'HU-CS';
  ALTER TYPE "payload"."enum__counties_v_version_code" ADD VALUE 'HU-DE';
  ALTER TYPE "payload"."enum__counties_v_version_code" ADD VALUE 'HU-DU';
  ALTER TYPE "payload"."enum__counties_v_version_code" ADD VALUE 'HU-EG';
  ALTER TYPE "payload"."enum__counties_v_version_code" ADD VALUE 'HU-FE';
  ALTER TYPE "payload"."enum__counties_v_version_code" ADD VALUE 'HU-GY';
  ALTER TYPE "payload"."enum__counties_v_version_code" ADD VALUE 'HU-GS';
  ALTER TYPE "payload"."enum__counties_v_version_code" ADD VALUE 'HU-HB';
  ALTER TYPE "payload"."enum__counties_v_version_code" ADD VALUE 'HU-HE';
  ALTER TYPE "payload"."enum__counties_v_version_code" ADD VALUE 'HU-HV';
  ALTER TYPE "payload"."enum__counties_v_version_code" ADD VALUE 'HU-JN';
  ALTER TYPE "payload"."enum__counties_v_version_code" ADD VALUE 'HU-KV';
  ALTER TYPE "payload"."enum__counties_v_version_code" ADD VALUE 'HU-KM';
  ALTER TYPE "payload"."enum__counties_v_version_code" ADD VALUE 'HU-KE';
  ALTER TYPE "payload"."enum__counties_v_version_code" ADD VALUE 'HU-MI';
  ALTER TYPE "payload"."enum__counties_v_version_code" ADD VALUE 'HU-NK';
  ALTER TYPE "payload"."enum__counties_v_version_code" ADD VALUE 'HU-NO';
  ALTER TYPE "payload"."enum__counties_v_version_code" ADD VALUE 'HU-NY';
  ALTER TYPE "payload"."enum__counties_v_version_code" ADD VALUE 'HU-PS';
  ALTER TYPE "payload"."enum__counties_v_version_code" ADD VALUE 'HU-PE';
  ALTER TYPE "payload"."enum__counties_v_version_code" ADD VALUE 'HU-SO';
  ALTER TYPE "payload"."enum__counties_v_version_code" ADD VALUE 'HU-SN';
  ALTER TYPE "payload"."enum__counties_v_version_code" ADD VALUE 'HU-SZ';
  ALTER TYPE "payload"."enum__counties_v_version_code" ADD VALUE 'HU-SD';
  ALTER TYPE "payload"."enum__counties_v_version_code" ADD VALUE 'HU-SF';
  ALTER TYPE "payload"."enum__counties_v_version_code" ADD VALUE 'HU-SK';
  ALTER TYPE "payload"."enum__counties_v_version_code" ADD VALUE 'HU-SH';
  ALTER TYPE "payload"."enum__counties_v_version_code" ADD VALUE 'HU-TB';
  ALTER TYPE "payload"."enum__counties_v_version_code" ADD VALUE 'HU-TO';
  ALTER TYPE "payload"."enum__counties_v_version_code" ADD VALUE 'HU-VA';
  ALTER TYPE "payload"."enum__counties_v_version_code" ADD VALUE 'HU-VE';
  ALTER TYPE "payload"."enum__counties_v_version_code" ADD VALUE 'HU-VM';
  ALTER TYPE "payload"."enum__counties_v_version_code" ADD VALUE 'HU-ZA';
  ALTER TYPE "payload"."enum__counties_v_version_code" ADD VALUE 'HU-ZE';
  CREATE TABLE "payload"."building_slug_aliases" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"slug" varchar NOT NULL,
  	"locale" "payload"."enum_building_slug_aliases_locale" NOT NULL,
  	"building_id" integer NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload"."guides" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"slug" varchar,
  	"profile_photo_id" integer,
  	"phone" varchar,
  	"email" varchar,
  	"publication_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "payload"."enum_guides_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "payload"."guides_locales" (
  	"bio" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "payload"."_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "payload"."guides_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "payload"."guides_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"cities_id" integer
  );
  
  CREATE TABLE "payload"."_guides_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_name" varchar,
  	"version_slug" varchar,
  	"version_profile_photo_id" integer,
  	"version_phone" varchar,
  	"version_email" varchar,
  	"version_publication_id" integer,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "payload"."enum__guides_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "payload"."enum__guides_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "payload"."_guides_v_locales" (
  	"version_bio" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "payload"."_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "payload"."_guides_v_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "payload"."_guides_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"cities_id" integer
  );
  
  CREATE TABLE "payload"."guide_publications" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"prefix" varchar DEFAULT 'guide-publication',
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric
  );
  
  ALTER TABLE "payload"."buildings_rels" ADD COLUMN "guides_id" integer;
  ALTER TABLE "payload"."_buildings_v_rels" ADD COLUMN "guides_id" integer;
  ALTER TABLE "payload"."payload_locked_documents_rels" ADD COLUMN "building_slug_aliases_id" integer;
  ALTER TABLE "payload"."payload_locked_documents_rels" ADD COLUMN "guides_id" integer;
  ALTER TABLE "payload"."payload_locked_documents_rels" ADD COLUMN "guide_publications_id" integer;
  ALTER TABLE "payload"."building_slug_aliases" ADD CONSTRAINT "building_slug_aliases_building_id_buildings_id_fk" FOREIGN KEY ("building_id") REFERENCES "payload"."buildings"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."guides" ADD CONSTRAINT "guides_profile_photo_id_media_id_fk" FOREIGN KEY ("profile_photo_id") REFERENCES "payload"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."guides" ADD CONSTRAINT "guides_publication_id_guide_publications_id_fk" FOREIGN KEY ("publication_id") REFERENCES "payload"."guide_publications"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."guides_locales" ADD CONSTRAINT "guides_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."guides"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."guides_texts" ADD CONSTRAINT "guides_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "payload"."guides"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."guides_rels" ADD CONSTRAINT "guides_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "payload"."guides"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."guides_rels" ADD CONSTRAINT "guides_rels_cities_fk" FOREIGN KEY ("cities_id") REFERENCES "payload"."cities"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."_guides_v" ADD CONSTRAINT "_guides_v_parent_id_guides_id_fk" FOREIGN KEY ("parent_id") REFERENCES "payload"."guides"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."_guides_v" ADD CONSTRAINT "_guides_v_version_profile_photo_id_media_id_fk" FOREIGN KEY ("version_profile_photo_id") REFERENCES "payload"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."_guides_v" ADD CONSTRAINT "_guides_v_version_publication_id_guide_publications_id_fk" FOREIGN KEY ("version_publication_id") REFERENCES "payload"."guide_publications"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."_guides_v_locales" ADD CONSTRAINT "_guides_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."_guides_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."_guides_v_texts" ADD CONSTRAINT "_guides_v_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "payload"."_guides_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."_guides_v_rels" ADD CONSTRAINT "_guides_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "payload"."_guides_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."_guides_v_rels" ADD CONSTRAINT "_guides_v_rels_cities_fk" FOREIGN KEY ("cities_id") REFERENCES "payload"."cities"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "building_slug_aliases_building_idx" ON "payload"."building_slug_aliases" USING btree ("building_id");
  CREATE INDEX "building_slug_aliases_updated_at_idx" ON "payload"."building_slug_aliases" USING btree ("updated_at");
  CREATE INDEX "building_slug_aliases_created_at_idx" ON "payload"."building_slug_aliases" USING btree ("created_at");
  CREATE UNIQUE INDEX "slug_locale_idx" ON "payload"."building_slug_aliases" USING btree ("slug","locale");
  CREATE INDEX "guides_name_idx" ON "payload"."guides" USING btree ("name");
  CREATE UNIQUE INDEX "guides_slug_idx" ON "payload"."guides" USING btree ("slug");
  CREATE INDEX "guides_profile_photo_idx" ON "payload"."guides" USING btree ("profile_photo_id");
  CREATE INDEX "guides_publication_idx" ON "payload"."guides" USING btree ("publication_id");
  CREATE INDEX "guides_updated_at_idx" ON "payload"."guides" USING btree ("updated_at");
  CREATE INDEX "guides_created_at_idx" ON "payload"."guides" USING btree ("created_at");
  CREATE INDEX "guides__status_idx" ON "payload"."guides" USING btree ("_status");
  CREATE UNIQUE INDEX "guides_locales_locale_parent_id_unique" ON "payload"."guides_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "guides_texts_order_parent" ON "payload"."guides_texts" USING btree ("order","parent_id");
  CREATE INDEX "guides_rels_order_idx" ON "payload"."guides_rels" USING btree ("order");
  CREATE INDEX "guides_rels_parent_idx" ON "payload"."guides_rels" USING btree ("parent_id");
  CREATE INDEX "guides_rels_path_idx" ON "payload"."guides_rels" USING btree ("path");
  CREATE INDEX "guides_rels_cities_id_idx" ON "payload"."guides_rels" USING btree ("cities_id");
  CREATE INDEX "_guides_v_parent_idx" ON "payload"."_guides_v" USING btree ("parent_id");
  CREATE INDEX "_guides_v_version_version_name_idx" ON "payload"."_guides_v" USING btree ("version_name");
  CREATE INDEX "_guides_v_version_version_slug_idx" ON "payload"."_guides_v" USING btree ("version_slug");
  CREATE INDEX "_guides_v_version_version_profile_photo_idx" ON "payload"."_guides_v" USING btree ("version_profile_photo_id");
  CREATE INDEX "_guides_v_version_version_publication_idx" ON "payload"."_guides_v" USING btree ("version_publication_id");
  CREATE INDEX "_guides_v_version_version_updated_at_idx" ON "payload"."_guides_v" USING btree ("version_updated_at");
  CREATE INDEX "_guides_v_version_version_created_at_idx" ON "payload"."_guides_v" USING btree ("version_created_at");
  CREATE INDEX "_guides_v_version_version__status_idx" ON "payload"."_guides_v" USING btree ("version__status");
  CREATE INDEX "_guides_v_created_at_idx" ON "payload"."_guides_v" USING btree ("created_at");
  CREATE INDEX "_guides_v_updated_at_idx" ON "payload"."_guides_v" USING btree ("updated_at");
  CREATE INDEX "_guides_v_snapshot_idx" ON "payload"."_guides_v" USING btree ("snapshot");
  CREATE INDEX "_guides_v_published_locale_idx" ON "payload"."_guides_v" USING btree ("published_locale");
  CREATE INDEX "_guides_v_latest_idx" ON "payload"."_guides_v" USING btree ("latest");
  CREATE UNIQUE INDEX "_guides_v_locales_locale_parent_id_unique" ON "payload"."_guides_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_guides_v_texts_order_parent" ON "payload"."_guides_v_texts" USING btree ("order","parent_id");
  CREATE INDEX "_guides_v_rels_order_idx" ON "payload"."_guides_v_rels" USING btree ("order");
  CREATE INDEX "_guides_v_rels_parent_idx" ON "payload"."_guides_v_rels" USING btree ("parent_id");
  CREATE INDEX "_guides_v_rels_path_idx" ON "payload"."_guides_v_rels" USING btree ("path");
  CREATE INDEX "_guides_v_rels_cities_id_idx" ON "payload"."_guides_v_rels" USING btree ("cities_id");
  CREATE INDEX "guide_publications_updated_at_idx" ON "payload"."guide_publications" USING btree ("updated_at");
  CREATE INDEX "guide_publications_created_at_idx" ON "payload"."guide_publications" USING btree ("created_at");
  CREATE UNIQUE INDEX "guide_publications_filename_idx" ON "payload"."guide_publications" USING btree ("filename");
  ALTER TABLE "payload"."buildings_rels" ADD CONSTRAINT "buildings_rels_guides_fk" FOREIGN KEY ("guides_id") REFERENCES "payload"."guides"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."_buildings_v_rels" ADD CONSTRAINT "_buildings_v_rels_guides_fk" FOREIGN KEY ("guides_id") REFERENCES "payload"."guides"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_building_slug_aliases_fk" FOREIGN KEY ("building_slug_aliases_id") REFERENCES "payload"."building_slug_aliases"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_guides_fk" FOREIGN KEY ("guides_id") REFERENCES "payload"."guides"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_guide_publications_fk" FOREIGN KEY ("guide_publications_id") REFERENCES "payload"."guide_publications"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "buildings_rels_guides_id_idx" ON "payload"."buildings_rels" USING btree ("guides_id");
  CREATE INDEX "_buildings_v_rels_guides_id_idx" ON "payload"."_buildings_v_rels" USING btree ("guides_id");
  CREATE INDEX "payload_locked_documents_rels_building_slug_aliases_id_idx" ON "payload"."payload_locked_documents_rels" USING btree ("building_slug_aliases_id");
  CREATE INDEX "payload_locked_documents_rels_guides_id_idx" ON "payload"."payload_locked_documents_rels" USING btree ("guides_id");
  CREATE INDEX "payload_locked_documents_rels_guide_publications_id_idx" ON "payload"."payload_locked_documents_rels" USING btree ("guide_publications_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "payload"."building_slug_aliases" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "payload"."guides" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "payload"."guides_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "payload"."guides_texts" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "payload"."guides_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "payload"."_guides_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "payload"."_guides_v_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "payload"."_guides_v_texts" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "payload"."_guides_v_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "payload"."guide_publications" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "payload"."building_slug_aliases" CASCADE;
  DROP TABLE "payload"."guides" CASCADE;
  DROP TABLE "payload"."guides_locales" CASCADE;
  DROP TABLE "payload"."guides_texts" CASCADE;
  DROP TABLE "payload"."guides_rels" CASCADE;
  DROP TABLE "payload"."_guides_v" CASCADE;
  DROP TABLE "payload"."_guides_v_locales" CASCADE;
  DROP TABLE "payload"."_guides_v_texts" CASCADE;
  DROP TABLE "payload"."_guides_v_rels" CASCADE;
  DROP TABLE "payload"."guide_publications" CASCADE;
  ALTER TABLE "payload"."buildings_rels" DROP CONSTRAINT "buildings_rels_guides_fk";
  
  ALTER TABLE "payload"."_buildings_v_rels" DROP CONSTRAINT "_buildings_v_rels_guides_fk";
  
  ALTER TABLE "payload"."payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_building_slug_aliases_fk";
  
  ALTER TABLE "payload"."payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_guides_fk";
  
  ALTER TABLE "payload"."payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_guide_publications_fk";
  
  ALTER TABLE "payload"."counties" ALTER COLUMN "code" SET DATA TYPE text;
  DROP TYPE "payload"."enum_counties_code";
  CREATE TYPE "payload"."enum_counties_code" AS ENUM('RO-AB', 'RO-AG', 'RO-AR', 'RO-BC', 'RO-BH', 'RO-BN', 'RO-BR', 'RO-BT', 'RO-B', 'RO-BV', 'RO-BZ', 'RO-CJ', 'RO-CL', 'RO-CS', 'RO-CT', 'RO-CV', 'RO-DB', 'RO-DJ', 'RO-GJ', 'RO-GL', 'RO-GR', 'RO-HD', 'RO-HR', 'RO-IF', 'RO-IL', 'RO-IS', 'RO-MH', 'RO-MM', 'RO-MS', 'RO-NT', 'RO-OT', 'RO-PH', 'RO-SB', 'RO-SJ', 'RO-SM', 'RO-SV', 'RO-TL', 'RO-TM', 'RO-TR', 'RO-VL', 'RO-VN', 'RO-VS', 'RS-00', 'RS-01', 'RS-02', 'RS-03', 'RS-04', 'RS-05', 'RS-06', 'RS-07', 'RS-08', 'RS-09', 'RS-10', 'RS-11', 'RS-12', 'RS-13', 'RS-14', 'RS-15', 'RS-16', 'RS-17', 'RS-18', 'RS-19', 'RS-20', 'RS-21', 'RS-22', 'RS-23', 'RS-24', 'chernihiv', 'volyn', 'rivne', 'zhytomyr', 'kiev', 'kiev_city', 'zakarpattia', 'chernivtsi', 'ivano-frankivsk', 'odessa', 'vinnytsia', 'lviv', 'sumy', 'kharkiv', 'luhansk', 'donetsk', 'kherson', 'zaporizhzhya', 'mykolayiv', 'poltava', 'khmelnytsky', 'ternopil', 'dnipropetrovsk', 'cherkasy', 'kirovohrad', 'SKZI', 'SKPV', 'SKKI', 'SKBL', 'SKTA', 'SKTC', 'SKBC', 'SKNI');
  ALTER TABLE "payload"."counties" ALTER COLUMN "code" SET DATA TYPE "payload"."enum_counties_code" USING "code"::"payload"."enum_counties_code";
  ALTER TABLE "payload"."_counties_v" ALTER COLUMN "version_code" SET DATA TYPE text;
  DROP TYPE "payload"."enum__counties_v_version_code";
  CREATE TYPE "payload"."enum__counties_v_version_code" AS ENUM('RO-AB', 'RO-AG', 'RO-AR', 'RO-BC', 'RO-BH', 'RO-BN', 'RO-BR', 'RO-BT', 'RO-B', 'RO-BV', 'RO-BZ', 'RO-CJ', 'RO-CL', 'RO-CS', 'RO-CT', 'RO-CV', 'RO-DB', 'RO-DJ', 'RO-GJ', 'RO-GL', 'RO-GR', 'RO-HD', 'RO-HR', 'RO-IF', 'RO-IL', 'RO-IS', 'RO-MH', 'RO-MM', 'RO-MS', 'RO-NT', 'RO-OT', 'RO-PH', 'RO-SB', 'RO-SJ', 'RO-SM', 'RO-SV', 'RO-TL', 'RO-TM', 'RO-TR', 'RO-VL', 'RO-VN', 'RO-VS', 'RS-00', 'RS-01', 'RS-02', 'RS-03', 'RS-04', 'RS-05', 'RS-06', 'RS-07', 'RS-08', 'RS-09', 'RS-10', 'RS-11', 'RS-12', 'RS-13', 'RS-14', 'RS-15', 'RS-16', 'RS-17', 'RS-18', 'RS-19', 'RS-20', 'RS-21', 'RS-22', 'RS-23', 'RS-24', 'chernihiv', 'volyn', 'rivne', 'zhytomyr', 'kiev', 'kiev_city', 'zakarpattia', 'chernivtsi', 'ivano-frankivsk', 'odessa', 'vinnytsia', 'lviv', 'sumy', 'kharkiv', 'luhansk', 'donetsk', 'kherson', 'zaporizhzhya', 'mykolayiv', 'poltava', 'khmelnytsky', 'ternopil', 'dnipropetrovsk', 'cherkasy', 'kirovohrad', 'SKZI', 'SKPV', 'SKKI', 'SKBL', 'SKTA', 'SKTC', 'SKBC', 'SKNI');
  ALTER TABLE "payload"."_counties_v" ALTER COLUMN "version_code" SET DATA TYPE "payload"."enum__counties_v_version_code" USING "version_code"::"payload"."enum__counties_v_version_code";
  DROP INDEX "payload"."buildings_rels_guides_id_idx";
  DROP INDEX "payload"."_buildings_v_rels_guides_id_idx";
  DROP INDEX "payload"."payload_locked_documents_rels_building_slug_aliases_id_idx";
  DROP INDEX "payload"."payload_locked_documents_rels_guides_id_idx";
  DROP INDEX "payload"."payload_locked_documents_rels_guide_publications_id_idx";
  ALTER TABLE "payload"."buildings_rels" DROP COLUMN "guides_id";
  ALTER TABLE "payload"."_buildings_v_rels" DROP COLUMN "guides_id";
  ALTER TABLE "payload"."payload_locked_documents_rels" DROP COLUMN "building_slug_aliases_id";
  ALTER TABLE "payload"."payload_locked_documents_rels" DROP COLUMN "guides_id";
  ALTER TABLE "payload"."payload_locked_documents_rels" DROP COLUMN "guide_publications_id";
  DROP TYPE "payload"."enum_building_slug_aliases_locale";
  DROP TYPE "payload"."enum_guides_status";
  DROP TYPE "payload"."enum__guides_v_version_status";
  DROP TYPE "payload"."enum__guides_v_published_locale";`)
}
