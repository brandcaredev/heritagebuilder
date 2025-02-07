import CustomAdminError from "@/lib/errorClasses";
import { CollectionBeforeChangeHook, CollectionSlug } from "payload";

export const checkSlugUniqueness =
  (collection: CollectionSlug): CollectionBeforeChangeHook =>
  async ({ data, req, operation, originalDoc }) => {
    if (operation === "update" && data._status !== "draft") {
      const slugValue = data.slug;
      if (!slugValue) return; // Skip empty slugs

      const existingDocs = await req.payload.find({
        collection: collection,
        locale: req.locale,
        where: {
          slug: {
            equals: slugValue, // Check only for the same locale
          },
        },
      });
      // Check if another document already has the same slug in this locale
      const isDuplicate = existingDocs.docs.some(
        (doc) => doc.id !== originalDoc.id, // Ignore current document
      );

      if (isDuplicate) {
        throw new CustomAdminError(
          `The slug "${slugValue}" is already in use.`,
          409,
        );
      }
    }
  };
