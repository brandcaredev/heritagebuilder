import { revalidateTag } from "next/cache";
import type { CollectionConfig } from "payload";

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
    drafts: true,
  },
  hooks: {
    afterChange: [
      () => {
        revalidateTag(`youtube-links`);
      },
    ],
    afterDelete: [
      () => {
        revalidateTag(`youtube-links`);
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
