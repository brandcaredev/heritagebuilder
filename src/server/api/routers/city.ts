import { and, eq } from "drizzle-orm";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { citiesDataTable, citiesTable } from "@/server/db/schemas";
import { TRPCError } from "@trpc/server";
import {
  CityDataInsertSchema,
  CityInsertSchema,
} from "@/server/db/zodSchemaTypes";

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
  createCity: publicProcedure
    .input(
      CityInsertSchema.omit({
        id: true,
        createdAt: true,
        updatedAt: true,
      }).extend({
        en: CityDataInsertSchema.omit({ cityid: true }),
        hu: CityDataInsertSchema.omit({ cityid: true }),
      }),
    )
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
});
