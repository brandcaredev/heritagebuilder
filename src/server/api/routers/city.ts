import { and, eq, sql } from "drizzle-orm";
import { z } from "zod";

import { LocaleType } from "@/lib/constans";
import { getCityBySlug } from "@/lib/queries";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { citiesDataTable, citiesTable } from "@/server/db/schemas";
import {
  CityCreateSchema,
  CityDataInsertSchema,
  CitySchema,
} from "@/server/db/zodSchemaTypes";
import config from "@payload-config";
import { TRPCError } from "@trpc/server";
import { getPayload } from "payload";
const payload = await getPayload({ config });

export const cityRouter = createTRPCRouter({
  getCityIdBySlug: publicProcedure
    .input(z.object({ slug: z.string(), lang: z.string() }))
    .query(async ({ input: { slug, lang }, ctx }) => {
      const city = await ctx.db.query.citiesDataTable.findFirst({
        // slug can be the same for the lang so we need both
        where: and(
          eq(citiesDataTable.slug, slug),
          eq(citiesDataTable.language, lang),
        ),
      });
      if (!city)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "City was not found",
        });
      return city.cityid;
    }),
  getCityBySlug: publicProcedure
    .input(z.object({ slug: z.string(), lang: z.string() }))
    .query(
      async ({ input: { slug, lang } }) =>
        await getCityBySlug(lang as LocaleType, slug),
    ),
  createCity: publicProcedure
    .input(CityCreateSchema)
    .mutation(async ({ input, ctx }) => {
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
  updateCity: publicProcedure
    .input(
      CitySchema.omit({
        countryid: true,
        countyid: true,
        createdAt: true,
        updatedAt: true,
      }).extend({
        en: CityDataInsertSchema.partial(),
        hu: CityDataInsertSchema.partial(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { en, hu, id, ...baseData } = input;
      try {
        await ctx.db.transaction(async (tx) => {
          await tx
            .update(citiesTable)
            .set(baseData)
            .where(sql`${citiesTable.id} = ${id}`);
          await tx
            .update(citiesDataTable)
            .set(en)
            .where(
              and(
                eq(citiesDataTable.cityid, id),
                eq(citiesDataTable.language, "en"),
              ),
            );
          await tx
            .update(citiesDataTable)
            .set(hu)
            .where(
              and(
                eq(citiesDataTable.cityid, id),
                eq(citiesDataTable.language, "hu"),
              ),
            );
        });
        return "City updated";
      } catch (error) {
        console.error("Error updating city - updateCity:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Error updating city",
        });
      }
    }),
  getLanguageCitySlug: publicProcedure
    .input(
      z.object({ slug: z.string(), lang: z.string(), nextLang: z.string() }),
    )
    .query(async ({ input: { slug, lang, nextLang }, ctx }) => {
      const cityData = await ctx.db.query.citiesDataTable.findFirst({
        where: and(
          eq(citiesDataTable.slug, slug),
          eq(citiesDataTable.language, lang),
        ),
        columns: {
          cityid: true,
        },
      });
      if (!cityData)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "City data was not found",
        });
      const nextLangCityData = await ctx.db.query.citiesDataTable.findFirst({
        where: and(
          eq(citiesDataTable.cityid, cityData.cityid),
          eq(citiesDataTable.language, nextLang),
        ),
        columns: {
          slug: true,
        },
      });
      if (!nextLangCityData)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Next city data was not found",
        });
      return nextLangCityData.slug;
    }),
});
