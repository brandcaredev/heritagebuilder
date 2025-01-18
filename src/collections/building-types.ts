import type { CollectionConfig } from "payload";

export const BuildingTypes: CollectionConfig = {
  slug: "building-types",
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
      name: "image",
      type: "upload",
      required: true,
      relationTo: "building-types-media",
    },
    {
      name: "relatedBuildings",
      type: "join",
      collection: "buildings",
      on: "buildingType",
    },
  ],
  admin: {
    useAsTitle: "name",
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
