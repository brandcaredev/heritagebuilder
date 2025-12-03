import config from "@payload-config";
import { getPayload } from "payload";
import type { LocaleType } from "../constans";
import { unstable_cache } from "next/cache";

export const getDescriptionContent = unstable_cache(
  async (locale: LocaleType) => {
    const payload = await getPayload({ config });

    try {
      const description = await payload.findGlobal({
        slug: "description",
        locale,
      });

      return description?.content || null;
    } catch (error) {
      console.error("Error fetching Description content:", error);
      return null;
    }
  },
  ["description"],
  {
    tags: ["description"],
  },
);
