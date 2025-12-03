import config from "@payload-config";
import { getPayload } from "payload";
import type { LocaleType } from "../constans";
import { unstable_cache } from "next/cache";

export const getAboutUsContent = unstable_cache(
  async (locale: LocaleType) => {
    const payload = await getPayload({ config });

    try {
      const aboutUs = await payload.findGlobal({
        slug: "about-us",
        locale,
      });

      return aboutUs?.content || null;
    } catch (error) {
      console.error("Error fetching AboutUs content:", error);
      return null;
    }
  },
  [],
  {
    tags: ["about-us"],
  },
);
