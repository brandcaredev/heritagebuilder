import { authenticatedOrPublished } from "@/access/authenticatesOrPublished";
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
    },
    {
      name: "slug",
      type: "text",
      required: true,
      localized: true,
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
  },
  versions: {
    drafts: {
      autosave: true,
    },
  },
  hooks: {
    afterChange: [
      () => {
        if (!isNextBuild()) {
          revalidateTag(`regions`);
        }
      },
    ],
    afterDelete: [
      () => {
        if (!isNextBuild()) {
          revalidateTag(`regions`);
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
