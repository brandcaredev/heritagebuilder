import { authenticatedOrPublished } from "@/access/authenticatesOrPublished";
import { checkSlugUniqueness } from "@/hooks/slug-uniqueness";
import { formatSlug } from "@/lib/utils";
import { revalidatePath, revalidateTag } from "next/cache";
import type { CollectionConfig } from "payload";
import { isNextBuild } from "payload/shared";

export const Cities: CollectionConfig = {
  slug: "cities",
  fields: [
    {
      name: "name",
      type: "text",
      required: true,
      localized: true,
      index: true,
    },
    {
      name: "slug",
      type: "text",
      required: true,
      localized: true,
      index: true,
      hooks: {
        beforeValidate: [formatSlug("name")],
      },
      admin: {
        position: "sidebar",
        readOnly: true,
      },
    },
    {
      name: "description",
      type: "textarea",
      localized: true,
    },
    {
      name: "position",
      type: "point",
      admin: {
        components: {
          Field: "@/collections/cities/custom-position-selector#default",
        },
      },
    },
    {
      name: "country",
      type: "relationship",
      relationTo: "countries",
      required: true,
    },
    {
      name: "county",
      type: "relationship",
      relationTo: "counties",
      required: true,
    },
    {
      name: "relatedBuildings",
      type: "join",
      collection: "buildings",
      on: "city",
      where: {
        _status: {
          equals: "published",
        },
      },
    },
  ],
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "slug", "description", "_status"],
  },
  versions: {
    drafts: true,
  },
  hooks: {
    beforeChange: [checkSlugUniqueness("cities")],
    afterChange: [
      ({ doc, previousDoc }) => {
        if (doc._status === "draft" && previousDoc?._status !== "published") {
          return;
        }
        // if (!isNextBuild()) {
        //   if (doc.slug !== previousDoc?.slug) {
        //     revalidatePath("/[locale]/(main)/city/[slug]", "page");
        //   } else {
        //     revalidatePath(`/[locale]/(main)/city/${doc.slug}`, "page");
        //   }
        // }
      },
    ],
    afterDelete: [
      () => {
        if (!isNextBuild()) {
          revalidateTag("cities");
        }
      },
    ],
  },
  access: {
    read: authenticatedOrPublished,
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user), // Only logged in users can update
    delete: ({ req: { user } }) => Boolean(user), // Only logged in users can delete
  },
};
