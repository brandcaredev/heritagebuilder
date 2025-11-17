import { BuildingTypes } from "@/collections/building-types";
import { BuildingTypesMedia } from "@/collections/building-types-media";
import { Buildings } from "@/collections/buildings";
import { BuildingsMedia } from "@/collections/buildings-media";
import { Cities } from "@/collections/cities";
import { Countries } from "@/collections/countries";
import { CountriesMedia } from "@/collections/countries-media";
import { Counties } from "@/collections/county";
import { Media } from "@/collections/media";
import { Regions } from "@/collections/regions";
import { YoutubeLinks } from "@/collections/youtube-links";
import { env } from "@/env";
import AboutUs from "@/collections/globals/about-us";
import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { s3Storage } from "@payloadcms/storage-s3";
import { hu } from "@payloadcms/translations/languages/hu";
import path from "path";
import { buildConfig } from "payload";
import sharp from "sharp";
import { fileURLToPath } from "url";
import { searchPlugin } from "@payloadcms/plugin-search";
import { seoPlugin } from "@payloadcms/plugin-seo";
import { searchFields } from "@/collections/buildings/searchFields";
import { beforeSyncWithSearch } from "@/collections/buildings/beforeSync";
import { extractPlainTextFromRichtext } from "@/lib/seo-utils";
import Users from "@/collections/users";
import { BuildingSuggestions } from "@/collections/building-suggestions";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

export default buildConfig({
  // If you'd like to use Rich Text, pass your editor here
  editor: lexicalEditor(),

  // Define and configure your collections in this array
  collections: [
    Buildings,
    BuildingsMedia,
    BuildingTypes,
    BuildingTypesMedia,
    Countries,
    CountriesMedia,
    Regions,
    Counties,
    Cities,
    YoutubeLinks,
    Media,
    Users,
    BuildingSuggestions,
  ],

  // Add globals array with AboutUs
  globals: [AboutUs],

  // Your Payload secret - should be a complex and secure string, unguessable
  secret: env.PAYLOAD_SECRET || "",
  db: postgresAdapter({
    pool: { connectionString: env.DATABASE_URL || "" },
    schemaName: "payload",
    push: false,
  }),
  i18n: {
    fallbackLanguage: "hu",
    supportedLanguages: { hu },
  },
  localization: {
    defaultLocale: "hu",
    locales: ["en", "hu"],
    fallback: false,
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
        "buildings-media": {
          prefix: "building",
        },
        "building-types-media": {
          prefix: "building-type",
        },
        "countries-media": {
          prefix: "country",
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
    searchPlugin({
      collections: ["buildings"],
      searchOverrides: {
        slug: "search",
        fields: ({ defaultFields }) => [...defaultFields, ...searchFields],
        admin: {
          defaultColumns: ["slug", "name"],
          useAsTitle: "name",
          hidden: process.env.NODE_ENV === "production",
        },
      },
      beforeSync: beforeSyncWithSearch,
    }),
    seoPlugin({
      collections: ["buildings", "cities", "countries", "building-types"],
      globals: ["about-us"],
      uploadsCollection: "media",
      generateTitle: ({ doc }) =>
        `Heritage Builder | ${doc?.name || doc?.title}`,
      generateDescription: ({ doc }) => {
        // Extract plain text from richtext fields
        const plainText = extractPlainTextFromRichtext(
          doc?.summary || doc?.description,
        );
        return plainText || `Discover ${doc?.name || "heritage sites"}`;
      },
      generateURL: ({ doc, locale }) => {
        const baseUrl =
          process.env.NEXT_PUBLIC_SITE_URL || "https://heritagebuilder.com";
        return `${baseUrl}/${locale}/${doc?.slug}`;
      },
    }),
  ],
  sharp,
});
