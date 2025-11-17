import { authenticatedOrPublished } from "@/access/authenticatesOrPublished";
import { checkSlugUniqueness } from "@/hooks/slug-uniqueness";
import { formatSlug } from "@/lib/utils";
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
      index: true,
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
      index: true,
      hooks: {
        beforeValidate: [formatSlug("name")],
      },
      admin: {
        position: "sidebar",
        readOnly: true,
      },
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
        name: {
          not_equals: null,
        },
      },
      // TODO: if it will be used. till then it's not needed too much data
      // defaultLimit: 0,
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
        name: {
          not_equals: null,
        },
      },
      defaultLimit: 0,
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
        name: {
          not_equals: null,
        },
      },
      defaultLimit: 0,
    },
  ],
  admin: {
    useAsTitle: "name",
    defaultColumns: ["id", "name", "slug", "countryCode", "_status"],
  },
  versions: {
    drafts: true,
  },
  hooks: {
    beforeChange: [checkSlugUniqueness("countries")],
    afterChange: [
      ({ doc, previousDoc }) => {
        if (doc._status === "draft" && previousDoc?._status !== "published") {
          return;
        }
        if (!isNextBuild()) {
          revalidateTag("countries", "max");
        }
      },
    ],
    afterDelete: [
      () => {
        if (!isNextBuild()) {
          revalidateTag("countries", "max");
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
