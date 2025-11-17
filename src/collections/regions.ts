import { authenticatedOrPublished } from "@/access/authenticatesOrPublished";
import { checkSlugUniqueness } from "@/hooks/slug-uniqueness";
import { formatSlug } from "@/lib/utils";
import { revalidateTag } from "next/cache";
import type { CollectionConfig } from "payload";
import { isNextBuild } from "payload/shared";

export const Regions: CollectionConfig = {
  slug: "regions",
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
      name: "country",
      type: "relationship",
      relationTo: "countries",
      required: true,
    },
    {
      name: "relatedCounties",
      type: "join",
      collection: "counties",
      on: "region",
    },
  ],
  admin: {
    useAsTitle: "name",
    defaultColumns: ["id", "name", "slug", "_status"],
  },
  versions: {
    drafts: true,
  },
  hooks: {
    beforeChange: [checkSlugUniqueness("regions")],
    afterChange: [
      ({ doc, previousDoc }) => {
        if (doc._status === "draft" && previousDoc?._status !== "published") {
          return;
        }
        if (!isNextBuild()) {
          revalidateTag(`regions`, "max");
        }
      },
    ],
    afterDelete: [
      () => {
        if (!isNextBuild()) {
          revalidateTag(`regions`, "max");
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
