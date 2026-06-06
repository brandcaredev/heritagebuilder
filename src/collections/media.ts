import type { CollectionConfig } from "payload";
import { cacheableImageUploadConfig } from "./shared/upload-config";

export const Media: CollectionConfig = {
  slug: "media",
  upload: {
    ...cacheableImageUploadConfig,
    staticDir: "media",
    imageSizes: [
      {
        name: "thumbnail",
        width: 400,
        height: 300,
        position: "centre",
      },
      {
        name: "card",
        width: 768,
        height: 1024,
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
