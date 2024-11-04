import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const buildingTypeRouter = createTRPCRouter({
  getBuildingTypes: publicProcedure.input(z.undefined()).query(({ ctx }) => {
    const buildingTypes = ctx.db.query.buildingTypes.findMany();
    return buildingTypes;
  }),
});
