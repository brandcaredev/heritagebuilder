import type { CollectionAfterChangeHook } from "payload";
import type { Building } from "payload-types";

const supportedLocales = ["en", "hu"] as const;

export const recordBuildingSlugAlias: CollectionAfterChangeHook<Building> =
  async ({ doc, operation, previousDoc, req }) => {
    if (operation !== "update" || !previousDoc?.slug || !doc.slug) return doc;
    if (previousDoc.slug === doc.slug) return doc;

    const locale = req.locale;
    if (!supportedLocales.includes(locale as (typeof supportedLocales)[number])) {
      return doc;
    }

    const existingAlias = await req.payload.find({
      collection: "building-slug-aliases",
      depth: 0,
      limit: 1,
      overrideAccess: true,
      req,
      where: {
        and: [
          { slug: { equals: previousDoc.slug } },
          { locale: { equals: locale } },
        ],
      },
    });

    // Keep the first owner of an old path. A current building slug takes
    // precedence in the route, and an old path must never be reassigned.
    if (existingAlias.docs.length > 0) return doc;

    try {
      await req.payload.create({
        collection: "building-slug-aliases",
        data: {
          slug: previousDoc.slug,
          locale: locale as "en" | "hu",
          building: doc.id,
        },
        overrideAccess: true,
        req,
      });
    } catch (error) {
      // Concurrent edits can race on the unique (slug, locale) index. The
      // building update itself should still succeed; the first alias wins.
      req.payload.logger.warn({
        err: error,
        msg: `Could not record previous building slug "${previousDoc.slug}" (${locale}).`,
      });
    }

    return doc;
  };
