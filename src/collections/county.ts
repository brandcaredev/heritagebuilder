import { authenticatedOrPublished } from "@/access/authenticatesOrPublished";
import { checkSlugUniqueness } from "@/hooks/slug-uniqueness";
import { formatSlug } from "@/lib/utils";
import { revalidateTag } from "next/cache";
import type { CollectionConfig } from "payload";
import { isNextBuild } from "payload/shared";
import { countyOptions } from "@/collections/shared/county-options";

export const Counties: CollectionConfig = {
  slug: "counties",
  fields: [
    {
      name: "name",
      type: "text",
      required: true,
      localized: true,
      index: true,
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
      name: "description",
      type: "richText",
      localized: true,
      admin: {
        components: {
          afterInput: ["@/collections/shared/richtext-ai-actions#default"],
        },
      },
    },
    {
      name: "position",
      type: "point",
      admin: {
        components: {
          Field: "@/collections/cities/custom-position-selector",
        },
      },
    },
    {
      name: "country",
      type: "relationship",
      relationTo: "countries",
      required: true,
    },
    {
      name: "region",
      type: "relationship",
      relationTo: "regions",
    },
    {
      name: "code",
      type: "select",
      options: countyOptions,
    },
    {
      name: "relatedBuildings",
      type: "join",
      collection: "buildings",
      on: "county",
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
      on: "county",
      where: {
        _status: {
          equals: "published",
        },
      },
      defaultLimit: 0,
      admin: {
        components: {
          beforeInput: [
            "@/components/payload/ai/GenerateMissingLocationsModal#default",
          ],
        },
      },
    },
  ],
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "slug", "description", "_status"],
  },
  versions: {
    drafts: true,
  },
  hooks: {
    beforeChange: [checkSlugUniqueness("counties")],
    afterChange: [
      ({ doc, previousDoc }) => {
        if (doc._status === "draft" && previousDoc?._status !== "published") {
          return;
        }
        if (!isNextBuild()) {
          revalidateTag("counties", "max");
        }
      },
    ],
    afterDelete: [
      () => {
        if (!isNextBuild()) {
          revalidateTag("counties", "max");
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
