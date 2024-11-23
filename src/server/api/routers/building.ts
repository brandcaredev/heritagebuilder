import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { and, eq, or } from "drizzle-orm";
import {
  BuildingDataInsertSchema,
  BuildingSchema,
} from "@/server/db/zodSchemaTypes";
import {
  buildingDataTable,
  buildingsTable,
  citiesDataTable,
  countriesDataTable,
  countiesDataTable,
} from "@/server/db/schemas";
import { TRPCError } from "@trpc/server";
import { mergeLanguageData } from "@/lib/utils";

export const buildingRouter = createTRPCRouter({
  getBuildings: publicProcedure
    .input(z.object({ lang: z.string() }))
    .query(async ({ input, ctx }) => {
      const buildings = await ctx.db.query.buildingsTable.findMany({
        with: {
          county: {
            with: {
              data: {
                where: or(
                  eq(countiesDataTable.language, input.lang),
                  eq(countiesDataTable.language, "hu"),
                ),
                columns: {
                  name: true,
                  language: true,
                },
              },
            },
          },
          country: {
            with: {
              data: {
                where: or(
                  eq(countriesDataTable.language, input.lang),
                  eq(countriesDataTable.language, "hu"),
                ),
                columns: {
                  name: true,
                  language: true,
                },
              },
            },
          },
          city: {
            with: {
              data: {
                where: or(
                  eq(citiesDataTable.language, input.lang),
                  eq(citiesDataTable.language, "hu"),
                ),
                columns: {
                  name: true,
                  language: true,
                },
              },
            },
          },
          data: {
            // get the requested language and hungarian which is the fallback
            where: or(
              eq(buildingDataTable.language, input.lang),
              eq(buildingDataTable.language, "hu"),
            ),
          },
        },
      });

      const buildingsMapped = buildings.map((building) => ({
        ...mergeLanguageData(building, input.lang),
        city: mergeLanguageData(building.city, input.lang),
        country: mergeLanguageData(building.country, input.lang),
        county: mergeLanguageData(building.county, input.lang),
      }));

      return buildingsMapped.filter((building) => building !== undefined);
    }),
  getBuildingBySlug: publicProcedure
    .input(z.object({ slug: z.string(), lang: z.string() }))
    .query(async ({ input: { lang, slug }, ctx }) => {
      // first we need the id of the building matching the slug
      const buildingData = await ctx.db.query.buildingDataTable.findFirst({
        where: and(
          eq(buildingDataTable.slug, slug),
          eq(buildingDataTable.language, lang),
        ),
      });
      if (!buildingData) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Building data was not found",
        });
      }
      // using that id we can get the building and the selected + fallback language data
      const building = await ctx.db.query.buildingsTable.findFirst({
        where: eq(buildingsTable.id, buildingData.buildingid),
        with: {
          data: {
            // get the requested language and hungarian which is the fallback
            where: or(
              eq(buildingDataTable.language, lang),
              eq(buildingDataTable.language, "hu"),
            ),
          },
        },
      });
      if (!building)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Building was not found",
        });
      const data = mergeLanguageData(building, lang);
      return data;
    }),
  createBuilding: publicProcedure
    .input(
      BuildingSchema.omit({
        id: true,
        createdAt: true,
        updatedAt: true,
      }).extend({
        en: BuildingDataInsertSchema.omit({ buildingid: true }),
        hu: BuildingDataInsertSchema.omit({ buildingid: true }),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { en, hu, ...baseData } = input;
      try {
        await ctx.db.transaction(async (tx) => {
          const resp = await tx
            .insert(buildingsTable)
            .values([baseData])
            .returning({ buildingid: buildingsTable.id });
          const buildingid = resp[0]?.buildingid!;
          await tx.insert(buildingDataTable).values([
            { ...en, buildingid },
            { ...hu, buildingid },
          ]);
        });
        return "Building successfully created";
      } catch (error) {
        console.error("Error creating building - createBuilding:", error);
        throw new Error("Error creating building");
      }
    }),
});
