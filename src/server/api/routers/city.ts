import { z } from "zod";

import { LocaleType } from "@/lib/constans";
import { getCityBySlug, getNextLanguageCitySlug } from "@/lib/queries/city";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import config from "@payload-config";
import { TRPCError } from "@trpc/server";
import { getPayload } from "payload";
const payload = await getPayload({ config });

export const cityRouter = createTRPCRouter({
  getCityBySlug: publicProcedure
    .input(z.object({ slug: z.string(), lang: z.string() }))
    .query(
      async ({ input: { slug, lang } }) =>
        await getCityBySlug(lang as LocaleType, slug),
    ),
  createCity: publicProcedure
    //TODO: add validation
    .input(z.any())
    .mutation(async ({ input }) => {
      const { en, hu, ...baseData } = input;
      try {
        const newCity = await payload.create({
          collection: "cities",
          data: {
            country: baseData.countryid,
            county: baseData.countyid,
            slug: hu.slug,
            name: hu.name,
          },
          locale: "hu",
        });
        await payload.update({
          collection: "cities",
          id: newCity.id,
          data: {
            slug: en.slug,
            name: en.name,
          },
          locale: "en",
        });
        return newCity.id;
      } catch (error) {
        console.error("Error creating city - createCity:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Error creating city",
        });
      }
    }),
  getLanguageCitySlug: publicProcedure
    .input(z.object({ slug: z.string(), nextLang: z.string() }))
    .query(
      async ({ input: { slug, nextLang } }) =>
        await getNextLanguageCitySlug(slug, nextLang as LocaleType),
    ),
});
