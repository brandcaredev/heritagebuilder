import createNextIntlPlugin from "next-intl/plugin";
import { withPayload } from "@payloadcms/next/withPayload";
await import("./src/env.js");

const withNextIntl = createNextIntlPlugin();

/** @type {import("next").NextConfig} */
const config = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: process.env.NEXT_PUBLIC_SUPABASE_URL?.split("//")[1] ?? "",
      },
      {
        protocol: "http",
        hostname: "localhost",
      },
      {
        protocol: "https",
        hostname: process.env.NEXT_PUBLIC_VERCEL_URL ?? "localhost",
      },
      {
        protocol: "https",
        hostname:
          process.env.NEXT_PUBLIC_SITE_URL?.split("//")[1] ?? "localhost",
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "7mb",
    },
  },
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
};

export default withPayload(withNextIntl(config));
