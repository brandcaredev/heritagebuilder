"server only";
import { getPayload, Where } from "payload";
import config from "@payload-config";
import { LocaleType } from "../constans";
import { unstable_cache } from "next/cache";

const payload = await getPayload({ config });

export const searchBuildings = unstable_cache(
  async (q: string, locale: LocaleType) => {
    const { docs: buildings } = await payload.find({
      collection: "search",
      locale: locale,
      where: {
        or: [
          {
            name: {
              like: q,
            },
          },
          {
            "buildingType.name": {
              like: q,
            },
          },
          {
            city: {
              like: q,
            },
          },
          {
            country: {
              like: q,
            },
          },
        ],
      },
    });
    return buildings;
  },
  [],
  { tags: ["buildings"] },
);

export const getBuildingBySlug = unstable_cache(
  async (locale: LocaleType, slug: string) => {
    const { docs: building } = await payload.find({
      collection: "buildings",
      locale: locale,
      where: {
        slug: {
          equals: slug,
        },
        _status: {
          equals: "published",
        },
      },
      limit: 1,
    });
    return building[0] || null;
  },
  [],
  { tags: ["buildings"] },
);

export const getBuildings = unstable_cache(
  async (locale: LocaleType, limit?: number) => {
    const { docs: buildings } = await payload.find({
      collection: "buildings",
      locale: locale,
      where: {
        _status: {
          equals: "published",
        },
      },
      ...(limit && { limit }),
      sort: "createdAt",
    });
    return buildings;
  },
  [],
  { tags: ["buildings"] },
);

export const getBuildingsByFilter = unstable_cache(
  async (locale: LocaleType, filter: Where) => {
    const { docs: buildings, totalPages } = await payload.find({
      collection: "buildings",
      locale: locale,
      where: { ...filter, _status: { equals: "published" } },
      sort: "createdAt",
    });
    return { buildings, totalPages };
  },
  [],
  { tags: ["buildings"] },
);

export const getNextLanguageBuildingSlug = async (
  slug: string,
  nextLang: LocaleType,
) => {
  const { docs: building } = await payload.find({
    collection: "buildings",
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
  const buildingSlugs = building[0]?.slug as unknown as Record<
    LocaleType,
    string
  >;
  return buildingSlugs[nextLang];
};
