import type { CollectionConfig } from "payload";

export const BuildingTypesMedia: CollectionConfig = {
  slug: "building-types-media",
  upload: {
    imageSizes: [
      {
        name: "thumbnail",
        width: 200,
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
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user), // Only logged in users can update
    delete: ({ req: { user } }) => Boolean(user), // Only logged in users can delete
  },
};
