import { authenticatedOrPublished } from "@/access/authenticatesOrPublished";
import { revalidateTag } from "next/cache";
import type { CollectionConfig } from "payload";
import { isNextBuild } from "payload/shared";

export const Countries: CollectionConfig = {
  slug: "countries",
  fields: [
    {
      name: "name",
      type: "text",
      required: true,
      localized: true,
    },
    {
      name: "countryCode",
      type: "text",
      required: true,
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
    defaultColumns: ["id", "name", "slug", "countryCode", "_status"],
  },
  versions: {
    drafts: {
      autosave: true,
    },
  },
  hooks: {
    afterChange: [
      ({ doc, previousDoc }) => {
        if (doc._status === "draft" && previousDoc?._status !== "published") {
          return;
        }
        if (!isNextBuild()) {
          revalidateTag("countries");
        }
      },
    ],
    afterDelete: [
      () => {
        if (!isNextBuild()) {
          revalidateTag("countries");
        }
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
