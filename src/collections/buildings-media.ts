import type { CollectionConfig } from "payload";

export const BuildingsMedia: CollectionConfig = {
  slug: "buildings-media",
  upload: {
    imageSizes: [
      // list and main page
      {
        name: "thumbnail",
        width: 100,
        height: 100,
        position: "centre",
      },
      {
        name: "card",
        width: 300,
        height: 200,
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
    create: () => true,
    update: ({ req: { user } }) => Boolean(user), // Only logged in users can update
    delete: ({ req: { user } }) => Boolean(user), // Only logged in users can delete
  },
};
