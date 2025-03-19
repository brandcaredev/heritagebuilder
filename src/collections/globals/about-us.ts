import { authenticatedOrPublished } from "@/access/authenticatesOrPublished";
import { revalidateTag } from "next/cache";
import { GlobalConfig } from "payload";
import { isNextBuild } from "payload/shared";

const AboutUs: GlobalConfig = {
  slug: "about-us",
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
        description: "The content to be displayed in the About Us section",
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
          revalidateTag("about-us");
        }
      },
    ],
  },
};

export default AboutUs;
