"use server";
import { getPayload } from "payload";
import config from "@payload-config";
import { LocaleType } from "../constans";

const payload = await getPayload({ config });

export const getCountyBySlug = async (locale: LocaleType, slug: string) => {
  const { docs: county } = await payload.find({
    collection: "counties",
    locale: locale,
    where: {
      slug: {
        equals: slug,
      },
    },
    limit: 1,
    depth: 3,
  });
  return county[0] || null;
};

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
