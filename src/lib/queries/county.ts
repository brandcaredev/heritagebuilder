"server only";
import { getPayload, Where } from "payload";
import config from "@payload-config";
import { LocaleType } from "../constans";
import { unstable_cache } from "next/cache";

const payload = await getPayload({ config });

export const getCountyBySlug = unstable_cache(
  async (locale: LocaleType, slug: string) => {
    const { docs: county } = await payload.find({
      collection: "counties",
      locale: locale,
      where: {
        slug: {
          equals: slug,
        },
      },
      limit: 1,
      depth: 1,
    });
    return county[0] || null;
  },
  [],
  { tags: ["counties"] },
);

export const getNextLanguageCountySlug = async (
  slug: string,
  nextLang: LocaleType,
) => {
  const { docs: county } = await payload.find({
    collection: "counties",
    locale: "all",
    where: {
      slug: {
        equals: slug,
      },
    },
    select: {
      slug: true,
    },
  });
  const countySlugs = county[0]?.slug as unknown as Record<LocaleType, string>;
  return countySlugs[nextLang];
};

export const getCountiesByFilter = unstable_cache(
  async (locale: LocaleType, filter: Where) => {
    const { docs: counties, totalPages } = await payload.find({
      collection: "counties",
      locale: locale,
      where: { ...filter },
      sort: "createdAt",
    });
    return { counties, totalPages };
  },
  [],
  { tags: ["counties"] },
);
