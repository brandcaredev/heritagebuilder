import { revalidateTag } from "next/cache";
import type { CollectionConfig } from "payload";

export const Countries: CollectionConfig = {
  slug: "countries",
  fields: [
    {
      name: "id",
      required: true,
      type: "text",
    },
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
      name: "image",
      type: "upload",
      required: true,
      relationTo: "media",
    },
    {
      name: "relatedBuildings",
      type: "join",
      collection: "buildings",
      on: "country",
    },
  ],
  hooks: {
    afterChange: [
      () => {
        revalidateTag("countries");
      },
    ],
  },
  versions: {
    drafts: true,
  },
  access: {
    read: () => true,
    create: () => true,
    update: () => true,
    delete: () => true,
  },
};
