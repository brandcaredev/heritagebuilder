import type { CollectionConfig } from "payload";

/**
 * Permanent, indexed mappings from a retired building slug to its building.
 * These records are written by the Buildings afterChange hook. The local admin
 * can inspect them, while only the public building route reads them in production.
 */
export const BuildingSlugAliases: CollectionConfig = {
  slug: "building-slug-aliases",
  access: {
    create: () => false,
    delete: () => false,
    read: ({ req }) => Boolean(req.user),
    update: () => false,
  },
  indexes: [
    {
      fields: ["slug", "locale"],
      unique: true,
    },
  ],
  fields: [
    {
      name: "slug",
      type: "text",
      required: true,
    },
    {
      name: "locale",
      type: "select",
      required: true,
      options: [
        { label: "English", value: "en" },
        { label: "Hungarian", value: "hu" },
      ],
    },
    {
      name: "building",
      type: "relationship",
      relationTo: "buildings",
      required: true,
    },
  ],
};
