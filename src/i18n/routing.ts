import { defineRouting } from "next-intl/routing";
import { createNavigation } from "next-intl/navigation";
import { Locales } from "@/lib/constans";

export const routing = defineRouting({
  // A list of all locales that are supported
  locales: Object.keys(Locales),

  // Used when no locale matches
  defaultLocale: "hu",

  localePrefix: "always",

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
      hu: "/megye/[slug]",
    },
    "/city/[slug]": {
      en: "/city/[slug]",
      hu: "/varos/[slug]",
    },
    "/region/[slug]": {
      en: "/region/[slug]",
      hu: "/regio/[slug]",
    },
    "/building/[slug]": {
      en: "/building/[slug]",
      hu: "/epulet/[slug]",
    },
    "/building-type/[slug]": {
      en: "/building-type/[slug]",
      hu: "/epulet-tipus/[slug]",
    },
    "/search/[slug]": {
      en: "/search/[slug]",
      hu: "/kereses/[slug]",
    },
    "/terms-of-service": {
      en: "/terms-of-service",
      hu: "/szerzodes",
    },
    "/privacy-policy": {
      en: "/privacy-policy",
      hu: "/adatvedelmi-iranyelvek",
    },
    "/cookies-policy": {
      en: "/cookies-policy",
      hu: "/suti-iranyelvek",
    },
    "/about-us": {
      en: "/about-us",
      hu: "/rolunk",
    },
    "/map": {
      en: "/map",
      hu: "/terkep",
    },
    "/new": {
      en: "/new",
      hu: "/uj",
    },
    "/login": {
      en: "/login",
      hu: "/bejelentkezes",
    },
    "/register": {
      en: "/register",
      hu: "/regisztracio",
    },
    "/reset-password": {
      en: "/reset-password",
      hu: "/jelszo-visszaallitas",
    },

    admin: "admin",
  },
});

// Lightweight wrappers around Next.js' navigation APIs
// that will consider the routing configuration
export const { Link, redirect, usePathname, useRouter } =
  createNavigation(routing);
