import type { CollectionConfig } from "payload";
import { cacheableImageUploadConfig } from "./shared/upload-config";

export const BuildingsMedia: CollectionConfig = {
  slug: "buildings-media",
  upload: {
    ...cacheableImageUploadConfig,
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
        name: "gallery",
        width: 1600,
        position: "centre",
        withoutEnlargement: true,
        formatOptions: {
          format: "webp",
          options: {
            quality: 82,
          },
        },
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
