import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { buildingTypesDataTable } from "@/server/db/schemas";
import { eq, or } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const buildingTypeRouter = createTRPCRouter({
  getBuildingTypes: publicProcedure
    .input(z.object({ lang: z.string() }))
    .query(async ({ ctx, input }) => {
      const buildingTypes = await ctx.db.query.buildingTypesTable.findMany({
        with: {
          data: {
            where: or(
              eq(buildingTypesDataTable.language, input.lang),
              eq(buildingTypesDataTable.language, "hu"),
            ),
          },
        },
      });

      const buildingTypesMapped = buildingTypes.map((buildingType) => {
        const buildingTypeSelectLang = buildingType.data.find(
          (data) => data.language === input.lang,
        );
        const buildingTypeDefaultLang = buildingType.data.find(
          (data) => data.language === "hu",
        );
        if (!buildingTypeDefaultLang) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Building type data was not found",
          });
        }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { data, ...rest } = buildingType;
        return {
          ...rest,
          ...buildingTypeDefaultLang,
          ...buildingTypeSelectLang,
        };
      });

      return buildingTypesMapped;
    }),
});
