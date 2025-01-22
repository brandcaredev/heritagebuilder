import type { CollectionConfig } from "payload";

export const BuildingSuggestions: CollectionConfig = {
  slug: "building-suggestions",
  // admin: {
  //   hidden: true, // Hide from admin navigation since we'll show it inline
  // },
  fields: [
    {
      name: "building",
      type: "relationship",
      relationTo: "buildings",
      required: true,
    },
    {
      name: "field",
      type: "select",
      required: true,
      options: [
        { label: "Name", value: "name" },
        { label: "Summary", value: "summary" },
        { label: "History", value: "history" },
        { label: "Style", value: "style" },
        { label: "Present Day", value: "presentDay" },
        { label: "Famous Residents", value: "famousResidents" },
        { label: "Renovation", value: "renovation" },
      ],
    },
    {
      name: "suggestedContent",
      type: "textarea",
      required: true,
    },
    {
      name: "status",
      type: "select",
      defaultValue: "pending",
      options: [
        { label: "Pending", value: "pending" },
        { label: "Reviewed", value: "reviewed" },
      ],
    },
    {
      name: "submitterName",
      type: "text",
    },
  ],
  access: {
    read: ({ req: { user } }) => Boolean(user),
    create: () => true,
    update: ({ req: { user } }) => Boolean(user), // Only logged in users can update
    delete: ({ req: { user } }) => Boolean(user), // Only logged in users can delete
  },
};
