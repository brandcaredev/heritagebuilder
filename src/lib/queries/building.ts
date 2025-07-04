"server only";
import { getPayload, type Where } from "payload";
import config from "@payload-config";
import type { LocaleType } from "../constans";
import { unstable_cache } from "next/cache";

const payload = await getPayload({ config });

export const searchBuildings = unstable_cache(
  async (
    q: string,
    locale: LocaleType,
    limit?: number,
    page?: number,
    filter?: Where,
  ) => {
    const { docs: buildings, totalPages } = await payload.find({
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
        ...filter,
      },
      limit: limit || 10,
      page,
    });
    return { buildings, totalPages };
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
        name: {
          not_equals: null,
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
  async (locale: LocaleType, limit?: number, sort?: string) => {
    const { docs: buildings } = await payload.find({
      collection: "buildings",
      locale: locale,
      limit: limit ?? 0,
      where: {
        _status: {
          equals: "published",
        },
        name: {
          not_equals: null,
        },
      },
      select: {
        id: true,
        name: true,
        slug: true,
        featuredImage: true,
        summary: true,
        buildingType: true,
        position: true,
        history: true,
      },
      sort: sort || "createdAt",
    });
    return buildings;
  },
  [],
  { tags: ["buildings"] },
);

export const getBuildingsByFilter = unstable_cache(
  async (locale: LocaleType, filter: Where, limit?: number, page?: number) => {
    const { docs: buildings, totalPages } = await payload.find({
      collection: "buildings",
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
      select: {
        id: true,
        name: true,
        slug: true,
        featuredImage: true,
        summary: true,
        buildingType: true,
        position: true,
        history: true,
      },
      limit,
      page,
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
