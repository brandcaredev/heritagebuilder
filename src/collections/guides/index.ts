import { authenticatedOrPublished } from "@/access/authenticatesOrPublished";
import { checkSlugUniqueness } from "@/hooks/slug-uniqueness";
import { formatSlug } from "@/lib/utils";
import { revalidateTag } from "next/cache";
import type { CollectionConfig } from "payload";
import { isNextBuild } from "payload/shared";
import { guideApprovalEmail } from "./hooks/approvalEmail";
import { newGuideEmail } from "./hooks/newGuideEmail";

export const Guides: CollectionConfig = {
  slug: "guides",
  fields: [
    {
      name: "name",
      type: "text",
      required: true,
      index: true,
    },
    {
      name: "slug",
      type: "text",
      required: true,
      unique: true,
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
      name: "profilePhoto",
      label: "Profile photo",
      type: "upload",
      relationTo: "media",
      required: true,
    },
    {
      name: "bio",
      label: "Short introduction / bio",
      type: "textarea",
      required: true,
      localized: true,
    },
    {
      name: "cities",
      label: "City or cities",
      type: "relationship",
      relationTo: "cities",
      hasMany: true,
      required: true,
    },
    {
      name: "languages",
      label: "Spoken languages",
      type: "text",
      hasMany: true,
      required: true,
    },
    {
      name: "phone",
      type: "text",
      required: true,
    },
    {
      name: "email",
      type: "email",
      required: true,
    },
    {
      name: "publication",
      label: "PDF publication",
      type: "upload",
      relationTo: "guide-publications",
    },
  ],
  admin: {
    useAsTitle: "name",
    defaultColumns: ["id", "name", "email", "_status", "createdAt"],
  },
  versions: {
    drafts: true,
  },
  hooks: {
    beforeChange: [checkSlugUniqueness("guides")],
    afterChange: [
      async (args) => {
        const { doc, previousDoc } = args;
        await guideApprovalEmail(args);
        await newGuideEmail(args);

        if (doc._status === "draft" && previousDoc?._status !== "published") {
          return;
        }
        if (!isNextBuild()) {
          revalidateTag("guides", "max");
          revalidateTag("buildings", "max");
        }
      },
    ],
    afterDelete: [
      () => {
        if (!isNextBuild()) {
          revalidateTag("guides", "max");
          revalidateTag("buildings", "max");
        }
      },
    ],
  },
  access: {
    read: authenticatedOrPublished,
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => Boolean(user),
  },
};
