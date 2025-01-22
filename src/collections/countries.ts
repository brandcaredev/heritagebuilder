import { revalidateTag } from "next/cache";
import type { CollectionConfig } from "payload";

export const Countries: CollectionConfig = {
  slug: "countries",
  fields: [
    {
      name: "id",
      required: true,
      type: "text",
    },
    {
      name: "name",
      type: "text",
      required: true,
      localized: true,
    },
    {
      name: "slug",
      type: "text",
      required: true,
      localized: true,
    },
    {
      name: "image",
      type: "upload",
      required: true,
      relationTo: "countries-media",
    },
    {
      name: "relatedBuildings",
      type: "join",
      collection: "buildings",
      on: "country",
    },
    {
      name: "relatedCounties",
      type: "join",
      collection: "counties",
      on: "country",
    },
    {
      name: "relatedCities",
      type: "join",
      collection: "cities",
      on: "country",
    },
  ],
  admin: {
    useAsTitle: "name",
  },
  versions: {
    drafts: true,
  },
  hooks: {
    afterChange: [
      () => {
        revalidateTag("countries");
      },
    ],
    afterDelete: [
      () => {
        revalidateTag("countries");
      },
    ],
  },
  access: {
    read: () => true,
    create: () => true,
    update: () => true,
    delete: () => true,
  },
};
