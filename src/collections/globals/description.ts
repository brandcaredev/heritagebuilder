import { authenticatedOrPublished } from "@/access/authenticatesOrPublished";
import { revalidateTag } from "next/cache";
import { GlobalConfig } from "payload";
import { isNextBuild } from "payload/shared";

const Description: GlobalConfig = {
  slug: "description",
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
          "The content to be displayed in the Description section on the main page",
      },
    },
  ],
  hooks: {
    afterChange: [
      ({ doc, previousDoc }) => {
        if (doc._status === "draft" && previousDoc?._status !== "published") {
          return;
        }
        if (!isNextBuild()) {
          revalidateTag("description", "max");
        }
      },
    ],
  },
};

export default Description;
