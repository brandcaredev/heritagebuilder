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
  ],
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
