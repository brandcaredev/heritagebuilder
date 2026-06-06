import type { CollectionConfig } from "payload";
import { cacheableImageUploadConfig } from "./shared/upload-config";

export const CountriesMedia: CollectionConfig = {
  slug: "countries-media",
  upload: {
    ...cacheableImageUploadConfig,
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
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user), // Only logged in users can update
    delete: ({ req: { user } }) => Boolean(user), // Only logged in users can delete
  },
};
