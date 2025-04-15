import type { CollectionConfig } from "payload";

export const CountriesMedia: CollectionConfig = {
  slug: "countries-media",
  upload: {
    imageSizes: [
      {
        name: "thumbnail",
        width: 400,
        height: 300,
        position: "centre",
      },
      {
        name: "main",
        width: 600,
        height: 400,
        position: "centre",
      },
      {
        name: "og",
        width: 1200,
        height: 630,
        crop: "center",
      },
    ],
    adminThumbnail: "thumbnail",
    mimeTypes: ["image/*"],
  },
  fields: [
    {
      name: "alt",
      type: "text",
    },
  ],
  access: {
    read: () => true,
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user), // Only logged in users can update
    delete: ({ req: { user } }) => Boolean(user), // Only logged in users can delete
  },
};
