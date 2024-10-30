CREATE TABLE IF NOT EXISTS "BuildingType" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text,
	"name" text,
	"img" text,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp with time zone,
	CONSTRAINT "BuildingType_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Building" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text,
	"name" text,
	"img" text,
	"cityid" integer,
	"buildingtypeid" integer,
	"countryid" integer,
	"regionid" integer,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp with time zone,
	CONSTRAINT "Building_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "City" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text,
	"name" text,
	"img" text,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp with time zone,
	CONSTRAINT "City_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Country" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text,
	"name" text,
	"img" text,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp with time zone,
	CONSTRAINT "Country_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Region" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text,
	"name" text,
	"img" text,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp with time zone,
	CONSTRAINT "Region_slug_unique" UNIQUE("slug")
);
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
