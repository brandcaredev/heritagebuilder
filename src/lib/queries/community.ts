import config from "@payload-config";
import { getPayload } from "payload";
import type { LocaleType } from "../constans";
import { unstable_cache } from "next/cache";

export const getCommunityContent = unstable_cache(
  async (locale: LocaleType) => {
    const payload = await getPayload({ config });

    try {
      const community = await payload.findGlobal({
        slug: "community",
        locale,
      });

      return community?.content || null;
    } catch (error) {
      console.error("Error fetching Community content:", error);
      return null;
    }
  },
  [],
  {
    tags: ["community"],
  },
);
