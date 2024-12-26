import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { and, eq, or, sql } from "drizzle-orm";
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
  citiesTable,
  countiesTable,
} from "@/server/db/schemas";
import { TRPCError } from "@trpc/server";
import { mergeLanguageData } from "@/lib/utils";
import { db } from "@/server/db";

export const buildingRouter = createTRPCRouter({
  getBuildings: publicProcedure
    .input(z.object({ lang: z.string() }))
    .query(async ({ input: { lang } }) => {
      const buildings = await db.query.buildingsTable.findMany({
        with: {
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
                },
              },
            },
            columns: {
              position: false,
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
                },
              },
            },
          },
          city: {
            with: {
              data: {
                where: or(
                  eq(citiesDataTable.language, lang),
                  eq(citiesDataTable.language, "hu"),
                ),
                columns: {
                  name: true,
                  language: true,
                },
              },
            },
            columns: {
              position: false,
            },
          },
          data: {
            // get the requested language and hungarian which is the fallback
            where: or(
              eq(buildingDataTable.language, lang),
              eq(buildingDataTable.language, "hu"),
            ),
          },
        },
      });

      const buildingsMapped = buildings.map((building) => ({
        ...mergeLanguageData(building, lang),
        city: mergeLanguageData(building.city, lang),
        country: mergeLanguageData(building.country, lang),
        county: mergeLanguageData(building.county, lang),
      }));
      return buildingsMapped;
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
        en: BuildingDataInsertSchema.omit({ buildingid: true }).optional(),
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
          if (en) {
            await tx.insert(buildingDataTable).values([
              { ...en, buildingid },
              { ...hu, buildingid },
            ]);
          } else {
            await tx.insert(buildingDataTable).values([{ ...hu, buildingid }]);
          }
        });
        return "Building successfully created";
      } catch (error) {
        console.error("Error creating building - createBuilding:", error);
        throw new Error("Error creating building");
      }
    }),
  getPendingBuildings: publicProcedure.query(async ({ ctx }) => {
    try {
      const buildings = await ctx.db.query.buildingsTable.findMany({
        where: eq(buildingsTable.status, "pending"),
        with: {
          city: {
            with: {
              data: true,
            },
            extras: {
              x: sql<number>`ST_X(${citiesTable.position})`.as("x"),
              y: sql<number>`ST_Y(${citiesTable.position})`.as("y"),
            },
            columns: {
              position: false,
            },
          },
          country: {
            with: {
              data: true,
            },
          },
          county: {
            with: {
              data: true,
            },
            extras: {
              x: sql<number>`ST_X(${countiesTable.position})`.as("x"),
              y: sql<number>`ST_Y(${countiesTable.position})`.as("y"),
            },
            columns: {
              position: false,
            },
          },
          buildingType: {
            with: {
              data: true,
            },
          },
          data: true,
        },
      });

      return buildings.map((building) => ({
        ...building,
        country: {
          ...building.country,
          en: building.country.data.find((d) => d.language === "en"),
          hu: building.country.data.find((d) => d.language === "hu")!,
        },
        city: {
          ...building.city,
          position:
            building.city.x && building.city.y
              ? [building.city.x, building.city.y]
              : null,
          en: building.city.data.find((d) => d.language === "en"),
          hu: building.city.data.find((d) => d.language === "hu")!,
        },
        buildingType: {
          ...building.buildingType,
          en: building.buildingType.data.find((d) => d.language === "en"),
          hu: building.buildingType.data.find((d) => d.language === "hu")!,
        },
        county: {
          ...building.county,
          position:
            building.county.x && building.county.y
              ? [building.county.x, building.county.y]
              : null,
          en: building.county.data.find((d) => d.language === "en"),
          hu: building.county.data.find((d) => d.language === "hu")!,
        },
        en: building.data.find((d) => d.language === "en"),
        hu: building.data.find((d) => d.language === "hu")!,
      }));
    } catch (error) {
      console.error("Error fetching pending buildings:", error);
      throw new Error("Failed to fetch pending buildings");
    }
  }),
  approveBuilding: publicProcedure
    .input(
      z.object({
        id: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        await ctx.db
          .update(buildingsTable)
          .set({ status: "approved" })
          .where(eq(buildingsTable.id, input.id));
        return "Building approved successfully";
      } catch (error) {
        console.error("Error approving building:", error);
        throw new Error("Failed to approve building");
      }
    }),
  updateBuilding: publicProcedure
    .input(
      BuildingSchema.omit({
        createdAt: true,
        updatedAt: true,
      }).extend({
        en: BuildingDataInsertSchema.omit({ buildingid: true }),
        hu: BuildingDataInsertSchema.omit({ buildingid: true }),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { en, hu, id, ...baseData } = input;
      try {
        await ctx.db.transaction(async (tx) => {
          await tx
            .update(buildingsTable)
            .set(baseData)
            .where(sql`${buildingsTable.id} = ${id}`);

          await tx
            .update(buildingDataTable)
            .set(en)
            .where(
              and(
                eq(buildingDataTable.buildingid, id),
                eq(buildingDataTable.language, "en"),
              ),
            );
          await tx
            .update(buildingDataTable)
            .set(hu)
            .where(
              and(
                eq(buildingDataTable.buildingid, id),
                eq(buildingDataTable.language, "hu"),
              ),
            );
        });
        return "Building successfully created";
      } catch (error) {
        console.error("Error creating building - createBuilding:", error);
        throw new Error("Error creating building");
      }
    }),
});
