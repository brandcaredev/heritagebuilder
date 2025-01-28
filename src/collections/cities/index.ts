import { authenticatedOrPublished } from "@/access/authenticatesOrPublished";
import type { CollectionConfig } from "payload";

export const Cities: CollectionConfig = {
  slug: "cities",
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
      name: "county",
      type: "relationship",
      relationTo: "counties",
      required: true,
    },
    {
      name: "relatedBuildings",
      type: "join",
      collection: "buildings",
      on: "city",
      where: {
        _status: {
          equals: "published",
        },
      },
    },
  ],
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "slug", "description", "_status"],
  },
  versions: {
    drafts: {
      autosave: true,
    },
  },
  access: {
    read: authenticatedOrPublished,
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user), // Only logged in users can update
    delete: ({ req: { user } }) => Boolean(user), // Only logged in users can delete
  },
};
