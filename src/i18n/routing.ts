import { defineRouting } from "next-intl/routing";
import { createNavigation } from "next-intl/navigation";
import { locales } from "@/lib/constans";

export const routing = defineRouting({
  // A list of all locales that are supported
  locales: Object.keys(locales),

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
    "/county/[slug]": {
      en: "/county/[slug]",
      hu: "/county/[slug]",
    },
    "/building/[slug]": {
      en: "/building/[slug]",
      hu: "/épület/[slug]",
    },
    "/building-type/[slug]": {
      en: "/building-type/[slug]",
      hu: "/épület-típus/[slug]",
    },
    "/new": {
      en: "/new",
      hu: "/új",
    },
  },
});

// Lightweight wrappers around Next.js' navigation APIs
// that will consider the routing configuration
export const { Link, redirect, usePathname, useRouter } =
  createNavigation(routing);
