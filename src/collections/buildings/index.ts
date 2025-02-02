import { authenticatedOrPublished } from "@/access/authenticatesOrPublished";
import { revalidateTag } from "next/cache";
import type { CollectionConfig } from "payload";
import { isNextBuild } from "payload/shared";

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
    {
      name: "suggestionsCount",
      type: "number",
      defaultValue: 0,
      admin: {
        readOnly: true,
        hidden: true,
      },
    },
  ],
  admin: {
    useAsTitle: "name",
    defaultColumns: ["id", "name", "summary", "_status", "suggestionsCount"],
  },
  versions: {
    drafts: {
      autosave: true,
    },
  },
  hooks: {
    beforeChange: [
      async ({ data, context }) => {
        // Store the temporary image IDs in context.imageIds
        let temporaryImageIds = [] as string[];
        if (data.featuredImage) {
          temporaryImageIds.push(data.featuredImage);
        }
        if (data.images && Array.isArray(data.images)) {
          temporaryImageIds = temporaryImageIds.concat(data.images);
        }
        context.imageIds = temporaryImageIds;
        return data;
      },
    ],
    afterChange: [
      ({ doc, previousDoc, context }) => {
        delete context.imageIds;
        if (doc._status === "draft" && previousDoc?._status !== "published") {
          return;
        }
        if (!isNextBuild()) {
          revalidateTag("buildings");
        }
      },
    ],
    afterDelete: [
      () => {
        if (!isNextBuild()) {
          revalidateTag("buildings");
        }
      },
    ],
    afterError: [
      async ({ req, context }) => {
        const temporaryImageIds = context.imageIds as string[];
        if (temporaryImageIds && temporaryImageIds[0]) {
          await Promise.all(
            (temporaryImageIds as string[]).map(async (imageId) => {
              await req.payload.delete({
                collection: "buildings-media",
                id: imageId,
              });
            }),
          );
        }
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
