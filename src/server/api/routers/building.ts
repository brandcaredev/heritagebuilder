import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const buildingRouter = createTRPCRouter({
  getBuildings: publicProcedure.input(z.undefined()).query(({ ctx }) => {
    const buildings = ctx.db.query.buildings.findMany({
      with: {
        region: {
          columns: {
            name: true,
          },
        },
        country: {
          columns: {
            name: true,
          },
        },
        city: {
          columns: {
            name: true,
          },
        },
      },
    });
    return buildings;
  }),
});
