import { authenticatedOrPublished } from "@/access/authenticatesOrPublished";
import { revalidateTag } from "next/cache";
import { GlobalConfig } from "payload";
import { isNextBuild } from "payload/shared";

const Community: GlobalConfig = {
  slug: "community",
  access: {
    read: authenticatedOrPublished,
    update: ({ req: { user } }) => Boolean(user),
  },
  fields: [
    {
      name: "content",
      type: "richText",
      required: true,
      localized: true,
      admin: {
        description:
          "The content to be displayed in the Contribution Guidelines section",
      },
    },
    {
      name: "featuredImage",
      type: "upload",
      relationTo: "media",
    },
  ],
  hooks: {
    afterChange: [
      ({ doc, previousDoc }) => {
        if (doc._status === "draft" && previousDoc?._status !== "published") {
          return;
        }
        if (!isNextBuild()) {
          revalidateTag("community", "max");
        }
      },
    ],
  },
};

export default Community;
