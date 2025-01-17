import type { CollectionConfig } from "payload";

export const Counties: CollectionConfig = {
  slug: "counties",
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
      name: "description",
      type: "textarea",
      localized: true,
    },
    {
      name: "position",
      type: "point",
    },
    {
      name: "country",
      type: "relationship",
      relationTo: "countries",
      required: true,
    },
    {
      name: "region",
      type: "relationship",
      relationTo: "regions",
    },
    {
      name: "relatedBuildings",
      type: "join",
      collection: "buildings",
      on: "county",
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
