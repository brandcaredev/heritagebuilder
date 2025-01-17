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
    ],
  },
  experimental: {
    dynamicIO: true,
    serverActions: {
      bodySizeLimit: "15mb",
    },
  },
};

export default withPayload(withNextIntl(config));
