import { authenticatedOrPublished } from "@/access/authenticatesOrPublished";
import { checkSlugUniqueness } from "@/hooks/slug-uniqueness";
import { formatSlug } from "@/lib/utils";
import { revalidateTag } from "next/cache";
import type { CollectionConfig } from "payload";
import { isNextBuild } from "payload/shared";
import { approvalEmail } from "./hooks/approvalEmail";
import { newBuildingEmail } from "./hooks/newBuildingEmail";
import { checkIfCanUpdate } from "./hooks/checkIfCanUpdate";
import {
  MetaDescriptionField,
  MetaImageField,
  MetaTitleField,
  OverviewField,
} from "@payloadcms/plugin-seo/fields";
export const Buildings: CollectionConfig = {
  slug: "buildings",
  fields: [
    {
      name: "name",
      type: "text",
      required: true,
      localized: true,
      index: true,
      admin: {
        components: {
          Field: "@/collections/buildings/field-with-suggestions#default",
        },
      },
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
      name: "summary",
      type: "textarea",
      localized: true,
      required: true,
      admin: {
        components: {
          Field: "@/collections/buildings/field-with-suggestions#default",
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
          Field: "@/collections/buildings/field-with-suggestions#default",
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
          Field: "@/collections/buildings/field-with-suggestions#default",
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
          Field: "@/collections/buildings/field-with-suggestions#default",
        },
      },
    },
    {
      name: "famousResidents",
      type: "textarea",
      localized: true,
      admin: {
        components: {
          Field: "@/collections/buildings/field-with-suggestions#default",
        },
      },
    },
    {
      name: "renovation",
      type: "textarea",
      localized: true,
      admin: {
        components: {
          Field: "@/collections/buildings/field-with-suggestions#default",
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
    {
      type: "group",
      name: "meta",
      label: "SEO",
      fields: [
        OverviewField({
          titlePath: "meta.title",
          descriptionPath: "meta.description",
          imagePath: "meta.image",
        }),
        MetaTitleField({
          hasGenerateFn: true,
        }),
        MetaImageField({
          relationTo: "buildings-media",
        }),

        MetaDescriptionField({}),
      ],
    },
  ],
  admin: {
    useAsTitle: "name",
    defaultColumns: [
      "id",
      "slug",
      "name",
      "summary",
      "_status",
      "suggestionsCount",
      "createdAt",
    ],
  },
  versions: {
    drafts: true,
  },
  hooks: {
    beforeChange: [
      async (args) => {
        if (args.operation === "update") {
          await checkIfCanUpdate(args);
        }
        await checkSlugUniqueness("buildings")(args);
      },
    ],
    afterChange: [
      async (args) => {
        const { doc, context, previousDoc } = args;
        delete context.imageIds;
        await approvalEmail(args);
        await newBuildingEmail(args);
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
        if (temporaryImageIds?.[0]) {
          await Promise.all(
            temporaryImageIds.map(async (imageId) => {
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
    update: () => true,
    delete: ({ req: { user } }) => Boolean(user), // Only logged in users can delete
  },
};
