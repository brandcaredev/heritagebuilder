"server only";
import { getPayload } from "payload";
import config from "@payload-config";
import { LocaleType } from "../constans";
import { unstable_cache } from "next/cache";

const payload = await getPayload({ config });

export const getBuildingTypes = unstable_cache(
  async (locale: LocaleType) => {
    const { docs: buildingTypes } = await payload.find({
      collection: "building-types",
      locale: locale,
      where: {
        _status: {
          equals: "published",
        },
      },
      sort: "id",
    });
    return buildingTypes;
  },
  [],
  { tags: ["building-types"] },
);

export const getBuildingTypeBySlug = unstable_cache(
  async (locale: LocaleType, slug: string) => {
    const { docs: buildingType } = await payload.find({
      collection: "building-types",
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
      depth: 1,
    });
    return buildingType[0] || null;
  },
  [],
  { tags: ["building-types"] },
);

export const getNextLanguageBuildingTypeSlug = async (
  slug: string,
  nextLang: LocaleType,
) => {
  const { docs: buildingType } = await payload.find({
    collection: "building-types",
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
  const buildingTypeSlugs = buildingType[0]?.slug as unknown as Record<
    LocaleType,
    string
  >;
  return buildingTypeSlugs[nextLang];
};
