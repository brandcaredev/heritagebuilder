import createNextIntlPlugin from "next-intl/plugin";
await import("./src/env.js");

const withNextIntl = createNextIntlPlugin();

/** @type {import("next").NextConfig} */
const config = { images: { domains: ["s3-alpha-sig.figma.com"] } };

export default withNextIntl(config);
