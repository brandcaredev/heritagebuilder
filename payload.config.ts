import { BuildingTypes } from "@/collections/building-types";
import { Buildings } from "@/collections/buildings";
import { Cities } from "@/collections/cities";
import { Countries } from "@/collections/countries";
import { Counties } from "@/collections/county";
import { Media } from "@/collections/media";
import { Regions } from "@/collections/regions";
import { YoutubeLinks } from "@/collections/youtube-links";
import { env } from "@/env";
import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { s3Storage } from "@payloadcms/storage-s3";
import { hu } from "@payloadcms/translations/languages/hu";
import path from "path";
import { buildConfig } from "payload";
import sharp from "sharp";
import { fileURLToPath } from "url";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

export default buildConfig({
  // If you'd like to use Rich Text, pass your editor here
  editor: lexicalEditor(),

  // Define and configure your collections in this array
  collections: [
    Countries,
    Buildings,
    Media,
    Regions,
    Counties,
    Cities,
    BuildingTypes,
    YoutubeLinks,
  ],

  // Your Payload secret - should be a complex and secure string, unguessable
  secret: process.env.PAYLOAD_SECRET || "",
  db: postgresAdapter({
    pool: { connectionString: process.env.DATABASE_URL || "" },
    schemaName: "payload",
  }),
  i18n: {
    fallbackLanguage: "hu",
    supportedLanguages: { hu },
  },
  localization: {
    defaultLocale: "hu",
    locales: ["en", "hu"],
  },
  typescript: {
    outputFile: path.resolve(dirname, "payload-types.ts"),
  },
  plugins: [
    s3Storage({
      collections: {
        media: {
          prefix: "media",
        },
      },
      bucket: env.S3_BUCKET,
      config: {
        forcePathStyle: true, // Important for using Supabase
        credentials: {
          accessKeyId: env.S3_ACCESS_KEY_ID,
          secretAccessKey: env.S3_SECRET_ACCESS_KEY,
        },
        region: env.S3_REGION,
        endpoint: env.S3_ENDPOINT,
      },
    }),
  ],
  sharp,
});
