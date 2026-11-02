import type { CollectionConfig } from "payload";

/**
 * Historical slugs for cities and counties. The entity type is part of the
 * unique key because the same slug can safely exist in both route families.
 */
export const LocationSlugAliases: CollectionConfig = {
  slug: "location-slug-aliases",
  admin: {
    hidden: ({ user }) => user?.role !== "admin",
  },
  access: {
    create: () => false,
    delete: () => false,
    read: ({ req: { user } }) => user?.role === "admin",
    update: () => false,
  },
  indexes: [
    {
      fields: ["slug", "locale", "entityType"],
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
      name: "entityType",
      type: "select",
      required: true,
      options: [
        { label: "City", value: "city" },
        { label: "County", value: "county" },
      ],
    },
    {
      name: "city",
      type: "relationship",
      relationTo: "cities",
    },
    {
      name: "county",
      type: "relationship",
      relationTo: "counties",
    },
  ],
};
