import type { CollectionConfig } from "payload";

export const BuildingSuggestions: CollectionConfig = {
  slug: "building-suggestions",
  admin: {
    hidden: process.env.NODE_ENV === "production", // Hide from admin navigation since we'll show it inline
  },
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
  hooks: {
    afterChange: [
      async ({ operation, doc, req }) => {
        if (operation === "create") {
          const data = await req.payload.findByID({
            collection: "buildings",
            id: doc.building.id ?? doc.building,
            select: {
              suggestionsCount: true,
            },
            req,
          });
          if (data) {
            await req.payload.update({
              collection: "buildings",
              id: doc.building.id ?? doc.building,
              data: {
                suggestionsCount: (data.suggestionsCount ?? 0) + 1,
              },
              req,
            });
          }
        }
      },
    ],
    afterDelete: [
      async ({ doc, req }) => {
        const data = await req.payload.findByID({
          collection: "buildings",
          id: doc.building.id,
          select: {
            suggestionsCount: true,
          },
          req,
        });
        if (data?.suggestionsCount) {
          await req.payload.update({
            collection: "buildings",
            id: doc.building.id,
            data: {
              suggestionsCount: data.suggestionsCount - 1,
            },
            req,
          });
        }
      },
    ],
  },
};
