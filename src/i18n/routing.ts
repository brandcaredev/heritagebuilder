import { defineRouting } from "next-intl/routing";
import { createNavigation } from "next-intl/navigation";

export const locales = ["en", "hu"];

export const routing = defineRouting({
  // A list of all locales that are supported
  locales: locales,

  // Used when no locale matches
  defaultLocale: "en",

  // The `pathnames` object holds pairs of internal and
  // external paths. Based on the locale, the external
  // paths are rewritten to the shared, internal ones.
  pathnames: {
    "/": "/",
    "/country/[slug]": {
      en: "/country/[slug]",
      hu: "/orszag/[slug]",
    },
    "/region/[slug]": {
      en: "/region/[slug]",
      hu: "/regio/[slug]",
    },
  },
});

// Lightweight wrappers around Next.js' navigation APIs
// that will consider the routing configuration
export const { Link, redirect, usePathname, useRouter } =
  createNavigation(routing);
