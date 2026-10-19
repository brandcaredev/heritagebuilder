import type { CollectionConfig } from "payload";

export const GuidePublications: CollectionConfig = {
  slug: "guide-publications",
  upload: {
    staticDir: "guide-publications",
    mimeTypes: ["application/pdf"],
  },
  fields: [],
  access: {
    read: () => true,
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => Boolean(user),
  },
};
