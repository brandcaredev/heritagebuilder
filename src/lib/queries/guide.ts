"server only";

import config from "@payload-config";
import { unstable_cache } from "next/cache";
import { getPayload } from "payload";
import type { LocaleType } from "../constans";

const payload = await getPayload({ config });

export const getGuideBySlug = unstable_cache(
  async (locale: LocaleType, slug: string) => {
    const { docs } = await payload.find({
      collection: "guides",
      locale,
      depth: 2,
      where: {
        slug: { equals: slug },
        _status: { equals: "published" },
      },
      limit: 1,
    });

    return docs[0] || null;
  },
  [],
  { tags: ["guides"] },
);

export const getGuideCityOptions = unstable_cache(
  async (locale: LocaleType) => {
    const { docs } = await payload.find({
      collection: "cities",
      locale,
      where: {
        _status: { equals: "published" },
        name: { not_equals: null },
      },
      limit: 0,
      select: { id: true, name: true, country: true },
      sort: "name",
    });

    return docs;
  },
  [],
  { tags: ["guides", "cities"] },
);

export const getGuideCountryOptions = unstable_cache(
  async (locale: LocaleType) => {
    const { docs } = await payload.find({
      collection: "countries",
      locale,
      where: {
        _status: { equals: "published" },
        name: { not_equals: null },
      },
      limit: 0,
      select: { id: true, name: true },
      sort: "name",
    });

    return docs;
  },
  [],
  { tags: ["guides", "countries"] },
);

export const getGuides = unstable_cache(
  async (locale: LocaleType) => {
    const { docs } = await payload.find({
      collection: "guides",
      locale,
      where: {
        _status: { equals: "published" },
      },
      limit: 0,
      select: {
        id: true,
        name: true,
        slug: true,
        updatedAt: true,
        createdAt: true,
      },
    });

    return docs;
  },
  [],
  { tags: ["guides"] },
);

export const getBuildingsForGuide = unstable_cache(
  async (locale: LocaleType, guideId: number | string) => {
    const { docs } = await payload.find({
      collection: "buildings",
      locale,
      depth: 1,
      where: {
        and: [
          { _status: { equals: "published" } },
          { name: { not_equals: null } },
          { localGuides: { contains: guideId } },
        ],
      },
      limit: 0,
      select: {
        id: true,
        name: true,
        slug: true,
        featuredImage: true,
      },
      sort: "name",
    });

    return docs;
  },
  [],
  { tags: ["guides", "buildings"] },
);
