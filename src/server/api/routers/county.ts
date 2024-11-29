import { and, eq } from "drizzle-orm";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { countiesDataTable, countiesTable } from "@/server/db/schemas";
import { TRPCError } from "@trpc/server";
import {
  CountyDataInsertSchema,
  CountyInsertSchema,
} from "@/server/db/zodSchemaTypes";

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
  createCounty: publicProcedure
    .input(
      CountyInsertSchema.omit({
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
});
