import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const countryRouter = createTRPCRouter({
  getCountries: publicProcedure.input(z.undefined()).query(({ ctx }) => {
    const countries = ctx.db.query.countries.findMany();
    return countries;
  }),
});
