import { authenticatedOrPublished } from "@/access/authenticatesOrPublished";
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
      where: {
        _status: {
          equals: "published",
        },
      },
    },
    {
      name: "relatedCounties",
      type: "join",
      collection: "counties",
      on: "country",
      where: {
        _status: {
          equals: "published",
        },
      },
    },
    {
      name: "relatedCities",
      type: "join",
      collection: "cities",
      on: "country",
      where: {
        _status: {
          equals: "published",
        },
      },
    },
  ],
  admin: {
    useAsTitle: "name",
  },
  versions: {
    drafts: {
      autosave: true,
    },
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
    read: authenticatedOrPublished,
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user), // Only logged in users can update
    delete: ({ req: { user } }) => Boolean(user), // Only logged in users can delete
  },
};
