import { authenticatedOrPublished } from "@/access/authenticatesOrPublished";
import { revalidateTag } from "next/cache";
import type { CollectionConfig } from "payload";

export const BuildingTypes: CollectionConfig = {
  slug: "building-types",
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
      name: "image",
      type: "upload",
      required: true,
      relationTo: "building-types-media",
    },
    {
      name: "relatedBuildings",
      type: "join",
      collection: "buildings",
      on: "buildingType",
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
    drafts: true,
  },
  hooks: {
    afterChange: [
      () => {
        revalidateTag(`building-types`);
      },
    ],
    afterDelete: [
      () => {
        revalidateTag(`building-types`);
      },
    ],
  },
  access: {
    read: authenticatedOrPublished,
    create: () => true,
    update: () => true,
    delete: () => true,
  },
};
