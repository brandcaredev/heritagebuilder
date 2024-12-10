import { and, eq, or, sql } from "drizzle-orm";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import {
  buildingDataTable,
  buildingsTable,
  countiesDataTable,
  countiesTable,
  countriesDataTable,
} from "@/server/db/schemas";
import {
  CountyDataInsertSchema,
  CountySchema,
} from "@/server/db/zodSchemaTypes";
import { TRPCError } from "@trpc/server";
import { mergeLanguageData } from "@/lib/utils";

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
    .query(async ({ input: { slug, lang }, ctx }) => {
      const countyData = await ctx.db.query.countiesDataTable.findFirst({
        where: and(
          eq(countiesDataTable.slug, slug),
          eq(countiesDataTable.language, lang),
        ),
      });
      if (!countyData)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "County data was not found",
        });
      const county = await ctx.db.query.countiesTable.findFirst({
        where: eq(countiesTable.id, countyData.countyid),
        with: {
          buildings: {
            columns: {
              position: false,
            },
            with: {
              data: {
                where: or(
                  eq(buildingDataTable.language, lang),
                  eq(buildingDataTable.language, "hu"),
                ),
              },
            },
            extras: {
              x: sql<number>`ST_X(${buildingsTable.position})`.as("x"),
              y: sql<number>`ST_Y(${buildingsTable.position})`.as("y"),
            },
          },
          country: {
            with: {
              data: {
                where: or(
                  eq(countriesDataTable.language, lang),
                  eq(countriesDataTable.language, "hu"),
                ),
                columns: {
                  name: true,
                  language: true,
                  slug: true,
                },
              },
            },
          },
          data: {
            where: or(
              eq(countiesDataTable.language, lang),
              eq(countiesDataTable.language, "hu"),
            ),
          },
        },
      });

      if (!county)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "County was not found",
        });

      const countyMapped = {
        ...mergeLanguageData(county, lang),
        buildings: county.buildings.map((building) => {
          const buildingMapped = mergeLanguageData(building, lang);
          return {
            ...buildingMapped,
            position:
              building.x && building.y ? [building.x, building.y] : null,
          };
        }),
        country: mergeLanguageData(county.country, lang),
      };
      return countyMapped;
    }),
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
        let countyid: number | undefined;
        await ctx.db.transaction(async (tx) => {
          const resp = await tx
            .insert(countiesTable)
            .values([baseData])
            .returning({ countyid: countiesTable.id });
          countyid = resp[0]?.countyid;
          if (!countyid) {
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: "Failed to insert county",
            });
          }
          await tx.insert(countiesDataTable).values([
            { ...en, countyid },
            { ...hu, countyid },
          ]);
        });
        return countyid!;
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
});
