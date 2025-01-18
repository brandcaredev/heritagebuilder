"use server";
import { getPayload } from "payload";
import config from "@payload-config";
import { LocaleType } from "../constans";

const payload = await getPayload({ config });

export const getCityBySlug = async (locale: LocaleType, slug: string) => {
  const { docs: city } = await payload.find({
    collection: "cities",
    locale: locale,
    where: {
      slug: {
        equals: slug,
      },
    },
    limit: 1,
    depth: 2,
  });
  return city[0] || null;
};

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
