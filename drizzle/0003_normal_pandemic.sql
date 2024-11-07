ALTER TABLE "BuildingType" ALTER COLUMN "slug" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "BuildingType" ALTER COLUMN "name" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "BuildingType" ALTER COLUMN "img" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "Building" ALTER COLUMN "slug" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "Building" ALTER COLUMN "name" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "Building" ALTER COLUMN "img" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "Building" ALTER COLUMN "cityid" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "City" ALTER COLUMN "slug" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "City" ALTER COLUMN "name" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "City" ALTER COLUMN "countryid" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "City" ALTER COLUMN "regionid" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "Country" ALTER COLUMN "slug" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "Country" ALTER COLUMN "name" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "Country" ALTER COLUMN "img" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "Region" ALTER COLUMN "slug" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "Region" ALTER COLUMN "name" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "Region" ALTER COLUMN "countryid" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "Country" ADD COLUMN "location" geometry(point)
