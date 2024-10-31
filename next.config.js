import createNextIntlPlugin from "next-intl/plugin";
await import("./src/env.js");

const withNextIntl = createNextIntlPlugin();

/** @type {import("next").NextConfig} */
const config = {
  images: {
    domains: [process.env.NEXT_PUBLIC_SUPABASE_URL?.split("//")[1] ?? ""],
  },
};

export default withNextIntl(config);
