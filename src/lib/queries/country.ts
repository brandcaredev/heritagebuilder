"use server";
import { getPayload } from "payload";
import config from "@payload-config";
import { LocaleType } from "../constans";

const payload = await getPayload({ config });

export const getCountries = async (locale: LocaleType) => {
  const { docs: countries } = await payload.find({
    collection: "countries",
    locale: locale,
    sort: "createdAt",
  });
  return countries;
};

export const getCountryBySlug = async (locale: LocaleType, slug: string) => {
  const { docs: country } = await payload.find({
    collection: "countries",
    locale: locale,
    where: {
      slug: {
        equals: slug,
      },
    },
    draft: false,
    limit: 1,
  });
  return country[0] || null;
};

export const getNextLanguageCountrySlug = async (
  slug: string,
  nextLang: LocaleType,
) => {
  const { docs: country } = await payload.find({
    collection: "countries",
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
  const countrySlugs = country[0]?.slug as unknown as Record<
    LocaleType,
    string
  >;
  return countrySlugs[nextLang];
};