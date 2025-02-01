"server only";
import { getPayload } from "payload";
import config from "@payload-config";
import { LocaleType } from "../constans";
import { unstable_cache } from "next/cache";

const payload = await getPayload({ config });

export const getCountries = unstable_cache(
  async (locale: LocaleType) => {
    const { docs: countries } = await payload.find({
      collection: "countries",
      locale: locale,
      where: {
        _status: {
          equals: "published",
        },
        name: {
          not_equals: null,
        },
      },
      sort: "createdAt",
    });
    return countries;
  },
  [],
  {
    tags: ["countries"],
  },
);

export const getCountryBySlug = async (locale: LocaleType, slug: string) => {
  const { docs: country } = await payload.find({
    collection: "countries",
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

export const getCountriesCodes = async () => {
  const { docs: countries } = await payload.find({
    collection: "countries",
    locale: "all",
    where: {
      _status: {
        equals: "published",
      },
    },
    select: {
      countryCode: true,
    },
  });
  return countries;
};
