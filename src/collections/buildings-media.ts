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
    update: () => true,
    delete: () => true,
  },
};
