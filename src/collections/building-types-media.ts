import type { CollectionConfig } from "payload";
import { cacheableImageUploadConfig } from "./shared/upload-config";

export const BuildingTypesMedia: CollectionConfig = {
  slug: "building-types-media",
  upload: {
    ...cacheableImageUploadConfig,
    imageSizes: [
      {
        name: "thumbnail",
        width: 200,
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
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user), // Only logged in users can update
    delete: ({ req: { user } }) => Boolean(user), // Only logged in users can delete
  },
};
