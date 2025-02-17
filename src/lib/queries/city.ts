"server only";
import { getPayload, Where } from "payload";
import config from "@payload-config";
import { LocaleType } from "../constans";
import { unstable_cache } from "next/cache";

const payload = await getPayload({ config });

export const getCityBySlug = unstable_cache(
  async (locale: LocaleType, slug: string) => {
    const { docs: city } = await payload.find({
      collection: "cities",
      locale: locale,
      where: {
        slug: {
          equals: slug,
        },
        _status: {
          equals: "published",
        },
        name: {
          not_equals: null,
        },
      },
      limit: 1,
      depth: 1,
    });
    return city[0] || null;
  },
  [],
  { tags: ["cities"] },
);

export const getNextLanguageCitySlug = async (
  slug: string,
  nextLang: LocaleType,
) => {
  const { docs: city } = await payload.find({
    collection: "cities",
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
  const citySlugs = city[0]?.slug as unknown as Record<LocaleType, string>;
  return citySlugs[nextLang];
};

export const getCitiesByFilter = unstable_cache(
  async (locale: LocaleType, filter: Where) => {
    const { docs: cities, totalPages } = await payload.find({
      collection: "cities",
      locale: locale,
      where: {
        ...filter,
        _status: {
          equals: "published",
        },
        name: {
          not_equals: null,
        },
      },
      sort: "createdAt",
    });
    return { cities, totalPages };
  },
  [],
  { tags: ["cities"] },
);
