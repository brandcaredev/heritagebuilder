import { z } from "zod";

import { LocaleType } from "@/lib/constans";
import {
  getCountyBySlug,
  getNextLanguageCountySlug,
} from "@/lib/queries/county";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import config from "@payload-config";
import { TRPCError } from "@trpc/server";
import { getPayload } from "payload";

const payload = await getPayload({ config });

export const countyRouter = createTRPCRouter({
  getCountyBySlug: publicProcedure
    .input(z.object({ slug: z.string(), lang: z.string() }))
    .query(
      async ({ input: { slug, lang } }) =>
        await getCountyBySlug(lang as LocaleType, slug),
    ),
  //TODO: add validation
  createCounty: publicProcedure.input(z.any()).mutation(async ({ input }) => {
    const { en, hu, ...baseData } = input;
    try {
      const newCounty = await payload.create({
        collection: "counties",
        data: {
          country: baseData.countryid,
          slug: hu.slug,
          name: hu.name,
        },
        locale: "hu",
      });
      await payload.update({
        collection: "counties",
        id: newCounty.id,
        data: {
          slug: en.slug,
          name: en.name,
        },
        locale: "en",
      });
      return newCounty.id;
    } catch (error) {
      console.error("Error creating county - createCounty:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Error creating county",
      });
    }
  }),
  getLanguageCountySlug: publicProcedure
    .input(z.object({ slug: z.string(), nextLang: z.string() }))
    .query(
      async ({ input: { slug, nextLang } }) =>
        await getNextLanguageCountySlug(slug, nextLang as LocaleType),
    ),
});
