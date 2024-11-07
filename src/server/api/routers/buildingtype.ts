import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const buildingTypeRouter = createTRPCRouter({
  getBuildingTypes: publicProcedure
    .input(z.undefined())
    .query(async ({ ctx }) => {
      const buildingTypes = await ctx.db.query.buildingTypesTable.findMany();
      return buildingTypes;
    }),
});
