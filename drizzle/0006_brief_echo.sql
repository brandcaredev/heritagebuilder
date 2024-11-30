CREATE TABLE IF NOT EXISTS "YoutubeLink" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"url" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "CityData" ADD COLUMN "description" text;--> statement-breakpoint
ALTER TABLE "CountyData" ADD COLUMN "description" text;