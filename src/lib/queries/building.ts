"server only";
import { getPayload, Where } from "payload";
import config from "@payload-config";
import { LocaleType } from "../constans";

const payload = await getPayload({ config });

export const searchBuildings = async (q: string, locale: LocaleType) => {
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
};

export const getBuildingBySlug = async (locale: LocaleType, slug: string) => {
  const { docs: building } = await payload.find({
    collection: "buildings",
    locale: locale,
    where: {
      slug: {
        equals: slug,
      },
    },
    limit: 1,
  });
  return building[0] || null;
};

export const getMainPageBuildings = async (locale: LocaleType) => {
  const { docs: buildings } = await payload.find({
    collection: "buildings",
    locale: locale,
    sort: "createdAt",
    limit: 6,
  });
  return buildings;
};

export const getBuildings = async (locale: LocaleType) => {
  const { docs: buildings } = await payload.find({
    collection: "buildings",
    locale: locale,
    sort: "createdAt",
  });
  return buildings;
};

export const getBuildingsByFilter = async (
  locale: LocaleType,
  filter: Where,
) => {
  const { docs: buildings, totalPages } = await payload.find({
    collection: "buildings",
    locale: locale,
    where: filter,
    sort: "createdAt",
  });
  return { buildings, totalPages };
};

export const getBuilding = async (locale: LocaleType, slug: string) => {
  const { docs: building } = await payload.find({
    collection: "buildings",
    locale: "all",
    where: {
      slug: {
        equals: slug,
      },
    },
  });
  return building;
};

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
