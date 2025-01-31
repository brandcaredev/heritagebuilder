import { authenticatedOrPublished } from "@/access/authenticatesOrPublished";
import { revalidateTag } from "next/cache";
import type { CollectionConfig } from "payload";
import { isNextBuild } from "payload/shared";

export const YoutubeLinks: CollectionConfig = {
  slug: "youtube-links",
  fields: [
    {
      name: "title",
      type: "text",
      required: true,
    },
    {
      name: "url",
      type: "text",
      required: true,
    },
    {
      name: "sort",
      type: "number",
      required: true,
    },
    {
      name: "language",
      type: "select",
      options: [
        { value: "en", label: "English" },
        { value: "hu", label: "Hungarian" },
      ],
      required: true,
    },
  ],
  defaultSort: "sort",
  versions: {
    drafts: {
      autosave: true,
    },
  },
  hooks: {
    afterChange: [
      () => {
        if (!isNextBuild()) {
          revalidateTag(`youtube-links`);
        }
      },
    ],
    afterDelete: [
      () => {
        if (!isNextBuild()) {
          revalidateTag(`youtube-links`);
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
