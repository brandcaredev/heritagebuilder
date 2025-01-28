import { authenticatedOrPublished } from "@/access/authenticatesOrPublished";
import { revalidateTag } from "next/cache";
import type { CollectionConfig } from "payload";

export const Buildings: CollectionConfig = {
  slug: "buildings",
  fields: [
    {
      name: "name",
      type: "text",
      required: true,
      localized: true,
      admin: {
        components: {
          Field: "@/collections/buildings/field-with-suggestions",
        },
      },
    },
    {
      name: "slug",
      type: "text",
      required: true,
      localized: true,
    },
    {
      name: "summary",
      type: "textarea",
      localized: true,
      required: true,
      admin: {
        components: {
          Field: "@/collections/buildings/field-with-suggestions",
        },
      },
    },
    {
      name: "buildingType",
      type: "relationship",
      relationTo: "building-types",
      required: true,
    },
    {
      name: "history",
      type: "textarea",
      localized: true,
      required: true,
      admin: {
        components: {
          Field: "@/collections/buildings/field-with-suggestions",
        },
      },
    },
    {
      name: "style",
      type: "textarea",
      localized: true,
      required: true,
      admin: {
        components: {
          Field: "@/collections/buildings/field-with-suggestions",
        },
      },
    },
    {
      name: "presentDay",
      type: "textarea",
      localized: true,
      required: true,
      admin: {
        components: {
          Field: "@/collections/buildings/field-with-suggestions",
        },
      },
    },
    {
      name: "famousResidents",
      type: "textarea",
      localized: true,
      admin: {
        components: {
          Field: "@/collections/buildings/field-with-suggestions",
        },
      },
    },
    {
      name: "renovation",
      type: "textarea",
      localized: true,
      admin: {
        components: {
          Field: "@/collections/buildings/field-with-suggestions",
        },
      },
    },
    {
      name: "featuredImage",
      type: "upload",
      required: true,
      relationTo: "buildings-media",
    },
    {
      name: "images",
      type: "upload",
      hasMany: true,
      relationTo: "buildings-media",
      required: true,
    },
    {
      name: "position",
      type: "point",
      required: true,
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
      name: "county",
      type: "relationship",
      relationTo: "counties",
    },
    {
      name: "city",
      type: "relationship",
      relationTo: "cities",
    },
    {
      name: "creatorName",
      type: "text",
    },
    {
      name: "creatorEmail",
      type: "text",
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
        revalidateTag("buildings");
      },
    ],
    afterDelete: [
      () => {
        revalidateTag("buildings");
      },
    ],
  },
  access: {
    read: authenticatedOrPublished,
    create: () => true,
    update: ({ req: { user } }) => Boolean(user), // Only logged in users can update
    delete: ({ req: { user } }) => Boolean(user), // Only logged in users can delete
  },
};
