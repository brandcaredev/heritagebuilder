"use server";
import { getPayload } from "payload";
import config from "@payload-config";
import { LocaleType } from "../constans";

const payload = await getPayload({ config });

export const getBuildingTypes = async (locale: LocaleType) => {
  const { docs: buildingTypes } = await payload.find({
    collection: "building-types",
    locale: locale,
    sort: "id",
  });
  return buildingTypes;
};

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