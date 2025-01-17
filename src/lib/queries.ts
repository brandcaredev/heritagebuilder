'use server'
import { getPayload } from "payload";
import config from "@payload-config";
import { unstable_cacheTag as cacheTag } from "next/cache";
import { LocaleType } from "./constans";

const payload = await getPayload({ config });


export const getCountries = async (locale: LocaleType) => {
  "use cache";
  cacheTag("countries");
  const { docs: countries } = await payload.find({
    collection: "countries",
    locale: locale,
    sort: "createdAt",
  });
  return countries;
};

export const getBuildingTypes = async (locale: LocaleType) => {
  "use cache";
  cacheTag("building-types");
  const { docs: buildingTypes } = await payload.find({
    collection: "building-types",
    locale: locale,
    sort: "id",
  });
  return buildingTypes;
};

export const getCountyBySlug = async (locale: LocaleType, slug: string) => {
  const payload = await getPayload({ config });
  const { docs: county } = await payload.find({
    collection: "counties",
    locale: locale,
    where: {
      slug: {
        equals: slug,
      },
    },
    limit: 1
  });
  return county[0] || null;
};

export const getCityBySlug = async (locale: LocaleType, slug:string ) => {
  const {docs: city} = await payload.find({
    collection: "cities",
    locale: locale,
    where: {
      slug: {
        equals: slug,
      },
    },
    limit: 1
  });
  return city[0] || null;
};
