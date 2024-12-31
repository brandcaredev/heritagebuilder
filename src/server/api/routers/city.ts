import { and, eq, or, sql } from "drizzle-orm";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import {
  buildingDataTable,
  buildingsTable,
  citiesDataTable,
  citiesTable,
  countiesDataTable,
  countriesDataTable,
} from "@/server/db/schemas";
import { TRPCError } from "@trpc/server";
import {
  CityCreateSchema,
  CityDataInsertSchema,
  CitySchema,
} from "@/server/db/zodSchemaTypes";
import { mergeLanguageData } from "@/lib/utils";

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
    .query(async ({ input: { slug, lang }, ctx }) => {
      const cityData = await ctx.db.query.citiesDataTable.findFirst({
        where: and(
          eq(citiesDataTable.slug, slug),
          eq(citiesDataTable.language, lang),
        ),
      });
      if (!cityData)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "City data was not found",
        });
      const city = await ctx.db.query.citiesTable.findFirst({
        where: eq(citiesTable.id, cityData.cityid),
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
          county: {
            with: {
              data: {
                where: or(
                  eq(countiesDataTable.language, lang),
                  eq(countiesDataTable.language, "hu"),
                ),
                columns: {
                  name: true,
                  language: true,
                  slug: true,
                },
              },
            },
            columns: {
              position: false,
            },
          },
          data: {
            where: or(
              eq(citiesDataTable.language, lang),
              eq(citiesDataTable.language, "hu"),
            ),
          },
        },
      });

      if (!city)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "City was not found",
        });

      const cityMapped = {
        ...mergeLanguageData(city, lang),
        buildings: city.buildings.map((building) => {
          const buildingMapped = mergeLanguageData(building, lang);
          return {
            ...buildingMapped,
            position:
              building.x && building.y ? [building.x, building.y] : null,
          };
        }),
        county: mergeLanguageData(city.county, lang),
        country: mergeLanguageData(city.country, lang),
      };
      return cityMapped;
    }),
  createCity: publicProcedure
    .input(CityCreateSchema)
    .mutation(async ({ input, ctx }) => {
      const { en, hu, ...baseData } = input;
      try {
        let cityid: number | undefined;
        await ctx.db.transaction(async (tx) => {
          const resp = await tx
            .insert(citiesTable)
            .values([baseData])
            .returning({ cityid: citiesTable.id });
          cityid = resp[0]?.cityid;
          if (!cityid) {
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: "Failed to insert city",
            });
          }
          await tx.insert(citiesDataTable).values([
            { ...en, cityid },
            { ...hu, cityid },
          ]);
        });
        return cityid!;
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
});
