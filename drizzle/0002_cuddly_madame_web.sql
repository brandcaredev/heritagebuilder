/* 
    Unfortunately in current drizzle-kit version we can't automatically get name for primary key.
    We are working on making it available!

    Meanwhile you can:
        1. Check pk name in your database, by running
            SELECT constraint_name FROM information_schema.table_constraints
            WHERE table_schema = 'public'
                AND table_name = 'BuildingData'
                AND constraint_type = 'PRIMARY KEY';
        2. Uncomment code below and paste pk name manually
        
    Hope to release this update as soon as possible
*/

-- ALTER TABLE "BuildingData" DROP CONSTRAINT "<constraint_name>";--> statement-breakpoint
/* 
    Unfortunately in current drizzle-kit version we can't automatically get name for primary key.
    We are working on making it available!

    Meanwhile you can:
        1. Check pk name in your database, by running
            SELECT constraint_name FROM information_schema.table_constraints
            WHERE table_schema = 'public'
                AND table_name = 'BuildingTypeData'
                AND constraint_type = 'PRIMARY KEY';
        2. Uncomment code below and paste pk name manually
        
    Hope to release this update as soon as possible
*/

-- ALTER TABLE "BuildingTypeData" DROP CONSTRAINT "<constraint_name>";--> statement-breakpoint
/* 
    Unfortunately in current drizzle-kit version we can't automatically get name for primary key.
    We are working on making it available!

    Meanwhile you can:
        1. Check pk name in your database, by running
            SELECT constraint_name FROM information_schema.table_constraints
            WHERE table_schema = 'public'
                AND table_name = 'CityData'
                AND constraint_type = 'PRIMARY KEY';
        2. Uncomment code below and paste pk name manually
        
    Hope to release this update as soon as possible
*/

-- ALTER TABLE "CityData" DROP CONSTRAINT "<constraint_name>";--> statement-breakpoint
/* 
    Unfortunately in current drizzle-kit version we can't automatically get name for primary key.
    We are working on making it available!

    Meanwhile you can:
        1. Check pk name in your database, by running
            SELECT constraint_name FROM information_schema.table_constraints
            WHERE table_schema = 'public'
                AND table_name = 'RegionData'
                AND constraint_type = 'PRIMARY KEY';
        2. Uncomment code below and paste pk name manually
        
    Hope to release this update as soon as possible
*/

-- ALTER TABLE "RegionData" DROP CONSTRAINT "<constraint_name>";--> statement-breakpoint
ALTER TABLE "BuildingData" ADD CONSTRAINT "BuildingData_buildingid_language_pk" PRIMARY KEY("buildingid","language");--> statement-breakpoint
ALTER TABLE "BuildingTypeData" ADD CONSTRAINT "BuildingTypeData_buildingtypeid_languageid_pk" PRIMARY KEY("buildingtypeid","languageid");--> statement-breakpoint
ALTER TABLE "CityData" ADD CONSTRAINT "CityData_cityid_language_pk" PRIMARY KEY("cityid","language");--> statement-breakpoint
ALTER TABLE "RegionData" ADD CONSTRAINT "RegionData_regionid_language_pk" PRIMARY KEY("regionid","language");