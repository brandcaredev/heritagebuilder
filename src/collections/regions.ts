import { revalidateTag } from "next/cache";
import type { CollectionConfig } from "payload";

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
    drafts: true,
  },
  hooks: {
    afterChange: [
      () => {
        revalidateTag(`regions`);
      },
    ],
    afterDelete: [
      () => {
        revalidateTag(`regions`);
      },
    ],
  },
  access: {
    read: () => true,
    create: () => true,
    update: () => true,
    delete: () => true,
  },
};
