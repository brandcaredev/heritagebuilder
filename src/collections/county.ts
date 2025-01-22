import { revalidatePath, revalidateTag } from "next/cache";
import type { CollectionConfig } from "payload";

export const Counties: CollectionConfig = {
  slug: "counties",
  fields: [
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
      name: "description",
      type: "textarea",
      localized: true,
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
      name: "relatedBuildings",
      type: "join",
      collection: "buildings",
      on: "county",
    },
    {
      name: "relatedCities",
      type: "join",
      collection: "cities",
      on: "county",
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
    afterChange: [
      () => {
        revalidateTag(`counties`);
      },
    ],
    afterDelete: [
      () => {
        revalidateTag(`counties`);
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
