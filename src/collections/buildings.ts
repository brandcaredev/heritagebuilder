import type { CollectionConfig } from "payload";

export const Buildings: CollectionConfig = {
  slug: "buildings",
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
      name: "buildingType",
      type: "relationship",
      relationTo: "building-types",
      required: true,
    },
    {
      name: "history",
      type: "textarea",
      localized: true,
      required: true,
    },
    {
      name: "style",
      type: "textarea",
      localized: true,
      required: true,
    },
    {
      name: "presentDay",
      type: "textarea",
      localized: true,
      required: true,
    },
    {
      name: "famousResidents",
      type: "textarea",
      localized: true,
    },
    {
      name: "renovation",
      type: "textarea",
      localized: true,
    },
    {
      name: "featuredImage",
      type: "upload",
      required: true,
      relationTo: "media",
    },
    {
      name: "images",
      type: "upload",
      hasMany: true,
      relationTo: "media",
      required: true,
    },
    {
      name: "position",
      type: "point",
      required: true,
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
    },
    {
      name: "city",
      type: "relationship",
      relationTo: "cities",
    },
    {
      name: "creatorName",
      type: "text",
    },
    {
      name: "creatorEmail",
      type: "text",
    },
    {
      name: "status",
      type: "text",
      required: true,
      defaultValue: "pending",
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
