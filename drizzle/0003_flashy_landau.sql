CREATE TABLE IF NOT EXISTS "CountyData" (
	"countyid" integer NOT NULL,
	"language" text NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	CONSTRAINT "CountyData_countyid_language_pk" PRIMARY KEY("countyid","language"),
	CONSTRAINT "CountyData_language_slug_unique" UNIQUE("language","slug")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "County" (
	"id" serial PRIMARY KEY NOT NULL,
	"countryid" text NOT NULL,
	"regionid" integer,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "Building" RENAME COLUMN "regionid" TO "countyid";--> statement-breakpoint
ALTER TABLE "City" RENAME COLUMN "regionid" TO "countyid";--> statement-breakpoint
ALTER TABLE "Building" DROP CONSTRAINT "Building_regionid_Region_id_fk";
--> statement-breakpoint
ALTER TABLE "City" DROP CONSTRAINT "City_regionid_Region_id_fk";
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "CountyData" ADD CONSTRAINT "CountyData_countyid_County_id_fk" FOREIGN KEY ("countyid") REFERENCES "public"."County"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "County" ADD CONSTRAINT "County_countryid_Country_id_fk" FOREIGN KEY ("countryid") REFERENCES "public"."Country"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "County" ADD CONSTRAINT "County_regionid_Region_id_fk" FOREIGN KEY ("regionid") REFERENCES "public"."Region"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Building" ADD CONSTRAINT "Building_countyid_County_id_fk" FOREIGN KEY ("countyid") REFERENCES "public"."County"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "City" ADD CONSTRAINT "City_countyid_County_id_fk" FOREIGN KEY ("countyid") REFERENCES "public"."County"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
