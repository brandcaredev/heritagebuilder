ALTER TABLE "City" ADD COLUMN "countryid" integer;--> statement-breakpoint
ALTER TABLE "City" ADD COLUMN "regionid" integer;--> statement-breakpoint
ALTER TABLE "Region" ADD COLUMN "countryid" integer;--> statement-breakpoint
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
 ALTER TABLE "Region" ADD CONSTRAINT "Region_countryid_Country_id_fk" FOREIGN KEY ("countryid") REFERENCES "public"."Country"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
