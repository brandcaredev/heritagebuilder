import type { CollectionAfterChangeHook } from "payload";

type LocationType = "city" | "county";
const supportedLocales = ["en", "hu"] as const;

export const recordLocationSlugAlias = (
  entityType: LocationType,
): CollectionAfterChangeHook =>
  async ({ doc, operation, previousDoc, req }) => {
    if (operation !== "update" || !previousDoc?.slug || !doc.slug) return doc;
    if (previousDoc.slug === doc.slug) return doc;

    const locale = req.locale;
    if (!supportedLocales.includes(locale as (typeof supportedLocales)[number])) {
      return doc;
    }

    const existingAlias = await req.payload.find({
      collection: "location-slug-aliases",
      depth: 0,
      limit: 1,
      overrideAccess: true,
      req,
      where: {
        and: [
          { slug: { equals: previousDoc.slug } },
          { locale: { equals: locale } },
          { entityType: { equals: entityType } },
        ],
      },
    });

    // Keep the first owner of an old path. Current slugs are resolved before
    // aliases, so a current document always takes precedence.
    if (existingAlias.docs.length > 0) return doc;

    const relation =
      entityType === "city" ? { city: doc.id } : { county: doc.id };

    try {
      await req.payload.create({
        collection: "location-slug-aliases",
        data: {
          slug: previousDoc.slug,
          locale: locale as "en" | "hu",
          entityType,
          ...relation,
        },
        overrideAccess: true,
        req,
      });
    } catch (error) {
      // Concurrent edits can race on the unique index. The location update
      // should still succeed; the first alias wins.
      req.payload.logger.warn({
        err: error,
        msg: `Could not record previous ${entityType} slug "${previousDoc.slug}" (${locale}).`,
      });
    }

    return doc;
  };
