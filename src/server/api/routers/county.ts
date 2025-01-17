import { and, eq, sql } from "drizzle-orm";
import { z } from "zod";

import { getCountyBySlug } from "@/lib/queries";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { countiesDataTable, countiesTable } from "@/server/db/schemas";
import {
  CountyDataInsertSchema,
  CountySchema,
} from "@/server/db/zodSchemaTypes";
import config from "@payload-config";
import { TRPCError } from "@trpc/server";
import { getPayload } from "payload";
import { LocaleType } from "@/lib/constans";

const payload = await getPayload({ config });

export const countyRouter = createTRPCRouter({
  getCountyIdBySlug: publicProcedure
    .input(z.object({ slug: z.string(), lang: z.string() }))
    .query(async ({ input: { slug, lang }, ctx }) => {
      const county = await ctx.db.query.countiesDataTable.findFirst({
        // slug can be the same for the lang so we need both
        where: and(
          eq(countiesDataTable.slug, slug),
          eq(countiesDataTable.language, lang),
        ),
      });

      if (!county)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "County was not found",
        });
      return county.countyid;
    }),
  getCountyBySlug: publicProcedure
    .input(z.object({ slug: z.string(), lang: z.string() }))
    .query(
      async ({ input: { slug, lang }, ctx }) =>
        await getCountyBySlug(lang as LocaleType, slug),
    ),
  createCounty: publicProcedure
    .input(
      CountySchema.omit({
        id: true,
        createdAt: true,
        updatedAt: true,
      }).extend({
        en: CountyDataInsertSchema.omit({ countyid: true }),
        hu: CountyDataInsertSchema.omit({ countyid: true }),
      }),
    )
    .mutation(async ({ input, ctx }) => {
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
  updateCounty: publicProcedure
    .input(
      CountySchema.partial()
        .omit({
          countryid: true,
          createdAt: true,
          updatedAt: true,
        })
        .extend({
          en: CountyDataInsertSchema.partial(),
          hu: CountyDataInsertSchema.partial(),
          id: z.number(),
        }),
    )
    .mutation(async ({ input, ctx }) => {
      const { en, hu, id, ...baseData } = input;
      try {
        await ctx.db.transaction(async (tx) => {
          await tx
            .update(countiesTable)
            .set(baseData)
            .where(sql`${countiesTable.id} = ${id}`);
          await tx
            .update(countiesDataTable)
            .set(en)
            .where(
              and(
                eq(countiesDataTable.countyid, id),
                eq(countiesDataTable.language, "en"),
              ),
            );
          await tx
            .update(countiesDataTable)
            .set(hu)
            .where(
              and(
                eq(countiesDataTable.countyid, id),
                eq(countiesDataTable.language, "hu"),
              ),
            );
        });
        return "County updated";
      } catch (error) {
        console.error("Error updating county - updateCounty:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Error updating county",
        });
      }
    }),
  getLanguageCountySlug: publicProcedure
    .input(
      z.object({ slug: z.string(), lang: z.string(), nextLang: z.string() }),
    )
    .query(async ({ input: { slug, lang, nextLang }, ctx }) => {
      const countyData = await ctx.db.query.countiesDataTable.findFirst({
        where: and(
          eq(countiesDataTable.slug, slug),
          eq(countiesDataTable.language, lang),
        ),
        columns: {
          countyid: true,
        },
      });
      if (!countyData)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "County data was not found",
        });
      const nextLangCountyData = await ctx.db.query.countiesDataTable.findFirst(
        {
          where: and(
            eq(countiesDataTable.countyid, countyData.countyid),
            eq(countiesDataTable.language, nextLang),
          ),
          columns: {
            slug: true,
          },
        },
      );
      if (!nextLangCountyData)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Next county data was not found",
        });
      return nextLangCountyData.slug;
    }),
});
