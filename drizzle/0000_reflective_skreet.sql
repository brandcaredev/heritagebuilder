CREATE TABLE IF NOT EXISTS "BuildingData" (
	"buildingid" integer PRIMARY KEY NOT NULL,
	"language" text NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"history" text NOT NULL,
	"style" text NOT NULL,
	"presentday" text NOT NULL,
	"famousresidents" text,
	"renovation" text,
	CONSTRAINT "BuildingData_slug_unique" UNIQUE("slug"),
	CONSTRAINT "BuildingData_language_slug_unique" UNIQUE("language","slug")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "BuildingTypeData" (
	"buildingtypeid" integer PRIMARY KEY NOT NULL,
	"languageid" text NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	CONSTRAINT "BuildingTypeData_languageid_slug_unique" UNIQUE("languageid","slug")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "BuildingType" (
	"id" serial PRIMARY KEY NOT NULL,
	"img" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Building" (
	"id" serial PRIMARY KEY NOT NULL,
	"featuredimage" text NOT NULL,
	"images" text[] NOT NULL,
	"disabled" boolean DEFAULT true,
	"position" geometry(point) NOT NULL,
	"cityid" integer NOT NULL,
	"buildingtypeid" integer NOT NULL,
	"countryid" text NOT NULL,
	"regionid" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "CityData" (
	"cityid" integer PRIMARY KEY NOT NULL,
	"language" text NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	CONSTRAINT "CityData_language_slug_unique" UNIQUE("language","slug")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "City" (
	"id" serial PRIMARY KEY NOT NULL,
	"countryid" text NOT NULL,
	"regionid" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Country" (
	"id" text PRIMARY KEY NOT NULL,
	"img" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "CountryData" (
	"countryid" text PRIMARY KEY NOT NULL,
	"language" text NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	CONSTRAINT "CountryData_language_slug_unique" UNIQUE("language","slug")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "RegionData" (
	"regionid" integer PRIMARY KEY NOT NULL,
	"language" text NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	CONSTRAINT "RegionData_language_slug_unique" UNIQUE("language","slug")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Region" (
	"id" serial PRIMARY KEY NOT NULL,
	"countryid" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "BuildingData" ADD CONSTRAINT "BuildingData_buildingid_Building_id_fk" FOREIGN KEY ("buildingid") REFERENCES "public"."Building"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "BuildingTypeData" ADD CONSTRAINT "BuildingTypeData_buildingtypeid_BuildingType_id_fk" FOREIGN KEY ("buildingtypeid") REFERENCES "public"."BuildingType"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Building" ADD CONSTRAINT "Building_cityid_City_id_fk" FOREIGN KEY ("cityid") REFERENCES "public"."City"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Building" ADD CONSTRAINT "Building_buildingtypeid_BuildingType_id_fk" FOREIGN KEY ("buildingtypeid") REFERENCES "public"."BuildingType"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Building" ADD CONSTRAINT "Building_countryid_Country_id_fk" FOREIGN KEY ("countryid") REFERENCES "public"."Country"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Building" ADD CONSTRAINT "Building_regionid_Region_id_fk" FOREIGN KEY ("regionid") REFERENCES "public"."Region"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "CityData" ADD CONSTRAINT "CityData_cityid_City_id_fk" FOREIGN KEY ("cityid") REFERENCES "public"."City"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "City" ADD CONSTRAINT "City_countryid_Country_id_fk" FOREIGN KEY ("countryid") REFERENCES "public"."Country"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "City" ADD CONSTRAINT "City_regionid_Region_id_fk" FOREIGN KEY ("regionid") REFERENCES "public"."Region"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "RegionData" ADD CONSTRAINT "RegionData_regionid_Region_id_fk" FOREIGN KEY ("regionid") REFERENCES "public"."Region"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Region" ADD CONSTRAINT "Region_countryid_Country_id_fk" FOREIGN KEY ("countryid") REFERENCES "public"."Country"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
